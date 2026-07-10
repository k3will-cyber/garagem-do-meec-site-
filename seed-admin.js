#!/usr/bin/env node
/**
 * Seed script to create an admin user for local development.
 * Uses the application's AuthRepository to ensure schema compatibility.
 */

const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env if present
require('dotenv').config();

const Database = require('better-sqlite3');

// Initialize database
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'garagem.db');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Import our AuthRepository
const AuthRepository = require('./src/repositories/authRepository');
const authRepository = new AuthRepository(db);

// Ensure database schema is up to date
function initializeDatabaseSchema() {
  try {
    // Add last_login_at column to users table if it doesn't exist
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasLastLogin = tableInfo.some(col => col.name === 'last_login_at');

    if (!hasLastLogin) {
      db.prepare('ALTER TABLE users ADD COLUMN last_login_at DATETIME').run();
      console.log('✅ Added last_login_at column to users table');
    }

    // Ensure other tables exist (from original seed)
    db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        email TEXT,
        message TEXT,
        origem TEXT DEFAULT 'site',
        veiculo TEXT,
        servico_interesse TEXT,
        status TEXT DEFAULT 'lead_qualificado',
        valor REAL DEFAULT 0,
        notas TEXT,
        data_proximo_contato DATETIME,
        ultimo_contato DATETIME,
        responsavel TEXT DEFAULT 'Pablo Jhonatan',
        tenant_id INTEGER DEFAULT 1,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database schema initialized/updated');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error.message);
  }
}

async function seedAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Pablo Jhonatan';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@garagem.com.br';

  try {
    // Initialize database schema
    initializeDatabaseSchema();

    // Check if admin user already exists
    const existingUser = authRepository.findByIdentifier(adminUsername);
    if (existingUser) {
      console.log(`ℹ️  Admin user "${adminUsername}" already exists (ID: ${existingUser.id})`);

      // Update password if needed (optional - uncomment if you want to always update)
      // const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      // authRepository.update(existingUser.id, { password: hashedPassword });
      // console.log(`🔑 Updated password for user "${adminUsername}"`);
      return;
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);

    // Create admin user
    const result = authRepository.create({
      username: adminUsername,
      password: hashedPassword,
      name: adminName,
      email: adminEmail,
      role: 'admin', // Admin role
      avatar: null,
      google_id: null,
      auth_provider: 'local',
      tenant_id: 1 // Default tenant ID
    });

    const adminUser = authRepository.findById(result.lastInsertRowid);
    console.log(`✅ Admin user created:`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Tenant ID: ${adminUser.tenant_id}`);
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

seedAdmin();