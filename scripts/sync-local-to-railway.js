#!/usr/bin/env node
/**
 * Sync SQLite (local) → PostgreSQL (Railway)
 * 
 * Usage: DATABASE_URL="postgresql://..." node scripts/sync-local-to-railway.js
 * 
 * Lê leads e fornecedores do SQLite local e insere/sincroniza no PostgreSQL do Railway.
 */

const path = require('path');
const { Pool } = require('pg');

// ─── Config ───────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Defina DATABASE_URL (ex: postgresql://user:pass@host:5432/db)');
  process.exit(1);
}

const SQLITE_PATH = process.env.DB_PATH || path.resolve(__dirname, '..', 'data', 'garagem.db');

// ─── PostgreSQL Schema (mesmo do src/database.js) ─────────
const PG_SCHEMA = `
  CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subdomain TEXT UNIQUE,
    logo TEXT,
    whatsapp TEXT,
    address TEXT,
    settings TEXT DEFAULT '{}',
    ativo INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT DEFAULT '',
    role TEXT DEFAULT 'superadmin',
    avatar TEXT,
    google_id TEXT UNIQUE,
    auth_provider TEXT DEFAULT 'local',
    tenant_id INTEGER REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    message TEXT,
    status TEXT DEFAULT 'lead_qualificado',
    valor REAL DEFAULT 0,
    origem TEXT DEFAULT 'site',
    notas TEXT,
    data_proximo_contato TIMESTAMP,
    ultimo_contato TIMESTAMP,
    responsavel TEXT,
    veiculo TEXT,
    servico_interesse TEXT,
    tenant_id INTEGER REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS estoque (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL,
    imagem TEXT,
    categoria TEXT DEFAULT 'geral',
    quantidade INTEGER DEFAULT 0,
    ativo INTEGER DEFAULT 1,
    tenant_id INTEGER REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    cliente_nome TEXT,
    cliente_whatsapp TEXT,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    forma_pagamento TEXT DEFAULT 'PIX',
    status TEXT DEFAULT 'novo',
    tenant_id INTEGER REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS vagas (
    id SERIAL PRIMARY KEY,
    data DATE UNIQUE NOT NULL,
    vagas INTEGER DEFAULT 3
  );

  CREATE TABLE IF NOT EXISTS ordens_servico (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    lead_id INTEGER,
    numero_os TEXT UNIQUE,
    cliente_nome TEXT NOT NULL,
    cliente_whatsapp TEXT,
    cliente_email TEXT,
    veiculo TEXT NOT NULL,
    placa TEXT,
    km INTEGER,
    servico_desc TEXT,
    status TEXT DEFAULT 'aberta',
    prioridade TEXT DEFAULT 'normal',
    data_entrada TIMESTAMP DEFAULT NOW(),
    data_prevista TIMESTAMP,
    data_saida TIMESTAMP,
    valor_mao_obra REAL DEFAULT 0,
    valor_pecas REAL DEFAULT 0,
    valor_total REAL DEFAULT 0,
    desconto REAL DEFAULT 0,
    forma_pagamento TEXT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS os_itens (
    id SERIAL PRIMARY KEY,
    os_id INTEGER NOT NULL REFERENCES ordens_servico(id),
    tipo TEXT NOT NULL DEFAULT 'servico',
    descricao TEXT NOT NULL,
    quantidade REAL DEFAULT 1,
    valor_unitario REAL DEFAULT 0,
    valor_total REAL DEFAULT 0,
    estoque_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS financeiro (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    os_id INTEGER,
    tipo TEXT NOT NULL DEFAULT 'receita',
    categoria TEXT NOT NULL DEFAULT 'servico',
    descricao TEXT NOT NULL,
    valor REAL NOT NULL DEFAULT 0,
    forma_pagamento TEXT,
    data_vencimento DATE,
    data_pagamento DATE,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS ofertas_prizes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'desconto_pct',
    value REAL NOT NULL DEFAULT 0,
    probability_weight INTEGER NOT NULL DEFAULT 1,
    color TEXT NOT NULL DEFAULT '#0044CC',
    image TEXT,
    ativo INTEGER DEFAULT 1,
    estoque_id INTEGER,
    tenant_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS ofertas_spins (
    id SERIAL PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_whatsapp TEXT NOT NULL,
    prize_id INTEGER,
    prize_name TEXT NOT NULL,
    prize_type TEXT NOT NULL,
    prize_value REAL DEFAULT 0,
    coupon_code TEXT UNIQUE NOT NULL,
    usado INTEGER DEFAULT 0,
    usado_em TIMESTAMP,
    ip_address TEXT,
    tenant_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS fornecedores (
    id SERIAL PRIMARY KEY,
    empresa TEXT DEFAULT '',
    contato TEXT DEFAULT '',
    whatsapp TEXT DEFAULT '',
    email TEXT DEFAULT '',
    endereco TEXT DEFAULT '',
    cnpj TEXT DEFAULT '',
    tenant_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`;

// ─── Helpers ──────────────────────────────────────────────
async function connectPG() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 10000
  });
  // Test connection
  const client = await pool.connect();
  console.log('✅ PostgreSQL conectado');
  client.release();
  return pool;
}

async function readSQLite(table) {
  const Database = require('better-sqlite3');
  const db = new Database(SQLITE_PATH, { readonly: true });
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  db.close();
  return rows;
}

