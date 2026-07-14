#!/usr/bin/env node
/**
 * Script para importar clientes da lista do WhatsApp para o banco SQLite
 * Uso: node scripts/importar-clientes.js
 * 
 * Formato esperado (bloco contínuo por cliente):
 *   NOME [CPF/CNPJ opcional]
 *   TELEFONE (com ou sem formatação)
 *   [EMAIL opcional - se tiver @]
 *   [NUMERO ignorado: "X Y"]
 */

const fs = require('fs');
const path = require('path');
const { createDatabase } = require('../src/database');

function cleanPhone(raw) {
  if (!raw) return '';
  let phone = raw.replace(/\D/g, '');
  if (phone.length > 11 && phone.startsWith('55')) {
    phone = phone.slice(2);
  }
  return phone;
}

function cleanName(raw) {
  // Remove CPF (11 dígitos) ou CNPJ (14 dígitos) do final
  let name = raw;
  // CPF/CNPJ formatado
  name = name.replace(/\s+\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\s*$/, '').trim();
  name = name.replace(/\s+\d{3}\.\d{3}\.\d{3}-\d{2}\s*$/, '').trim();
  // CPF/CNPJ puro
  name = name.replace(/\s+\d{11,14}\s*$/, '').trim();
  // Número menor (ex: 0273273123 = 10 dígitos)
  name = name.replace(/\s+\d{10}\s*$/, '').trim();
  return name.trim();
}

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}

function isOnlyDigits(str) {
  return /^\d+$/.test(str.trim());
}

function isCountPair(str) {
  return /^\d+\s+\d+$/.test(str.trim()) && str.trim().split(/\s+/).every(n => n.length <= 3);
}

function looksLikePhone(str) {
  const cleaned = str.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 12;
}

async function main() {
  const rawPath = path.join(__dirname, '..', 'clientes_raw.txt');
  if (!fs.existsSync(rawPath)) {
    console.error('❌ Arquivo clientes_raw.txt não encontrado!');
    process.exit(1);
  }

  const content = fs.readFileSync(rawPath, 'utf-8');
  const lines = content.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.includes('CPF/CNPJ') && !l.includes('Veículos OS') && !l.includes('Ações'));

  const clients = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip if line is just a count pair
    if (isCountPair(line)) { i++; continue; }
    // Skip if line is ONLY a phone number (no letters, just digits)
    if (isOnlyDigits(line) && looksLikePhone(line)) { i++; continue; }

    // This should be a name (possibly with CPF at the end)
    const name = cleanName(line);
    if (!name || name.length < 3) { i++; continue; }

    // Next line: phone
    i++;
    if (i >= lines.length) break;
    let phoneRaw = lines[i];
    let phone = cleanPhone(phoneRaw);

    // If phone line doesn't look like a phone, skip this entry
    if (!phone || phone.length < 10) {
      // Maybe the phone is on the next line?
      i++;
      continue;
    }

    // Next: could be email or count pair
    i++;
    let email = '';

    if (i < lines.length) {
      const next = lines[i];
      if (isEmail(next)) {
        email = next;
        i++; // Skip to next field
      }
    }

    // Skip count pair (the "X Y" numbers) if present
    if (i < lines.length && (isCountPair(lines[i]) || /^\d+$/.test(lines[i].trim()))) {
      i++;
    }

    clients.push({ name, whatsapp: phone, email });
  }

  console.log(`📋 Total de clientes extraídos: ${clients.length}`);
  console.log('');

  // Show preview
  clients.slice(0, 10).forEach((c, idx) => {
    console.log(`  ${String(idx + 1).padStart(2)}. ${c.name.padEnd(35)} ${c.whatsapp.padEnd(15)} ${c.email || ''}`);
  });
  if (clients.length > 10) {
    console.log(`  ... e mais ${clients.length - 10} clientes`);
  }

  // Insert into database
  console.log('\n📦 Inserindo no banco de dados...\n');
  const db = createDatabase();
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const client of clients) {
    try {
      // Dedup check: skip if same name + phone already exists
      const existing = await db.get(
        'SELECT id FROM leads WHERE name = ? AND whatsapp = ? AND tenant_id = ?',
        [client.name, client.whatsapp, 1]
      );

      if (existing) {
        skipped++;
        continue;
      }

      const result = await db.run(
        `INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          client.name,
          client.whatsapp,
          client.email || '',
          `Cliente importado da lista do WhatsApp em ${new Date().toLocaleString('pt-BR')}`,
          'lead_qualificado',
          1
        ]
      );
      inserted++;
      if (inserted % 10 === 0) process.stdout.write(`  ${inserted} inseridos...\n`);
    } catch (err) {
      console.error(`❌ Erro ao inserir ${client.name}: ${err.message}`);
      errors++;
    }
  }

  await db.close();

  console.log('');
  console.log('✅ Importação concluída!');
  console.log(`   📥 Inseridos: ${inserted}`);
  console.log(`   ⏭️  Já existiam (pulados): ${skipped}`);
  console.log(`   ❌ Erros: ${errors}`);
  console.log(`   🧾 Total na lista: ${clients.length}`);
}

main().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
