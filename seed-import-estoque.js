#!/usr/bin/env node
/**
 * Import stock database from the exported text file into MEEC estoque table
 * 
 * File: /home/williandedia/crm-garagem/estoque /banco de dados estoque txt
 * Format: Tab-separated records with fields like code, name, supplier, qty, prices
 */
const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');

// Read the source file
const filePath = path.resolve(__dirname, '..', 'crm-garagem', 'estoque ', 'banco de dados estoque txt');
const raw = fs.readFileSync(filePath, 'utf-8');

// Split into lines
const lines = raw.split('\n');

// Parse products - each product has a consistent structure:
// Line 1: CODE (possibly followed by tab then extra data)
// Line 2: NAME
// Line 3: SUPPLIER
// Line 4: QTY  R$ COST  R$ SELL
// Line 5: R$ PROFIT
// Line 6: MARGIN% [extra notes]
// Then blank lines between records

function parseProducts(lines) {
  const products = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Skip empty lines, timestamps, and artifacts
    if (line === '' || line.match(/^\d{1,2}:\d{2}$/) || line.includes('Ler mais')) {
      i++;
      continue;
    }
    
    // Try to parse as a product record
    // Line 1: Should be a code (alphanumeric, may have spaces) optionally followed by \t and extra text
    const codeLine = line;
    
    // Make sure the next few lines exist
    if (i + 5 >= lines.length) break;
    
    const nameLine = lines[i + 1]?.trim() || '';
    const supplierLine = lines[i + 2]?.trim() || '';
    const pricesLine = lines[i + 3]?.trim() || '';
    
    // Validate: name should not be a timestamp or empty
    if (nameLine.match(/^\d{1,2}:\d{2}$/) || nameLine === '' || nameLine.includes('Ler mais')) {
      i++;
      continue;
    }
    
    // Parse prices line: format like "0\tR$ 42.00\tR$ 57.00\t" or "7\tR$ 20.00\tR$ 30.00\t"
    const priceParts = pricesLine.split('\t');
    const qty = parseInt(priceParts[0]) || 0;
    const costPrice = parseFloat((priceParts[1] || '').replace('R$ ', '').replace(',', '.')) || 0;
    const sellPrice = parseFloat((priceParts[2] || '').replace('R$ ', '').replace(',', '.')) || 0;
    
    // Determine category based on product name
    const name = nameLine;
    const category = categorizeProduct(name, codeLine);
    
    // Use the sell price as the product price
    const price = sellPrice > 0 ? sellPrice : costPrice;
    
    // Use code as SKU, clean it up
    let code = codeLine.split('\t')[0].trim();
    // Remove duplicate entries where code appears twice
    if (code.length > 20) code = code.substring(0, 20);
    
    // Skip completely if no name or no price
    if (!name || price <= 0) {
      i += 6;
      continue;
    }
    
    // Clean supplier
    let supplier = supplierLine || '';
    // Remove WhatsApp artifacts
    supplier = supplier.replace(/\d{1,2}:\d{2}/g, '').trim();
    
    products.push({
      code: code,
      nome: name,
      descricao: '',
      preco: price,
      quantidade: qty,
      categoria: category,
      fornecedor: supplier,
      tenant_id: 1
    });
    
    i += 6; // Skip to next record (6 lines per product)
  }
  
  return products;
}

