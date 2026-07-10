#!/usr/bin/env node
/**
 * Garagem do MEEC — PostgreSQL Seed Script
 *
 * Run this on Railway to create all tables and seed initial data.
 * Usage: DATABASE_URL=postgresql://... node seed-pg.js
 */

const { createDatabase } = require('./src/database');

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL não definida. Use:');
    console.log('   DATABASE_URL=postgresql://... node seed-pg.js');
    console.log('   (ou execute no Railway com a variável configurada)');
    process.exit(1);
  }

  const db = createDatabase();
  console.log(`✅ Conectado ao PostgreSQL\n`);

  try {
    // ─── CREATE TABLES ─────────────────────────────────────────
    console.log('📦 Criando tabelas...\n');

    await db.exec(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        subdomain TEXT UNIQUE,
        name TEXT NOT NULL,
        logo TEXT,
        whatsapp TEXT,
        address TEXT,
        settings TEXT DEFAULT '{}',
        ativo INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT DEFAULT '',
        role TEXT DEFAULT 'superadmin',
        avatar TEXT,
        google_id TEXT UNIQUE,
        auth_provider TEXT DEFAULT 'local',
        tenant_id INTEGER REFERENCES tenants(id),
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        email TEXT,
        message TEXT,
        status TEXT DEFAULT 'lead_qualificado',
        valor DECIMAL(10,2) DEFAULT 0,
        origem TEXT DEFAULT 'site',
        notas TEXT,
        data_proximo_contato TIMESTAMP,
        ultimo_contato TIMESTAMP,
        responsavel TEXT,
        veiculo TEXT,
        servico_interesse TEXT,
        tenant_id INTEGER REFERENCES tenants(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS estoque (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco DECIMAL(10,2) NOT NULL,
        imagem TEXT,
        categoria TEXT DEFAULT 'geral',
        quantidade INTEGER DEFAULT 0,
        ativo INTEGER DEFAULT 1,
        tenant_id INTEGER REFERENCES tenants(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        cliente_nome TEXT,
        cliente_whatsapp TEXT,
        items TEXT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        forma_pagamento TEXT DEFAULT 'PIX',
        status TEXT DEFAULT 'novo',
        tenant_id INTEGER REFERENCES tenants(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

  CREATE TABLE IF NOT EXISTS os (
    id SERIAL PRIMARY KEY,
    numero_os TEXT UNIQUE,
    cliente_nome TEXT NOT NULL,
    cliente_whatsapp TEXT,
    cliente_email TEXT,
    veiculo TEXT NOT NULL,
    placa TEXT,
    km INTEGER,
    data_prevista TIMESTAMP,
    status TEXT DEFAULT 'aberta',
    prioridade TEXT DEFAULT 'normal',
    servico_desc TEXT,
    observacoes TEXT,
    valor_mao_obra DECIMAL(10,2) DEFAULT 0,
    valor_pecas DECIMAL(10,2) DEFAULT 0,
    desconto DECIMAL(10,2) DEFAULT 0,
    forma_pagamento TEXT,
    tenant_id INTEGER REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS os_itens (
    id SERIAL PRIMARY KEY,
    os_id INTEGER NOT NULL REFERENCES os(id),
    tipo TEXT NOT NULL DEFAULT 'servico',
    descricao TEXT NOT NULL,
    quantidade DECIMAL(10,2) DEFAULT 1,
    valor_unitario DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
  CREATE INDEX IF NOT EXISTS idx_estoque_tenant ON estoque(tenant_id);
  CREATE INDEX IF NOT EXISTS idx_os_tenant ON os(tenant_id);
    `);

    console.log('✅ Tabelas criadas com sucesso\n');

    // ─── SEED TENANT ───────────────────────────────────────────
    const existingTenant = await db.get('SELECT id FROM tenants WHERE slug = $1', ['meec']);
    let tenantId;

    if (!existingTenant) {
      const result = await db.run(
        `INSERT INTO tenants (slug, subdomain, name, whatsapp, settings)
         VALUES ($1, $2, $3, $4, $5)`,
        ['meec', 'meec', 'Garagem do MEEC', '(11) 99999-9999', '{}']
      );
      tenantId = result.lastInsertRowid;
      console.log('✅ Tenant "Garagem do MEEC" criado');
    } else {
      tenantId = existingTenant.id;
      console.log('ℹ️  Tenant já existe (ID: ' + tenantId + ')');
    }

    // ─── SEED ADMIN USER ───────────────────────────────────────
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Pablo Jhonatan';

    const existingAdmin = await db.get(
      'SELECT id FROM users WHERE username = $1',
      [adminUsername]
    );

    if (!existingAdmin) {
      const bcrypt = require('bcryptjs');
      const hashed = bcrypt.hashSync(adminPassword, 10);

      await db.run(
        `INSERT INTO users (username, password, name, email, role, tenant_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [adminUsername, hashed, adminName, 'admin@meec.com', 'superadmin', tenantId]
      );
      console.log(`✅ Admin criado: ${adminUsername} / ${adminPassword}\n`);
    } else {
      console.log('ℹ️  Admin já existe\n');
    }

    // ─── SEED DEFAULT PRODUCTS ─────────────────────────────────
    const productCount = await db.get('SELECT COUNT(*) as count FROM estoque WHERE tenant_id = $1', [tenantId]);

    if (productCount.count === 0) {
      const products = [
        ['Kit de Reparos Volkswagen', 'Kit completo para revisão básica VW', 89.90, 'kit', 10],
        ['Kit de Reparos Gol', 'Kit específico para VW Gol', 79.90, 'kit', 8],
        ['Kit de Reparos Geral', 'Kit universal para manutenção preventiva', 69.90, 'kit', 15],
        ['Troca de Óleo Completa', 'Óleo sintético + filtro premium + mão de obra', 180.00, 'servico', 20],
        ['Diagnóstico Computadorizado', 'Scanner automotivo completo', 120.00, 'servico', 99],
        ['Alinhamento e Balanceamento', 'Alinhamento 3D + balanceamento', 89.90, 'servico', 99],
        ['Pastilhas de Freio', 'Jogo de pastilhas de freio originais', 149.90, 'peca', 20],
        ['Filtro de Óleo', 'Filtro de óleo premium', 29.90, 'peca', 30],
      ];

      for (const p of products) {
        await db.run(
          `INSERT INTO estoque (nome, descricao, preco, categoria, quantidade, tenant_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [p[0], p[1], p[2], p[3], p[4], tenantId]
        );
      }
      console.log(`✅ ${products.length} produtos padrão criados\n`);
    } else {
      console.log(`ℹ️  ${productCount.count} produtos já existem\n`);
    }

    // ─── SUMMARY ───────────────────────────────────────────────
    const summary = await db.all(`
      SELECT 'tenants' as tbl, COUNT(*) as count FROM tenants
      UNION ALL SELECT 'users', COUNT(*) FROM users
      UNION ALL SELECT 'leads', COUNT(*) FROM leads
      UNION ALL SELECT 'estoque', COUNT(*) FROM estoque
      ORDER BY tbl
    `);

    console.log('📊 RESUMO DO BANCO:');
    summary.forEach(s => {
      console.log(`   ${s.tbl.padEnd(12)} ${s.count}`);
    });

    console.log('\n✅ Seed concluído com sucesso!');
  } catch (err) {
    console.error('\n❌ Erro durante o seed:', err.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

seed();
