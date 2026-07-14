/**
 * Database Adapter Factory
 *
 * Creates a database adapter with a consistent async API:
 *   - db.all(sql, params) → returns all rows
 *   - db.get(sql, params) → returns first row or null
 *   - db.run(sql, params) → returns { changes, lastInsertRowid }
 *   - db.exec(sql)        → execute raw SQL (DDL)
 *   - db.close()          → close the connection
 *
 * Works with both:
 *   - better-sqlite3 (development, local SQLite)
 *   - pg (production, PostgreSQL via DATABASE_URL)
 */

const path = require('path');
const fs = require('fs');

/**
 * Create a database adapter based on environment
 * - If DATABASE_URL is set → PostgreSQL (production)
 * - Otherwise → SQLite (development)
 */
function createDatabase() {
  if (process.env.DATABASE_URL) {
    console.log('[DB] Conectando ao PostgreSQL...');
    return createPostgresAdapter(process.env.DATABASE_URL);
  }
  console.log('[DB] Usando SQLite local...');
  return createSQLiteAdapter();
}

/**
 * SQLite adapter wrapping better-sqlite3
 */
function createSQLiteAdapter() {
  const Database = require('better-sqlite3');
  const dbPath = process.env.DB_PATH || path.resolve(__dirname, '..', 'data', 'garagem.db');
  const isMemory = dbPath === ':memory:';

  if (!isMemory) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = isMemory
    ? new Database(':memory:')
    : new Database(dbPath);

  if (!isMemory) {
    db.pragma('journal_mode = WAL');
  }
  db.pragma('foreign_keys = ON');

  // Auto-create schema on startup
  try {
    db.exec(SQLITE_SCHEMA);
    db.exec(SQLITE_SEED);
    // Ensure default tenant exists (belt-and-suspenders)
    const existing = db.prepare('SELECT id FROM tenants WHERE id = 1').get();
    if (!existing) {
      db.exec("INSERT INTO tenants (id,name,slug,subdomain,whatsapp,address,ativo) VALUES (1,'Garagem do MEEC','garagem-meec','garagem','(61) 98125-7477','Valparaíso de Goiás, GO',1)");
      db.exec("INSERT INTO users (id,username,password,name,email,role,tenant_id) VALUES (1,'admin','$2a$10$8K1p/a0dR1xqM8K3hQv1aOQJQZZlLBhVNM6YRi6v9UQlJkHnFmKGe','Pablo Jhonatan','pablo@garagemmeec.com.br','superadmin',1)");
      console.log('[DB] Tenant padrão criado (SQLite)');
    }
    console.log('[DB] Schema SQLite inicializado com sucesso');
  } catch (err) {
    console.error('[DB] Erro ao inicializar schema SQLite:', err.message);
  }

  console.log(`[DB] SQLite: ${isMemory ? ':memory:' : dbPath}`);

  return {
    type: 'sqlite',

    async initSchema() {
      // Schema already created above — no-op for consistency with PostgreSQL
    },

    async all(sql, params = []) {
      return db.prepare(sql).all(...params);
    },

    async get(sql, params = []) {
      return db.prepare(sql).get(...params) || null;
    },

    async run(sql, params = []) {
      const result = db.prepare(sql).run(...params);
      return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
    },

    async exec(sql) {
      db.exec(sql);
    },

    async close() {
      db.close();
    }
  };
}

/**
 * PostgreSQL adapter wrapping pg
 */
/**
 * PostgreSQL schema (adapted from SQLite install.js for PostgreSQL syntax)
 */
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

  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
  CREATE INDEX IF NOT EXISTS idx_os_tenant ON ordens_servico(tenant_id);
  CREATE INDEX IF NOT EXISTS idx_financeiro_tenant ON financeiro(tenant_id);
`;

/**
 * SQLite schema — same structure as PG_SCHEMA but SQLite syntax.
 * Auto-created on first launch if tables don't exist.
 */
const SQLITE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subdomain TEXT UNIQUE,
    logo TEXT,
    whatsapp TEXT,
    address TEXT,
    settings TEXT DEFAULT '{}',
    ativo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT DEFAULT '',
    role TEXT DEFAULT 'superadmin',
    avatar TEXT,
    google_id TEXT UNIQUE,
    auth_provider TEXT DEFAULT 'local',
    tenant_id INTEGER REFERENCES tenants(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    message TEXT,
    status TEXT DEFAULT 'lead_qualificado',
    valor REAL DEFAULT 0,
    origem TEXT DEFAULT 'site',
    notas TEXT,
    data_proximo_contato DATETIME,
    ultimo_contato DATETIME,
    responsavel TEXT,
    veiculo TEXT,
    servico_interesse TEXT,
    tenant_id INTEGER REFERENCES tenants(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL,
    imagem TEXT,
    categoria TEXT DEFAULT 'geral',
    quantidade INTEGER DEFAULT 0,
    ativo INTEGER DEFAULT 1,
    tenant_id INTEGER REFERENCES tenants(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_nome TEXT,
    cliente_whatsapp TEXT,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    forma_pagamento TEXT DEFAULT 'PIX',
    status TEXT DEFAULT 'novo',
    tenant_id INTEGER REFERENCES tenants(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vagas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data DATE UNIQUE NOT NULL,
    vagas INTEGER DEFAULT 3
  );

  CREATE TABLE IF NOT EXISTS ordens_servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    data_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_prevista DATETIME,
    data_saida DATETIME,
    valor_mao_obra REAL DEFAULT 0,
    valor_pecas REAL DEFAULT 0,
    valor_total REAL DEFAULT 0,
    desconto REAL DEFAULT 0,
    forma_pagamento TEXT,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS os_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    os_id INTEGER NOT NULL REFERENCES ordens_servico(id),
    tipo TEXT NOT NULL DEFAULT 'servico',
    descricao TEXT NOT NULL,
    quantidade REAL DEFAULT 1,
    valor_unitario REAL DEFAULT 0,
    valor_total REAL DEFAULT 0,
    estoque_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS financeiro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ofertas_prizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ofertas_spins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    client_whatsapp TEXT NOT NULL,
    prize_id INTEGER,
    prize_name TEXT NOT NULL,
    prize_type TEXT NOT NULL,
    prize_value REAL DEFAULT 0,
    coupon_code TEXT UNIQUE NOT NULL,
    usado INTEGER DEFAULT 0,
    usado_em DATETIME,
    ip_address TEXT,
    tenant_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
  CREATE INDEX IF NOT EXISTS idx_os_tenant ON ordens_servico(tenant_id);
  CREATE INDEX IF NOT EXISTS idx_financeiro_tenant ON financeiro(tenant_id);
`;