function categorizeProduct(name, code) {
  const n = name.toLowerCase();
  const c = code.toLowerCase();
  
  if (n.includes('oleo') || n.includes('óleo') || n.includes('lubrificante') || n.includes('graxa') || n.includes('fluído') || n.includes('aditivo') || n.includes('atf') || n.includes('sae')) return 'oleo';
  if (n.includes('filtro') || n.includes('filt')) return 'filtro';
  if (n.includes('freio') || n.includes('pastilha') || n.includes('disco') || n.includes('lona') || n.includes('cilindro de roda') || n.includes('sapata') || n.includes('tambor')) return 'freio';
  if (n.includes('vela') || n.includes('ignição') || n.includes('bobina')) return 'ignicao';
  if (n.includes('lampada') || n.includes('lâmpada') || n.includes('farol') || n.includes('farolete')) return 'iluminacao';
  if (n.includes('correia') || n.includes('correa')) return 'correia';
  if (n.includes('bateria') || n.includes('moura') || n.includes('heliar')) return 'bateria';
  if (n.includes('amortecedor') || n.includes('mola') || n.includes('pivo') || n.includes('pivô') || n.includes('terminal') || n.includes('coxin') || n.includes('balança') || n.includes('bieleta') || n.includes('barra estabilizadora') || n.includes('homocinetica')) return 'suspensao';
  if (n.includes('radiador') || n.includes('ventoinha') || n.includes('termostatica') || n.includes('termostato') || n.includes('bomba d') || n.includes('bomba de agua') || n.includes('mangueira') || n.includes('tampa radiador') || n.includes('arrefecimento') || n.includes('aditivo')) return 'arrefecimento';
  if (n.includes('palheta') || n.includes('fusível') || n.includes('fusivel') || n.includes('relógio') || n.includes('sensor de ré') || n.includes('chicote') || n.includes('desengripante') || n.includes('silicone') || n.includes('limpa') || n.includes('fita') || n.includes('abraçadeira') || n.includes('capa volante') || n.includes('lona protetora') || n.includes('cola')) return 'diversos';
  if (n.includes('kit') || n.includes('car 80') || c.includes('car80')) return 'kit';
  if (n.includes('bronzina') || n.includes('biela') || n.includes('mancal')) return 'motor';
  if (n.includes('cambio') || n.includes('alavanca') || n.includes('embreagem')) return 'cambio';
  if (n.includes('direção') || n.includes('caixa de direção') || n.includes('articulaç')) return 'direcao';
  
  return 'geral';
}

// Parse all products
const products = parseProducts(lines);
console.log(`📦 Total de produtos parseados: ${products.length}\n`);

// Connect to MEEC database
const DB_PATH = path.resolve(__dirname, 'data', 'garagem.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Check existing products
const existingCount = db.prepare('SELECT COUNT(*) as c FROM estoque').get().c;
console.log(`Produtos existentes: ${existingCount}`);

// Check if import was already done (by checking a sample product)
const sampleCode = products[0]?.code || '';
let alreadyImported = false;
if (sampleCode) {
  const match = db.prepare("SELECT id FROM estoque WHERE nome LIKE ? LIMIT 1").get(`%${products[0]?.nome?.substring(0, 20)}%`);
  alreadyImported = !!match;
}

if (alreadyImported) {
  console.log('⚠️  Produtos já foram importados anteriormente. Pulando...');
} else {
  // Insert products into database
  const insert = db.prepare(
    'INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, ativo, tenant_id) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
  );
  
  const insertMany = db.transaction((items) => {
    for (const p of items) {
      insert.run(p.nome, p.descricao, p.preco, '', p.categoria, p.quantidade, p.tenant_id);
    }
  });
  
  insertMany(products);
  console.log(`✅ ${products.length} produtos importados com sucesso!\n`);
}

// Show summary
const total = db.prepare('SELECT COUNT(*) as c FROM estoque').get().c;
const cats = db.prepare('SELECT categoria, COUNT(*) as c FROM estoque GROUP BY categoria ORDER BY c DESC').all();

console.log(`📊 Total no estoque: ${total}\n`);
console.log('📋 Por categoria:');
cats.forEach(c => {
  const pct = ((c.c / total) * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(c.c / total * 30));
  console.log(`  ${c.categoria.padEnd(15)} ${String(c.c).padStart(4)} (${pct}%) ${bar}`);
});

// Remove old seed file
fs.unlinkSync(path.resolve(__dirname, 'seed-products.js'));
console.log('\n🧹 Arquivo seed-products.js removido');

db.close();