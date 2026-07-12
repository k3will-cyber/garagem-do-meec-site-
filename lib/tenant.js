/**
 * Middleware de detecção de Tenant para arquitetura multi-tenant.
 *
 * Suporta dois modos:
 * 1. Subdomínio: tenant.sistema.com → detecta 'tenant'
 * 2. Header: X-Tenant-Slug ou X-Tenant-ID
 *
 * Para desenvolvimento local sem subdomínio, usa o tenant padrão.
 *
 * O cache é populado na inicialização e atualizado em background
 * para manter a compatibilidade com middleware síncrono do Express 4.
 */

function createTenantMiddleware(db) {
  let tenantCache = [];
  let cacheTime = 0;
  const CACHE_TTL = 60000; // 1 minuto
  let refreshTimer = null;

  /**
   * Load tenants from database into cache
   */
  async function loadTenants() {
    try {
      tenantCache = await db.all(
        'SELECT id, slug, subdomain, name, logo, whatsapp, address, settings, ativo FROM tenants WHERE ativo = 1'
      ) || [];
      cacheTime = Date.now();
    } catch (err) {
      console.error('[Tenant] Erro ao carregar tenants:', err.message);
    }
  }

  /**
   * Initialize cache and start background refresh
   */
  async function init() {
    await loadTenants();
    // Refresh cache periodically
    refreshTimer = setInterval(loadTenants, CACHE_TTL);
    if (tenantCache.length > 0) {
      console.log(`[Tenant] ${tenantCache.length} tenant(s) carregado(s) — ${tenantCache[0].name}`);
    } else {
      console.log('[Tenant] Nenhum tenant encontrado — execute o seed primeiro');
    }
  }

  /**
   * Get cached tenants (synchronous — safe for Express 4 middleware)
   */
  function getTenants() {
    return tenantCache;
  }

  function getTenantBySlug(slug) {
    return tenantCache.find(t => t.slug === slug) || null;
  }

  function getTenantBySubdomain(subdomain) {
    return tenantCache.find(t => t.subdomain === subdomain) || null;
  }

  function getDefaultTenant() {
    return tenantCache.length > 0 ? tenantCache[0] : null;
  }

  // Express middleware (synchronous, uses cache)
  function tenantMiddleware(req, res, next) {
    // 1. Tentar detectar por header (útil para API clients)
    const headerSlug = req.headers['x-tenant-slug'];
    if (headerSlug) {
      const tenant = getTenantBySlug(headerSlug);
      if (tenant) {
        req.tenantId = tenant.id;
        req.tenant = tenant;
        return next();
      }
    }

    const headerId = req.headers['x-tenant-id'];
    if (headerId) {
      req.tenantId = parseInt(headerId);
      req.tenant = tenantCache.find(t => t.id === parseInt(headerId)) || null;
      if (req.tenant) return next();
    }

    // 2. Tentar detectar por query param (útil para testes)
    const querySlug = req.query['_tenant'];
    if (querySlug) {
      const tenant = getTenantBySlug(querySlug);
      if (tenant) {
        req.tenantId = tenant.id;
        req.tenant = tenant;
        return next();
      }
    }

    // 3. Tentar detectar por subdomínio (em produção)
    const host = req.headers['host'] || '';
    const parts = host.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0].toLowerCase();
      const tenant = getTenantBySubdomain(subdomain);
      if (tenant) {
        req.tenantId = tenant.id;
        req.tenant = tenant;
        return next();
      }
    }

    // 4. Fallback: tenant padrão
    const defaultTenant = getDefaultTenant();
    if (defaultTenant) {
      req.tenantId = defaultTenant.id;
      req.tenant = defaultTenant;
      return next();
    }

    // Sem tenant nenhum — erro crítico
    res.status(500).json({ error: 'Nenhum tenant configurado. Execute a instalação primeiro.' });
  }

  return {
    middleware: tenantMiddleware,
    init,
    getTenants,
    getTenantBySlug,
    getDefaultTenant,
    refreshCache: async () => { await loadTenants(); }
  };
}

module.exports = { createTenantMiddleware };