/** Seed data for SQLite — tenant + admin user */
const SQLITE_SEED = `
  INSERT OR IGNORE INTO tenants (id, name, slug, subdomain, whatsapp, address, ativo)
  VALUES (1, 'Garagem do MEEC', 'garagem-meec', 'garagem', '(61) 98125-7477', 'Valparaíso de Goiás, GO', 1);

  INSERT OR IGNORE INTO users (id, username, password, name, email, role, tenant_id)
  VALUES (1, 'admin', '$2a$10$8K1p/a0dR1xqM8K3hQv1aOQJQZZlLBhVNM6YRi6v9UQlJkHnFmKGe', 'Pablo Jhonatan', 'pablo@garagemmeec.com.br', 'superadmin', 1);
`;

/**
 * Try to connect with optional SSL, fallback to without SSL
 */
async function createPool(connectionString) {
  const { Pool } = require('pg');

  // Try with SSL first (Railway PostgreSQL plugin / production PG)
  for (const ssl of [{ rejectUnauthorized: false }, false]) {
    try {
      const pool = new Pool({
        connectionString,
        ssl,
        max: 5,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000
      });
      // Test connection
      const client = await pool.connect();
      client.release();
      console.log(`[DB] PostgreSQL conectado (ssl: ${ssl !== false})`);
      return pool;
    } catch (err) {
      console.log(`[DB] SSL=${ssl !== false} falhou: ${err.message}`);
    }
  }

  // Last attempt: no SSL, simple pool
  console.log('[DB] PostgreSQL conectando sem SSL...');
  return new Pool({
    connectionString,
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
}

function createPostgresAdapter(connectionString) {
  let pool;
  let schemaInitialized = false;

  const adapter = {
    type: 'postgres',

    async ensurePool() {
      if (!pool) {
        pool = await createPool(connectionString);
        pool.on('error', (err) => {
          console.error('[DB] Erro inesperado no pool PostgreSQL:', err.message);
        });
      }
      return pool;
    },

    async initSchema() {
      if (schemaInitialized) return;
      const p = await adapter.ensurePool();
      try {
        console.log('[DB] Inicializando schema PostgreSQL...');
        await p.query(PG_SCHEMA);
        // Ensure default tenant exists
        const { rows } = await p.query('SELECT id FROM tenants WHERE id = 1');
        if (rows.length === 0) {
          await p.query("INSERT INTO tenants (id,name,slug,subdomain,whatsapp,address,ativo) VALUES (1,'Garagem do MEEC','garagem-meec','garagem','(61) 98125-7477','Valparaíso de Goiás, GO',1)");
          await p.query("INSERT INTO users (id,username,password,name,email,role,tenant_id) VALUES (1,'admin','$2a$10$8K1p/a0dR1xqM8K3hQv1aOQJQZZlLBhVNM6YRi6v9UQlJkHnFmKGe','Pablo Jhonatan','pablo@garagemmeec.com.br','superadmin',1)");
          console.log('[DB] Tenant padrão criado (PostgreSQL)');
        }
        console.log('[DB] Schema PostgreSQL inicializado');
        schemaInitialized = true;
      } catch (err) {
        console.error('[DB] Erro ao inicializar schema:', err.message);
      }
    },

    async all(sql, params = []) {
      const p = await adapter.ensurePool();
      const { rows } = await p.query(convertSql(sql), params);
      return rows;
    },

    async get(sql, params = []) {
      const p = await adapter.ensurePool();
      const { rows } = await p.query(convertSql(sql), params);
      return rows[0] || null;
    },

    async run(sql, params = []) {
      const p = await adapter.ensurePool();
      const isInsert = /^\s*INSERT\s/i.test(sql.trim());
      const query = isInsert ? convertSql(sql) + ' RETURNING id' : convertSql(sql);
      const result = await p.query(query, params);
      return {
        changes: result.rowCount,
        lastInsertRowid: isInsert && result.rows[0] ? result.rows[0].id : undefined
      };
    },

    async exec(sql) {
      const p = await adapter.ensurePool();
      const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const stmt of statements) {
        await p.query(stmt);
      }
    },

    async close() {
      if (pool) await pool.end();
    }
  };

  return adapter;
}

/**
 * Convert SQLite ? placeholders to PostgreSQL $1, $2, $3 style
 * Also convert datetime('now') to NOW()
 */
function convertSql(sql) {
  let index = 0;
  let result = sql.replace(/\?/g, () => `$${++index}`);
  result = result.replace(/datetime\(['"]now['"]\)/gi, 'NOW()');
  return result;
}

module.exports = { createDatabase };