function convertSql(sql) {
  let idx = 0;
  return sql.replace(/\?/g, () => `$${++idx}`);
}

async function upsertLeads(pool, leads) {
  let inserted = 0, skipped = 0, errors = 0;

  for (const lead of leads) {
    try {
      // Check if lead exists by whatsapp
      const exists = await pool.query(
        'SELECT id FROM leads WHERE whatsapp = $1 AND name = $2',
        [lead.whatsapp, lead.name]
      );

      if (exists.rows.length > 0) {
        skipped++;
        continue;
      }

      await pool.query(
        `INSERT INTO leads (name, whatsapp, email, message, status, origem, tenant_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          lead.name,
          lead.whatsapp,
          lead.email || null,
          lead.message || null,
          lead.status || 'lead_qualificado',
          lead.origem || 'importacao',
          lead.tenant_id || 1,
          lead.created_at || new Date().toISOString(),
          new Date().toISOString()
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`  ❌ Erro lead ${lead.name}: ${err.message}`);
      errors++;
    }
  }

  return { inserted, skipped, errors };
}

async function upsertFornecedores(pool, fornecedores) {
  let inserted = 0, skipped = 0, errors = 0;

  for (const f of fornecedores) {
    try {
      // Check by whatsapp + empresa
      const exists = await pool.query(
        'SELECT id FROM fornecedores WHERE whatsapp = $1',
        [f.whatsapp]
      );

      if (exists.rows.length > 0) {
        skipped++;
        continue;
      }

      await pool.query(
        `INSERT INTO fornecedores (empresa, contato, whatsapp, email, endereco, cnpj, tenant_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          f.empresa || '',
          f.contato || '',
          f.whatsapp || '',
          f.email || '',
          f.endereco || '',
          f.cnpj || '',
          f.tenant_id || 1,
          f.created_at || new Date().toISOString(),
          new Date().toISOString()
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`  ❌ Erro fornecedor ${f.empresa || f.contato}: ${err.message}`);
      errors++;
    }
  }

  return { inserted, skipped, errors };
}

// ─── Main ─────────────────────────────────────────────────
async function main() {
  console.log('🔄 Sync SQLite → PostgreSQL (Railway)');
  console.log('=' .repeat(45));

  // 1. Read from SQLite
  console.log('\n📖 Lendo dados do SQLite local...');
  let leads, fornecedores;
  try {
    leads = await readSQLite('leads');
    console.log(`   Leads: ${leads.length} encontrados`);
  } catch (e) {
    console.log(`   Leads: 0 (tabela não encontrada: ${e.message})`);
    leads = [];
  }

  try {
    fornecedores = await readSQLite('fornecedores');
    console.log(`   Fornecedores: ${fornecedores.length} encontrados`);
  } catch (e) {
    console.log(`   Fornecedores: 0 (tabela não encontrada: ${e.message})`);
    fornecedores = [];
  }

  if (leads.length === 0 && fornecedores.length === 0) {
    console.log('\n⚠️  Nenhum dado para sincronizar.');
    process.exit(0);
  }

  // 2. Connect to PostgreSQL
  console.log('\n🔌 Conectando ao PostgreSQL (Railway)...');
  let pool;
  try {
    pool = await connectPG();
  } catch (err) {
    console.error(`❌ Falha na conexão PostgreSQL: ${err.message}`);
    console.error('   Verifique se a DATABASE_URL está correta e se o Railway está acessível.');
    process.exit(1);
  }

  // 3. Ensure tables exist
  console.log('\n🏗️  Garantindo tabelas no PostgreSQL...');
  try {
    await pool.query(PG_SCHEMA);
    console.log('   Tabelas criadas/verificadas ✅');
  } catch (err) {
    console.error(`   ⚠️  Erro ao criar tabelas: ${err.message}`);
    console.error('   Continuando mesmo assim...');
  }

  // 4. Sync leads
  if (leads.length > 0) {
    console.log(`\n📤 Sincronizando ${leads.length} leads...`);
    const result = await upsertLeads(pool, leads);
    console.log(`   ✅ Inseridos: ${result.inserted}`);
    console.log(`   ⏭️  Duplicados: ${result.skipped}`);
    if (result.errors > 0) console.log(`   ❌ Erros: ${result.errors}`);
  }

  // 5. Sync fornecedores
  if (fornecedores.length > 0) {
    console.log(`\n📤 Sincronizando ${fornecedores.length} fornecedores...`);
    const result = await upsertFornecedores(pool, fornecedores);
    console.log(`   ✅ Inseridos: ${result.inserted}`);
    console.log(`   ⏭️  Duplicados: ${result.skipped}`);
    if (result.errors > 0) console.log(`   ❌ Erros: ${result.errors}`);
  }

  // 6. Verify
  console.log('\n🔍 Verificando dados no PostgreSQL...');
  try {
    const leadCount = await pool.query('SELECT COUNT(*)::int AS total FROM leads');
    console.log(`   📊 Total leads no PostgreSQL: ${leadCount.rows[0].total}`);

    const fornCount = await pool.query('SELECT COUNT(*)::int AS total FROM fornecedores');
    console.log(`   📊 Total fornecedores no PostgreSQL: ${fornCount.rows[0].total}`);
  } catch (err) {
    console.log(`   ⚠️  Verificação: ${err.message}`);
  }

  // 7. Cleanup
  await pool.end();
  console.log('\n' + '=' .repeat(45));
  console.log('✅ Sincronização concluída!');
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
