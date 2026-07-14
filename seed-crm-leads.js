/**
 * Seed CRM Leads - insere os 68 clientes na tabela crm_leads
 * do PostgreSQL compartilhado (crm-garagem database).
 *
 * Uso: railway run node seed-crm-leads.js
 * (O install.js instala pg antes de executar)
 */
const { Client } = require('pg');

// CRM database - postgresql service (compartilhado com crm-garagem)
const CRM_DB_URL = process.env.CRM_DB_URL || 'postgresql://postgres:postgres@postgresql:5432/postgres';

const clients = [
  ["ANTONIO CARLOS", "61993669417", "", "crm_import", 1, 1, "CPF: 64579271149"],
  ["Adriano Almeida", "61998260946", "adrianoalmeida9275@gmail.com", "crm_import", 2, 2, "CPF: 05399391104"],
  ["Alisson", "61992086408", "", "crm_import", 1, 0, "CPF: 08328094118"],
  ["Andreia dutra", "61993495230", "aadultra50@gmail.com", "crm_import", 1, 1, "CPF: 61114561134"],
  ["Antonio lucas dutra", "61994121847", "", "crm_import", 1, 0, "CPF: 05113249106"],
  ["Auricia Maria de Sa", "61982388378", "", "crm_import", 1, 1, "CPF: 73912115320"],
  ["BALTASAR", "61999015366", "", "crm_import", 1, 0, "CPF: 19109954600"],
  ["BRUNO GELEIA", "61992709367", "", "crm_import", 0, 0, "CPF: 06389949189"],
  ["Benisson Nascimento", "61981826263", "", "crm_import", 1, 0, "CPF: 03563374139"],
  ["Bruno Ronny", "61985773309", "", "crm_import", 1, 1, "CPF: 02892333130"],
  ["CHEILA SILVA", "61995054658", "", "crm_import", 1, 1, "CPF: 02903220140"],
  ["CLAUDIOMAR DELFINO", "61984772242", "", "crm_import", 2, 2, "CPF: 94759871187"],
  ["Cleidson Cláudio", "61991410060", "", "crm_import", 1, 1, "CPF: 02360734199"],
  ["Cleverson Favaro", "61981202282", "", "crm_import", 1, 1, "CPF: 05393683189"],
  ["DEIVID ALVES", "61992462979", "", "crm_import", 1, 3, "CPF: 09068991175"],
  ["DOUGLAS SANTOS", "61993618574", "", "crm_import", 1, 1, "CPF: 70246059109"],
  ["Dayane Lins Rezende", "61982267844", "", "crm_import", 1, 1, "CPF: 05480842110"],
  ["Deborah cristina santos bernades", "61991431092", "", "crm_import", 1, 1, "CPF: 71547453125"],
  ["Deivid gomes", "61995993827", "", "crm_import", 2, 1, "CPF: 04199461108"],
  ["Diego amorin", "61995993039", "migueldiego1301@gmail.com", "crm_import", 2, 5, "CPF: 05119739180"],
  ["Douglas Antonio", "61991042190", "ddoglasferreira@gmail.com", "crm_import", 1, 1, "CPF: 61753300134"],
  ["EDIMILSON JOSE", "61993801837", "", "crm_import", 1, 0, "CPF: 57326711100"],
  ["EVANILSON", "61995715564", "", "crm_import", 0, 0, "CPF: 96008075315"],
  ["Edilson luiz", "61992542339", "", "crm_import", 1, 2, "CPF: 95355030149"],
  ["Eduardo medeiros", "61982013979", "medeiroseduardo2002@gmail.com", "crm_import", 1, 1, "CPF: 05970360120"],
  ["FRANCISCO LOPES", "61992278105", "", "crm_import", 1, 2, "CPF: 49339451104"],
  ["GABRIEL TRINDADE", "61992682777", "", "crm_import", 1, 1, "CPF: 05544176183"],
  ["GILBERTE AVILA", "61991553799", "", "crm_import", 1, 1, "CPF: 05374986139"],
  ["GILBERTO BARBOSA", "61992568569", "", "crm_import", 1, 0, "CPF: 11448350468"],
  ["GUILHERME CARVALHO", "61993191885", "", "crm_import", 1, 0, "CPF: 07554646133"],
  ["Gladson do nascimento Carvalho", "61992064787", "", "crm_import", 1, 1, "CPF: 03534584147"],
  ["Henrique Carvalho", "61991610354", "", "crm_import", 1, 1, "CPF: 02101553104"],
  ["IVAN ROYAL MULTMARCA", "61993325258", "", "crm_import", 2, 2, "CPF: 03466168163"],
  ["JAIRO ROMULO", "61998645687", "", "crm_import", 1, 0, "CPF: 01764065140"],
  ["JIVANILDO DE LIMA GUERRA", "61981371365", "", "crm_import", 1, 1, "CPF: 01153852152"],
  ["JOSE ADRIANO DE SOUSA", "61991396165", "", "crm_import", 1, 1, "CPF: 78352878115"],
  ["JOSE AIRTON", "61992044156", "", "crm_import", 1, 1, "CPF: 06967964305"],
  ["JUAN", "61994514346", "", "crm_import", 1, 1, "CPF: 06589106126"],
  ["Jane Cleia Alves Da Silva", "61993482622", "", "crm_import", 1, 1, "CPF: 0273273123"],
  ["Keli Mota", "61986521710", "", "crm_import", 1, 0, "CPF: 00254693121"],
  ["LEONIDAS DE OLIVEIRA", "61981398609", "", "crm_import", 1, 1, "CPF: 37164155100"],
  ["LUCAS MUNIZ", "61992834344", "", "crm_import", 1, 1, "CPF: 71074001184"],
  ["Larissa Sousa", "61991694615", "", "crm_import", 1, 1, "CPF: 03255015138"],
  ["Laysa Perreira", "61995664242", "", "crm_import", 1, 0, "CPF: 06921458180"],
  ["Leandro Batista", "61981459373", "", "crm_import", 1, 1, "CPF: 09720902400"],
  ["Letícia Silva", "61991285673", "", "crm_import", 1, 1, "CPF: 08784810106"],
  ["Lorrany Adrielly", "61981862290", "lorranyadriell@gmail.com", "crm_import", 1, 2, "CPF: 09733072184"],
  ["Lucas Gomes de Souza", "61983724130", "maura35@gmail.com", "crm_import", 1, 0, "CPF: 11896786405"],
  ["Luiz Elligton", "61995697482", "", "crm_import", 1, 1, "CPF: 33963207191"],
  ["Luiz Fernando", "61981757105", "", "crm_import", 1, 1, "CPF: 05558460164"],
  ["Luiz Otavio", "61996810715", "", "crm_import", 1, 1, "CPF: 10364704152"],
  ["MARIA KAROLINE GONÇALVES VERAS", "61992504801", "", "crm_import", 1, 1, "CPF: 06493771170"],
  ["Marcelo Alves", "61991421815", "Marceloalves.gama@yahoo.com.br", "crm_import", 1, 1, "CPF: 80274900149"],
  ["Marcus vinicius", "61981087505", "", "crm_import", 1, 0, "CPF: 03290828174"],
  ["Maria aparecida", "61984766260", "", "crm_import", 1, 1, "CPF: 34342222191"],
  ["Mateus Januario", "61993879770", "", "crm_import", 0, 0, "CPF: 06367184171"],
  ["Mateus Ribeiro", "61992268448", "", "crm_import", 1, 1, "CPF: 06687411128"],
  ["Paulo Henrique", "61982418684", "", "crm_import", 1, 1, "CPF: 05411925150"],
  ["Paulo Henrique sousa", "61991718042", "", "crm_import", 1, 1, "CPF: 00825850169"],
  ["Paulo cruzes", "61994290449", "", "crm_import", 1, 1, "CPF: 00340285109"],
  ["Pedro amorim", "61993025781", "", "crm_import", 1, 1, "CPF: 04319840186"],
  ["Pedro lucas", "61992790991", "", "crm_import", 1, 0, "CPF: 06293389140"],
  ["Raimundo Nonato", "61995805098", "", "crm_import", 1, 1, "CPF: 91396360387"],
  ["Robson renato", "61994120980", "", "crm_import", 1, 1, "CPF: 01151570265"],
  ["SERGIO VALENTIM", "61995273087", "", "crm_import", 1, 2, "CPF: 00811851117"],
  ["SUELMA MATOS", "61993031369", "", "crm_import", 1, 1, "CPF: 04427800106"],
  ["SUIAMY", "61996568181", "", "crm_import", 1, 2, "CPF: 07198489117"],
  ["Sarah khetley pereira monteiro da silva", "61995833537", "Sarakhetlen1234@gmail.com", "crm_import", 1, 0, "CPF: 70617889171"],
];

