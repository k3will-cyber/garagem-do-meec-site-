#!/usr/bin/env node
/**
 * Garagem do MEEC — Seed Script
 * 
 * This script is only needed for manual re-seeding.
 * On first run, server.js auto-seeds the admin user and default products.
 * 
 * Usage: node seed.js
 *        ADMIN_USERNAME=admin ADMIN_PASSWORD=admin123 node seed.js
 */

const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Pablo Jhonatan';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'garagem.db');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS vagas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data DATE UNIQUE NOT NULL,
    vagas INTEGER DEFAULT 3
  );
`);

// Create admin user
if (!db.prepare('SELECT id FROM users WHERE username = ?').get(ADMIN_USERNAME)) {
  const hashed = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)')
    .run(ADMIN_USERNAME, hashed, ADMIN_NAME, 'admin');
  console.log(`✅ Admin created: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
} else {
  console.log(`ℹ️  Admin "${ADMIN_USERNAME}" already exists`);
}

// Seed products
if (db.prepare('SELECT COUNT(*) as c FROM estoque').get().c === 0) {
  const insert = db.prepare('INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade) VALUES (?, ?, ?, ?, ?, ?)');
  const products = [
    ['Kit de Reparos Volkswagen', 'Kit completo para revisão básica VW — filtros, velas e componentes.', 89.90, 'media/kit-reparos-volks.jpeg', 'kit', 10],
    ['Kit de Reparos Gol', 'Kit específico para VW Gol — pastilhas de freio, óleo e filtros.', 79.90, 'media/kit-reparos-gol.jpeg', 'kit', 8],
    ['Kit de Reparos Geral', 'Kit universal para manutenção preventiva.', 69.90, 'media/kit-reparos.jpeg', 'kit', 15],
    ['Troca de Óleo Completa', 'Óleo sintético + filtro premium + mão de obra.', 180.00, 'media/troca-oleo.jpg', 'servico', 20],
  ];
  for (const p of products) insert.run(...p);
  console.log(`✅ ${products.length} produtos adicionados`);
} else {
  console.log('ℹ️  Produtos já existem');
}

console.log('\n✅ Seed concluído!');
console.log(`   DB: ${DB_PATH}`);
