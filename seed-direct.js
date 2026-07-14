#!/usr/bin/env node
/**
 * Direct DB seed - conecta diretamente ao PostgreSQL da Railway
 */
const { Client } = require('pg');

const client = new Client({
  host: 'postgresql.railway.internal',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'railway',
  ssl: { rejectUnauthorized: false },
  timeout: 15000
});

const leads = [
  { name: 'ANTONIO CARLOS', whatsapp: '61993669417', email: '' },
  { name: 'Adriano Almeida', whatsapp: '61998260946', email: 'adrianoalmeida9275@gmail.com' },
  { name: 'Alisson', whatsapp: '61992086408', email: '' },
  { name: 'Andreia dutra', whatsapp: '61993495230', email: 'aadultra50@gmail.com' },
  { name: 'Antonio lucas dutra', whatsapp: '61994121847', email: '' },
  { name: 'Auricia Maria de Sa', whatsapp: '61982388378', email: '' },
  { name: 'BALTASAR', whatsapp: '61999015366', email: '' },
  { name: 'BRUNO GELEIA', whatsapp: '61992709367', email: '' },
  { name: 'Benisson Nascimento', whatsapp: '61981826263', email: '' },
  { name: 'Bruno Ronny', whatsapp: '61985773309', email: '' },
  { name: 'CHEILA SILVA', whatsapp: '61995054658', email: '' },
  { name: 'CLAUDIOMAR DELFINO', whatsapp: '61984772242', email: '' },
  { name: 'Cleidson Cláudio', whatsapp: '61991410060', email: '' },
  { name: 'Cleverson Favaro', whatsapp: '61981202282', email: '' },
  { name: 'DEIVID ALVES', whatsapp: '61992462979', email: '' },
];

async function main() {
  console.log('🔌 Conectando ao PostgreSQL...');
  try {
    await client.connect();
    console.log('✅ Conectado!');
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
    // Tentar sem SSL
    console.log('🔄 Tentando sem SSL...');
    client.ssl = false;
    try {
      await client.connect();
      console.log('✅ Conectado (sem SSL)!');
    } catch (err2) {
      console.error('❌ Erro novamente:', err2.message);
      process.exit(1);
    }
  }

  // Verificar se a tabela leads existe
  try {
    const res = await client.query('SELECT count(*) FROM leads');
    console.log(`📊 Leads atuais no banco: ${res.rows[0].count}`);
  } catch (e) {
    console.log('⚠️ Tabela leads não existe ou não acessível:', e.message);
  }

  // Inserir leads
  console.log('\n🚀 Inserindo leads...');
  let inserted = 0, skipped = 0;

  for (const lead of leads) {
    try {
      const result = await client.query(
        `INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'lead_qualificado', 1, NOW(), NOW())
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [lead.name, lead.whatsapp, lead.email || '', 'Importado da lista WhatsApp em 14/07/2026']
      );
      if (result.rowCount > 0) {
        console.log(`  ✅ ${lead.name}`);
        inserted++;
      } else {
        console.log(`  ⏭️  ${lead.name} (já existe)`);
        skipped++;
      }
    } catch (err) {
      console.log(`  ❌ ${lead.name}: ${err.message}`);
    }
  }

  console.log(`\n📊 Resultado: ${inserted} inseridos, ${skipped} pulados`);
  await client.end();
}

main().catch(err => { console.error('❌ Erro:', err.message); process.exit(1); });