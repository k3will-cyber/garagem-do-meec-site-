#!/usr/bin/env node
/**
 * Script para importar fornecedores da lista do WhatsApp para o banco SQLite
 * Uso: node scripts/importar-fornecedores.js
 *
 * Formato esperado (bloco contínuo por fornecedor):
 *   [Company Name (optional first line)]
 *   Contato: NOME_CONTATO
 *   TELEFONE
 *   [EMAIL (opcional, contém @)]
 *   [ENDEREÇO (opcional)]
 *   X peça(s) vinculada(s)
 *   NOME_EMPRESA
 *   CNPJ: XX.XXX.XXX/XXXX-XX (opcional)
 *   (linha vazia)
 */

const fs = require('fs');
const path = require('path');
const { createDatabase } = require('../src/database');

function cleanPhone(raw) {
  if (!raw) return '';
  return raw.replace(/\D/g, '');
}

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}

function isContatoLine(str) {
  return /^Contato:\s*/i.test(str.trim());
}

function isPecasVinculadas(str) {
  return /peça/i.test(str);
}

function extractContatoName(str) {
  return str.replace(/^Contato:\s*/i, '').trim();
}

function isCNPJLine(str) {
  return /^CNPJ:/i.test(str.trim());
}

function extractCNPJ(str) {
  const match = str.trim().match(/[\d\.\/\-]+/);
  return match ? match[0] : '';
}

async function main() {
  const rawPath = path.join(__dirname, '..', 'fornecedores_raw.txt');
  if (!fs.existsSync(rawPath)) {
    console.error('❌ Arquivo fornecedores_raw.txt não encontrado!');
    process.exit(1);
  }

  const content = fs.readFileSync(rawPath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const suppliers = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip the first header line if it starts with *
    if (line.startsWith('*')) { i++; continue; }

    // Look for "Contato:" line to start a new supplier entry
    if (!isContatoLine(line)) { i++; continue; }

    // Extract contact name
    const contato = extractContatoName(line);
    i++;

    // Next line should be phone
    if (i >= lines.length) break;
    let phone = cleanPhone(lines[i]);
    if (phone.length < 10) { i++; continue; }
    i++;

    // Next: could be email, address, or pecas vinculadas
    let email = '';
    let endereco = '';

    if (i < lines.length) {
      const next = lines[i];
      if (isEmail(next)) {
        email = next;
        i++;
      }
    }

    // Next: could be address
    if (i < lines.length) {
      const next = lines[i];
      if (!isPecasVinculadas(next) && !isCNPJLine(next) && !isContatoLine(next)) {
        endereco = next;
        i++;
      }
    }

    // Skip "X peca(s) vinculada(s)"
    if (i < lines.length && isPecasVinculadas(lines[i])) {
      i++;
    }

    // Company name (skip markers like * and single chars)
    let empresa = '';
    if (i < lines.length && !isCNPJLine(lines[i]) && !isContatoLine(lines[i]) && lines[i].length > 2 && !lines[i].startsWith('*')) {
      empresa = lines[i];
      i++;
    }

    // CNPJ (optional)
    let cnpj = '';
    if (i < lines.length && isCNPJLine(lines[i])) {
      cnpj = extractCNPJ(lines[i]);
      i++;
    }

    suppliers.push({
      empresa,
      contato,
      whatsapp: phone,
      email,
      endereco,
      cnpj
    });
  }

  console.log(`📋 Total de fornecedores extraídos: ${suppliers.length}`);
  console.log('');

  suppliers.forEach((s, idx) => {
    console.log(`  ${idx + 1}. ${(s.empresa || '?').padEnd(40)} Contato: ${s.contato.padEnd(15)} ${s.whatsapp}`);
  });

  // Create table and insert
  console.log('\n📦 Criando tabela e inserindo no banco...\n');
  const db = createDatabase();

  // Create fornecedores table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa TEXT NOT NULL,
      contato TEXT,
      whatsapp TEXT,
      email TEXT,
      endereco TEXT,
      cnpj TEXT,
      tenant_id INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabela fornecedores criada/verificada\n');

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const s of suppliers) {
    try {
      // Dedup check
      const existing = await db.get(
        'SELECT id FROM fornecedores WHERE empresa = ? AND whatsapp = ? AND tenant_id = ?',
        [s.empresa, s.whatsapp, 1]
      );
      if (existing) { skipped++; continue; }

      await db.run(
        `INSERT INTO fornecedores (empresa, contato, whatsapp, email, endereco, cnpj, tenant_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [s.empresa, s.contato, s.whatsapp, s.email || '', s.endereco || '', s.cnpj || '', 1]
      );
      inserted++;
    } catch (err) {
      console.error(`❌ Erro ao inserir ${s.empresa}: ${err.message}`);
      errors++;
    }
  }

  await db.close();

  console.log('✅ Importação concluída!');
  console.log(`   📥 Inseridos: ${inserted}`);
  console.log(`   ⏭️  Pulados (já existem): ${skipped}`);
  console.log(`   ❌ Erros: ${errors}`);
}

main().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
