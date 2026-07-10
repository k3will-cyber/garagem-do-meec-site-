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

  console.log(`[DB] SQLite: ${isMemory ? ':memory:' : dbPath}`);

  return {
    type: 'sqlite',

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
function createPostgresAdapter(connectionString) {
  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  pool.on('error', (err) => {
    console.error('[DB] Erro inesperado no pool PostgreSQL:', err.message);
  });

  return {
    type: 'postgres',

    async all(sql, params = []) {
      const { rows } = await pool.query(convertSql(sql), params);
      return rows;
    },

    async get(sql, params = []) {
      const { rows } = await pool.query(convertSql(sql), params);
      return rows[0] || null;
    },

    async run(sql, params = []) {
      const isInsert = /^\s*INSERT\s/i.test(sql.trim());
      const query = isInsert ? convertSql(sql) + ' RETURNING id' : convertSql(sql);
      const result = await pool.query(query, params);
      return {
        changes: result.rowCount,
        lastInsertRowid: isInsert && result.rows[0] ? result.rows[0].id : undefined
      };
    },

    async exec(sql) {
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const stmt of statements) {
        await pool.query(stmt);
      }
    },

    async close() {
      await pool.end();
    }
  };
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
