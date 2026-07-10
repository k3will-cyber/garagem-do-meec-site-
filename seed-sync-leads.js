#!/usr/bin/env node
/**
 * Sync existing MEEC leads to CRM crm_leads table
 * One-time migration script
 *
 * Run: cd garagem-do-mec-site && node seed-sync-leads.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'garagem.db');

if (!fs.existsSync(DB_PATH)) {
  console.error('❌ Database not found:', DB_PATH);
  process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

console.log('📦 Conectado ao banco:', DB_PATH);

// Get all MEEC leads
const meecLeads = db.prepare('SELECT * FROM leads ORDER BY id').all();
console.log(`📋 Leads encontrados no MEEC: ${meecLeads.length}`);

// Get all CRM leads for deduplication
const existingPhones = new Set(
  db.prepare("SELECT phone FROM crm_leads WHERE phone != '' AND phone IS NOT NULL").all().map(r => r.phone)
);

console.log(`📋 Leads existentes no CRM: ${existingPhones.size} (com telefone)`);

// Status mapping (MEEC → CRM)
const statusMap = {
  'lead_qualificado': 'new',
  'lead_prospectado': 'contacted',
  'orcamento_ativo': 'quoted',
  'orcamento_fechado': 'won',
  'orcamento_finalizado': 'won',
  'new': 'new',
  'contacted': 'contacted',
  'quoted': 'quoted',
  'won': 'won',
  'lost': 'lost'
};

let synced = 0;
let skipped = 0;

const insertStmt = db.prepare(`
  INSERT INTO crm_leads (name, phone, email, source, status, estimatedValue, notes, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

const transaction = db.transaction(() => {
  for (const lead of meecLeads) {
    const phone = lead.whatsapp || '';
    const name = lead.name || '';
    const email = lead.email || '';
    const message = lead.message || '';
    const origem = lead.origem || 'site';
    const status = statusMap[lead.status] || 'new';
    const valor = lead.valor || 0;
    const createdStr = lead.created_at || new Date().toISOString();

    // Skip if phone already exists in CRM
    if (phone && existingPhones.has(phone)) {
      skipped++;
      continue;
    }

    insertStmt.run(
      name,
      phone,
      email,
      origem,
      status,
      valor,
      message,
      createdStr
    );

    synced++;
    existingPhones.add(phone); // Prevent duplicates within this batch
  }
});

transaction();

console.log('');
console.log('✅ Sincronização concluída!');
console.log(`  ➜ ${synced} leads sincronizados do MEEC → CRM`);
console.log(`  ➜ ${skipped} leads pulados (já existem no CRM)`);

// Verify
const totalCrm = db.prepare('SELECT COUNT(*) as c FROM crm_leads').get().c;
console.log(`  ➜ Total no CRM agora: ${totalCrm} leads`);

db.close();
