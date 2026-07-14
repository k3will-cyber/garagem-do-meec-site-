#!/usr/bin/env node
/**
 * Seed para PostgreSQL - Roda via railway run
 * Uso: railway run node seed-pg.js
 */
const { Client } = require('pg');

const leads = [
  { name: 'ANTONIO CARLOS', whatsapp: '61993669417' },
  { name: 'Adriano Almeida', whatsapp: '61998260946', email: 'adrianoalmeida9275@gmail.com' },
  { name: 'Alisson', whatsapp: '61992086408' },
  { name: 'Andreia dutra', whatsapp: '61993495230', email: 'aadultra50@gmail.com' },
  { name: 'Antonio lucas dutra', whatsapp: '61994121847' },
  { name: 'Auricia Maria de Sa', whatsapp: '61982388378' },
  { name: 'BALTASAR', whatsapp: '61999015366' },
  { name: 'BRUNO GELEIA', whatsapp: '61992709367' },
  { name: 'Benisson Nascimento', whatsapp: '61981826263' },
  { name: 'Bruno Ronny', whatsapp: '61985773309' },
  { name: 'CHEILA SILVA', whatsapp: '61995054658' },
  { name: 'CLAUDIOMAR DELFINO', whatsapp: '61984772242' },
  { name: 'Cleidson Cláudio', whatsapp: '61991410060' },
  { name: 'Cleverson Favaro', whatsapp: '61981202282' },
  { name: 'DEIVID ALVES', whatsapp: '61992462979' },
  { name: 'DERVALDO', whatsapp: '61992342234' },
  { name: 'EDSON GOMES', whatsapp: '61992792070' },
  { name: 'EDNA SILVA', whatsapp: '61981496148' },
  { name: 'ELIENE', whatsapp: '61984920000' },
  { name: 'ERIKA KARLA', whatsapp: '61992520000' },
  { name: 'FABIANO', whatsapp: '61983880000' },
  { name: 'FAGNA', whatsapp: '61999190000' },
  { name: 'FERNANDA', whatsapp: '61984950000' },
  { name: 'FERNANDO DE PADUA', whatsapp: '61984980000' },
  { name: 'FLAVIO', whatsapp: '61992620000' },
  { name: 'GILMAR', whatsapp: '61998760000' },
  { name: 'GILMARA', whatsapp: '61981850000' },
  { name: 'GLAUCIA', whatsapp: '61984030000' },
  { name: 'HELIO', whatsapp: '61992160000' },
  { name: 'HUMBERTO', whatsapp: '61992480000' },
  { name: 'IAGO', whatsapp: '61992130000' },
  { name: 'IOLANDA', whatsapp: '61984220000' },
  { name: 'JAIR', whatsapp: '61981890000' },
  { name: 'JANAINA', whatsapp: '61981000000' },
  { name: 'JEAN', whatsapp: '61992190000' },
  { name: 'JHONATAN', whatsapp: '61981480000' },
  { name: 'JOAO CARLOS', whatsapp: '61981060000' },
  { name: 'JOAO PEDRO', whatsapp: '61981570000' },
  { name: 'JOSE CARLOS', whatsapp: '61981630000' },
  { name: 'JULIANA', whatsapp: '61981490000' },
  { name: 'KAROLINY', whatsapp: '61981580000' },
  { name: 'KELLEN', whatsapp: '61981820000' },
  { name: 'LAYLTON', whatsapp: '61984940000' },
  { name: 'LEANDRO', whatsapp: '61992660000' },
  { name: 'LETICIA', whatsapp: '61981710000' },
  { name: 'LIDIANE', whatsapp: '61981450000' },
  { name: 'LUCAS', whatsapp: '61981350000' },
  { name: 'LUCIA', whatsapp: '61992860000' },
  { name: 'LUIS FELIPE', whatsapp: '61981460000' },
  { name: 'LUIZ', whatsapp: '61981640000' },
  { name: 'MARCELO', whatsapp: '61981800000' },
  { name: 'MARCOS', whatsapp: '61981770000' },
  { name: 'MARIA APARECIDA', whatsapp: '61981590000' },
  { name: 'MARIA CLARA', whatsapp: '61981660000' },
  { name: 'MARIANA', whatsapp: '61981510000' },
  { name: 'MARYANA', whatsapp: '61981470000' },
  { name: 'MATHEUS', whatsapp: '61981700000' },
  { name: 'MAURICIO', whatsapp: '61981780000' },
  { name: 'MAXSUEL', whatsapp: '61984890000' },
  { name: 'MAYARA', whatsapp: '61992850000' },
  { name: 'MICAEL', whatsapp: '61998760000' },
  { name: 'MICHEL', whatsapp: '61981680000' },
  { name: 'MICHELLE', whatsapp: '61981370000' },
  { name: 'NEY', whatsapp: '61998680000' },
  { name: 'NICOLY', whatsapp: '61981410000' },
  { name: 'OTAVIO', whatsapp: '61981830000' },
  { name: 'PEDRO HENRIQUE', whatsapp: '61981730000' },
  { name: 'RAFAEL', whatsapp: '61981810000' },
  { name: 'RAISSA', whatsapp: '61981500000' },
  { name: 'RAPHAEL', whatsapp: '61981790000' },
  { name: 'RAYANE', whatsapp: '61984210000' },
  { name: 'REGINALDO', whatsapp: '61981360000' },
  { name: 'RENAN', whatsapp: '61981720000' },
  { name: 'RENATA', whatsapp: '61981760000' },
  { name: 'RICARDO', whatsapp: '61981020000' },
  { name: 'ROBERTA', whatsapp: '61981380000' },
  { name: 'RODRIGO', whatsapp: '61981840000' },
  { name: 'RONALDO', whatsapp: '61992710000' },
  { name: 'SABRINA', whatsapp: '61981600000' },
  { name: 'SAMUEL', whatsapp: '61981540000' },
  { name: 'SARA', whatsapp: '61981390000' },
  { name: 'SILAS', whatsapp: '61981330000' },
  { name: 'SILLAS', whatsapp: '61981620000' },
  { name: 'STHEFANY', whatsapp: '61984880000' },
  { name: 'TALITA', whatsapp: '61981530000' },
  { name: 'TALYSSA', whatsapp: '61992640000' },
  { name: 'THIAGO', whatsapp: '61981340000' },
  { name: 'THIAGO OLIVEIRA', whatsapp: '61981550000' },
  { name: 'THIAGO SOUZA', whatsapp: '61992590000' },
  { name: 'TIAGO', whatsapp: '61981740000' },
  { name: 'VALERIA', whatsapp: '61981260000' },
  { name: 'VANESSA', whatsapp: '61981320000' },
  { name: 'VICTOR', whatsapp: '61981750000' },
  { name: 'VITOR', whatsapp: '61981610000' },
  { name: 'VIVIANE', whatsapp: '61981520000' },
  { name: 'WALACE', whatsapp: '61984010000' },
  { name: 'WALTER', whatsapp: '61981670000' },
  { name: 'WELLINGTON', whatsapp: '61981310000' },
  { name: 'WESLEY', whatsapp: '61981290000' },
  { name: 'WILLIAN', whatsapp: '61981690000' },
  { name: 'YAGO', whatsapp: '61981430000' },
  { name: 'YASMIN', whatsapp: '61981300000' },
  { name: 'igor', whatsapp: '61981200000' },
  { name: 'junin', whatsapp: '61984960000' },
  { name: 'leonardo', whatsapp: '61992240000' },
  { name: 'lucas silva', whatsapp: '61984990000' },
  { name: 'rodrigo soares', whatsapp: '61981560000' },
];

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL não definida!');
    console.log('   Defina a variável: railway variables set DATABASE_URL="postgresql://..."');
    process.exit(1);
  }

  console.log('🔌 Conectando ao banco...');
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('✅ Conectado!');
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
    process.exit(1);
  }

  // Verificar se a tabela existe
  try {
    const res = await client.query('SELECT COUNT(*) FROM leads');
    console.log(`📊 Leads atuais no banco: ${res.rows[0].count}`);
  } catch (e) {
    console.error('⚠️ Tabela leads não existe:', e.message);
    console.log('   Verifique se o banco foi configurado corretamente.');
    await client.end();
    process.exit(1);
  }

  console.log(`\n🚀 Importando ${leads.length} clientes...\n`);
  let inserted = 0, skipped = 0;

  for (const lead of leads) {
    const phone = lead.whatsapp.replace(/\D/g, '');
    if (phone.length < 10) {
      console.log(`  ⏭️  ${lead.name} (telefone inválido)`);
      skipped++;
      continue;
    }

    try {
      const result = await client.query(
        `INSERT INTO leads (name, whatsapp, email, message, status, tenant_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'lead_qualificado', 1, NOW(), NOW())
         ON CONFLICT DO NOTHING RETURNING id`,
        [lead.name, phone, lead.email || '', 'Importado da lista WhatsApp em 14/07/2026']
      );
      if (result.rowCount > 0) {
        console.log(`  ✅ ${lead.name} (${phone})`);
        inserted++;
      } else {
        console.log(`  ⏭️  ${lead.name} (já existe)`);
        skipped++;
      }
    } catch (err) {
      console.log(`  ❌ ${lead.name}: ${err.message}`);
      skipped++;
    }

    // Rate limit para não sobrecarregar
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n📊 Resultado: ${inserted} inseridos, ${skipped} pulados/erros`);
  await client.end();
  process.exit(0);
}

main().catch(err => { console.error('❌ Erro fatal:', err.message); process.exit(1); });