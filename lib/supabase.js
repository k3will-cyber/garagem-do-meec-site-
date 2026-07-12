/**
 * Supabase Sync Service — Garagem do MEEC
 * 
 * Sincroniza leads do SQLite local para o Supabase Postgres.
 * Ativa via variável de ambiente: SUPABASE_URL, SUPABASE_ANON_KEY
 */

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase = null;
let supabaseAdmin = null;
let _createClient = null;

// Lazy load @supabase/supabase-js para não travar o servidor se não estiver instalado
function getCreateClient() {
  if (_createClient === null) {
    try {
      _createClient = require('@supabase/supabase-js').createClient;
    } catch (e) {
      console.warn('⚠️ @supabase/supabase-js não disponível:', e.message);
      _createClient = false; // cache the failure
    }
  }
  return _createClient || null;
}

function isConfigured() {
  return !!(SUPABASE_URL && (SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY));
}

function getClient() {
  if (!supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    const createClient = getCreateClient();
    if (createClient) supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

function getAdminClient() {
  if (!supabaseAdmin && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    const createClient = getCreateClient();
    if (createClient) supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseAdmin;
}

/**
 * Ensure Supabase tables exist (idempotent)
 */
async function ensureTables() {
  if (!isConfigured()) return false;
  const client = getAdminClient() || getClient();
  if (!client) return false;

  try {
    // Try to create leads table via raw SQL (needs service_role key)
    if (getAdminClient()) {
      const { error } = await client.rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS leads (
            id BIGINT PRIMARY KEY,
            name TEXT NOT NULL,
            whatsapp TEXT NOT NULL,
            email TEXT,
            message TEXT,
            status TEXT DEFAULT 'lead_qualificado',
            valor DECIMAL(10,2) DEFAULT 0,
            origem TEXT DEFAULT 'site',
            notas TEXT,
            data_proximo_contato TIMESTAMPTZ,
            ultimo_contato TIMESTAMPTZ,
            responsavel TEXT DEFAULT 'Pablo Jhonatan',
            veiculo TEXT,
            servico_interesse TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      });
      if (error) {
        // Fallback: table might already exist or function doesn't exist
        console.log('ℹ️  Supabase table setup (non-critical):', error.message);
      }
    }
    return true;
  } catch (err) {
    console.log('⚠️  Supabase table setup skipped:', err.message);
    return false;
  }
}

/**
 * Sync a single lead to Supabase
 */
async function syncLead(lead) {
  if (!isConfigured()) return;
  const client = getAdminClient() || getClient();
  if (!client) return;

  try {
    const { error } = await client
      .from('leads')
      .upsert({
        id: lead.id,
        name: lead.name,
        whatsapp: lead.whatsapp,
        email: lead.email || null,
        message: lead.message || null,
        status: lead.status || 'lead_qualificado',
        valor: lead.valor || 0,
        origem: lead.origem || 'site',
        notas: lead.notas || null,
        data_proximo_contato: lead.data_proximo_contato || null,
        ultimo_contato: lead.ultimo_contato || null,
        responsavel: lead.responsavel || 'Pablo Jhonatan',
        veiculo: lead.veiculo || null,
        servico_interesse: lead.servico_interesse || null,
        created_at: lead.created_at,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('❌ Supabase sync error:', error.message);
    }
  } catch (err) {
    console.error('❌ Supabase sync exception:', err.message);
  }
}

/**
 * Sync all leads to Supabase
 */
async function syncAllLeads(db) {
  if (!isConfigured()) return;
  try {
    const leads = db.prepare('SELECT * FROM leads').all();
    for (const lead of leads) {
      await syncLead(lead);
    }
    console.log(`✅ Synced ${leads.length} leads to Supabase`);
  } catch (err) {
    console.error('❌ Supabase bulk sync error:', err.message);
  }
}

/**
 * Delete a lead from Supabase
 */
async function deleteLead(id) {
  if (!isConfigured()) return;
  const client = getAdminClient() || getClient();
  if (!client) return;

  try {
    await client.from('leads').delete().eq('id', id);
  } catch (err) {
    console.error('❌ Supabase delete error:', err.message);
  }
}

module.exports = {
  isConfigured,
  ensureTables,
  syncLead,
  syncAllLeads,
  deleteLead
};
