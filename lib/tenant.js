/**
 * Middleware de detecção de Tenant para arquitetura multi-tenant.
 *
 * Suporta dois modos:
 * 1. Subdomínio: tenant.sistema.com → detecta 'tenant'
 * 2. Header: X-Tenant-Slug ou X-Tenant-ID
 *
 * Para desenvolvimento local sem subdomínio, usa o tenant padrão.
 */

function createTenantMiddleware(db) {
  // Cache de tenants para evitar consultas repetidas
  let tenantCache = null;
  let cacheTime = 0;
  const CACHE_TTL = 60000; // 1 minuto

  function getTenants() {
    const now = Date.now();
    if (!tenantCache || now - cacheTime > CACHE_TTL) {
      tenantCache = db.prepare('SELECT id, slug, subdomain, name, logo, whatsapp, address, settings, ativo FROM tenants WHERE ativo = 1').all();
      cacheTime = now;
    }
    return tenantCache;
  }

  function getTenantBySlug(slug) {
    const tenants = getTenants();
    return tenants.find(t => t.slug === slug) || null;
  }

  function getTenantBySubdomain(subdomain) {
    const tenants = getTenants();
    return tenants.find(t => t.subdomain === subdomain) || null;
  }

  function getDefaultTenant() {
    const tenants = getTenants();
    return tenants.length > 0 ? tenants[0] : null;
  }

  // Express middleware
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
      req.tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(parseInt(headerId));
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
    // Extrai subdomínio se houver mais de 2 partes
    // Ex: meec.localhost:3000 → slug = 'meec'
    // Ex: meec.meusistema.com → slug = 'meec'
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
    getTenants,
    getTenantBySlug,
    getDefaultTenant,
    refreshCache: () => { tenantCache = null; cacheTime = 0; }
  };
}

module.exports = { createTenantMiddleware };