async function seed() {
  console.log('[CRM Seed] Conectando ao banco CRM...');
  console.log('[CRM Seed] DB URL:', CRM_DB_URL.replace(/:[^:@]+@/, ':***@'));

  const client = new Client({ connectionString: CRM_DB_URL });

  try {
    await client.connect();
    console.log('[CRM Seed] Conectado!');

    // Verify crm_leads table exists
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_name = 'crm_leads'
    `);
    if (tableCheck.rows.length === 0) {
      console.error('[CRM Seed] Tabela crm_leads NÃO existe!');
      console.log('[CRM Seed] Tabelas disponíveis:', JSON.stringify(
        (await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`)).rows.map(r => r.table_name)
      ));
      return;
    }
    console.log('[CRM Seed] Tabela crm_leads OK');

    // Insert leads (skip duplicates by phone)
    let ok = 0, skipped = 0;
    for (const [name, phone, email, source, veiculos, os_count, notes] of clients) {
      try {
        const result = await client.query(`
          INSERT INTO crm_leads (name, phone, email, source, status, estimatedValue, notes, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, 'new', $5, $6, NOW(), NOW())
          ON CONFLICT DO NOTHING
          RETURNING id
        `, [name, phone, email || null, source, (veiculos * 500) + (os_count * 300), notes]);

        if (result.rowCount > 0) {
          ok++;
          console.log(`  [${ok}] ${name} (${phone})`);
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`  ERRO ${name}: ${err.message}`);
      }
    }

    console.log(`\n[CRM Seed] RESULTADO: ${ok} inseridos, ${skipped} duplicados`);
    const total = (await client.query('SELECT COUNT(*) FROM crm_leads')).rows[0].count;
    console.log(`[CRM Seed] Total de leads no CRM: ${total}`);

  } catch (err) {
    console.error('[CRM Seed] ERRO:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();