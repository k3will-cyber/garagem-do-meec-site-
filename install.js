#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────
 *  Garagem do MEEC — Installer (Multi-tenant SAAS Setup)
 * ─────────────────────────────────────────────────────────────
 *  Uso:  node install.js
 *        node install.js --quick    (pula perguntas, usa defaults)
 *        node install.js --reset    (sobrescreve DB existente)
 *
 *  Este script guia você pelo setup completo de uma nova
 *  instância multi-tenant do sistema Garagem do MEEC.
 * ─────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync, spawnSync } = require('child_process');
const crypto = require('crypto');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const CLEAR = '\x1b[2J\x1b[H';

const isQuick = process.argv.includes('--quick');
const isReset = process.argv.includes('--reset');
const SKIP_NPM = process.argv.includes('--skip-npm');

// ─── Utils ────────────────────────────────────────────────────────

function ask(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function printLogo() {
  console.log(CLEAR);
  console.log(`${CYAN}${BOLD}`);
  console.log('  ╔══════════════════════════════════════════════════╗');
  console.log('  ║     🚗  GARAGEM DO MEEC  —  SAAS Installer     ║');
  console.log('  ║     Multi-tenant | OS | Financeiro | Leads      ║');
  console.log('  ╚══════════════════════════════════════════════════╝');
  console.log(`${RESET}\n`);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function generateSecret(len = 32) {
  return crypto.randomBytes(len).toString('hex');
}

function slugify(str) {
  const slug = str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'oficina';
}

function checkMark(msg) {
  console.log(`  ${GREEN}✓${RESET} ${msg}`);
}

function warnMark(msg) {
  console.log(`  ${YELLOW}⚠${RESET} ${msg}`);
}

function infoMark(msg) {
  console.log(`  ${BLUE}ℹ${RESET} ${msg}`);
}

function errorMark(msg) {
  console.log(`  ${RED}✗${RESET} ${msg}`);
}

function title(t) {
  console.log(`\n  ${BOLD}${t}${RESET}\n`);
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  printLogo();
  await sleep(500);

  // ─── 0. Check requirements ───────────────────────────────────
  title('🔍 Verificando pré-requisitos...');

  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (nodeMajor < 18) {
    warnMark(`Node.js ${nodeVersion} detectado. Recomendamos >= 18.x`);
  } else {
    checkMark(`Node.js ${nodeVersion}`);
  }

  // Check npm
  const npmCheck = spawnSync('npm', ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (npmCheck.status === 0) {
    checkMark(`npm ${npmCheck.stdout.trim()}`);
  } else {
    errorMark('npm não encontrado. Instale Node.js com npm.');
    process.exit(1);
  }

  // ─── 1. Check existing installation ──────────────────────────
  const dbPath = path.join(__dirname, 'data', 'garagem.db');
  const envPath = path.join(__dirname, '.env');
  const dbExists = fs.existsSync(dbPath);
  const envExists = fs.existsSync(envPath);

  if (dbExists && !isReset) {
    warnMark('Banco de dados já existe em data/garagem.db');
    const answer = await ask('  Deseja sobrescrever? (s/N): ');
    if (answer.toLowerCase() !== 's') {
      console.log('\n  Instalação cancelada. O banco existente foi preservado.\n');
      process.exit(0);
    }
    fs.unlinkSync(dbPath);
    // Remove WAL/SHM files
    try { fs.unlinkSync(dbPath + '-wal'); } catch (e) { /* ok */ }
    try { fs.unlinkSync(dbPath + '-shm'); } catch (e) { /* ok */ }
    checkMark('Banco existente removido');
  }

  // ─── 2. Gather configuration ─────────────────────────────────
  title('🏪 Configuração da Oficina');

  let tenantName = 'Garagem do MEEC';
  let tenantSlug = 'meec';
  let adminUsername = 'admin';
  let adminPassword = 'admin123';
  let adminName = 'Administrador';
  let port = 3000;
  let baseUrl = `http://localhost:${port}`;
  let whatsappNumber = '';
  let googleClientId = '';
  let googleClientSecret = '';

  if (!isQuick) {
    tenantName = await ask(`  ${BOLD}Nome da oficina${RESET} (${DIM}Garagem do MEEC${RESET}): `);
    if (!tenantName) tenantName = 'Garagem do MEEC';

    const defaultSlug = slugify(tenantName);
    const slugInput = await ask(`  Slug do tenant (${DIM}${defaultSlug}${RESET}): `);
    tenantSlug = slugInput || defaultSlug;

    adminUsername = await ask(`  Usuário admin (${DIM}admin${RESET}): `);
    if (!adminUsername) adminUsername = 'admin';

    adminPassword = await ask(`  Senha admin (${DIM}admin123${RESET}): `);
    if (!adminPassword) adminPassword = 'admin123';

    adminName = await ask(`  Nome do admin (${DIM}Administrador${RESET}): `);
    if (!adminName) adminName = 'Administrador';

    const portInput = await ask(`  Porta do servidor (${DIM}3000${RESET}): `);
    port = parseInt(portInput, 10) || 3000;
    baseUrl = `http://localhost:${port}`;

    title('📞 WhatsApp (opcional)');
    whatsappNumber = await ask(`  Número do WhatsApp do proprietário (${DIM}55... / opcional${RESET}): `);

    title('🔑 Google OAuth (opcional)');
    googleClientId = await ask(`  Google Client ID (${DIM}opcional${RESET}): `);
    googleClientSecret = await ask(`  Google Client Secret (${DIM}opcional${RESET}): `);
  }

  // ─── 3. Create .env file ─────────────────────────────────────
  if (!envExists || isReset || isQuick) {
    title('🔧 Gerando arquivo .env...');

    const sessionSecret = generateSecret();
    const registerSecret = generateSecret(16).slice(0, 16);

    const envContent = `# ─── Garagem do MEEC — Configuração ─────────────────────────────
# Gerado automaticamente pelo install.js em ${new Date().toISOString().split('T')[0]}

# Porta do servidor
PORT=${port}

# Ambiente: development | production
NODE_ENV=development

# ─── Banco de Dados ──────────────────────────────────────────────
DB_PATH=./data/garagem.db

# ─── Autenticação ────────────────────────────────────────────────
SESSION_SECRET=${sessionSecret}
ADMIN_USERNAME=${adminUsername}
ADMIN_PASSWORD=${adminPassword}
ADMIN_NAME=${adminName}
REGISTER_SECRET=${registerSecret}

# ─── WhatsApp Web ────────────────────────────────────────────────
WHATSAPP_ENABLED=${whatsappNumber ? 'true' : 'false'}
${whatsappNumber ? `WHATSAPP_OWNER_NUMBER=${whatsappNumber}` : '# WHATSAPP_OWNER_NUMBER='}

# ─── Google OAuth ────────────────────────────────────────────────
${googleClientId ? `GOOGLE_CLIENT_ID=${googleClientId}` : '# GOOGLE_CLIENT_ID='}
${googleClientSecret ? `GOOGLE_CLIENT_SECRET=${googleClientSecret}` : '# GOOGLE_CLIENT_SECRET='}
BASE_URL=${baseUrl}
`;

    fs.writeFileSync(envPath, envContent);
    checkMark('.env criado com sucesso');
  } else {
    infoMark('.env já existe — mantendo configurações atuais');
  }

  // ─── 4. Install dependencies ─────────────────────────────────
  if (!SKIP_NPM) {
    title('📦 Instalando dependências...');
    console.log(`  ${DIM}npm install — isso pode levar alguns minutos...${RESET}\n`);

    const npmResult = spawnSync('npm', ['install', '--no-audit', '--no-fund'], {
      cwd: __dirname,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120000
    });

    if (npmResult.status === 0) {
      checkMark('Dependências instaladas');
    } else {
      errorMark('Erro ao instalar dependências');
      console.error(npmResult.stderr.slice(0, 500));
      console.log(`\n  ${YELLOW}Tente manualmente: npm install${RESET}\n`);
    }
  } else {
    infoMark('Pulando instalação de dependências (--skip-npm)');
  }

  // ─── 5. Initialize database ──────────────────────────────────
  title('🗄️  Inicializando banco de dados...');

  try {
    const Database = require('better-sqlite3');
    const bcrypt = require('bcryptjs');

    // Ensure data directory
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // ── Create all tables ─────────────────────────────────────
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT DEFAULT '',
        role TEXT DEFAULT 'superadmin',
        avatar TEXT,
        google_id TEXT UNIQUE,
        auth_provider TEXT DEFAULT 'local',
        tenant_id INTEGER REFERENCES tenants(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        subdomain TEXT UNIQUE,
        logo TEXT,
        whatsapp TEXT,
        address TEXT,
        settings TEXT DEFAULT '{}',
        ativo INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        email TEXT,
        message TEXT,
        status TEXT DEFAULT 'lead_qualificado',
        valor REAL DEFAULT 0,
        origem TEXT DEFAULT 'site',
        notas TEXT,
        data_proximo_contato DATETIME,
        ultimo_contato DATETIME,
        responsavel TEXT,
        veiculo TEXT,
        servico_interesse TEXT,
        tenant_id INTEGER REFERENCES tenants(id),
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
        tenant_id INTEGER REFERENCES tenants(id),
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
        tenant_id INTEGER REFERENCES tenants(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vagas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data DATE UNIQUE NOT NULL,
        vagas INTEGER DEFAULT 3
      );

      CREATE TABLE IF NOT EXISTS ordens_servico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER REFERENCES tenants(id),
        lead_id INTEGER,
        numero_os TEXT UNIQUE,
        cliente_nome TEXT NOT NULL,
        cliente_whatsapp TEXT,
        cliente_email TEXT,
        veiculo TEXT NOT NULL,
        placa TEXT,
        km INTEGER,
        servico_desc TEXT,
        status TEXT DEFAULT 'aberta',
        prioridade TEXT DEFAULT 'normal',
        data_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_prevista DATETIME,
        data_saida DATETIME,
        valor_mao_obra REAL DEFAULT 0,
        valor_pecas REAL DEFAULT 0,
        valor_total REAL DEFAULT 0,
        desconto REAL DEFAULT 0,
        forma_pagamento TEXT,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS os_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        os_id INTEGER NOT NULL REFERENCES ordens_servico(id),
        tipo TEXT NOT NULL DEFAULT 'servico',
        descricao TEXT NOT NULL,
        quantidade REAL DEFAULT 1,
        valor_unitario REAL DEFAULT 0,
        valor_total REAL DEFAULT 0,
        estoque_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS financeiro (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER REFERENCES tenants(id),
        os_id INTEGER,
        tipo TEXT NOT NULL DEFAULT 'receita',
        categoria TEXT NOT NULL DEFAULT 'servico',
        descricao TEXT NOT NULL,
        valor REAL NOT NULL DEFAULT 0,
        forma_pagamento TEXT,
        data_vencimento DATE,
        data_pagamento DATE,
        status TEXT DEFAULT 'pendente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ofertas_prizes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'desconto_pct',
        value REAL NOT NULL DEFAULT 0,
        probability_weight INTEGER NOT NULL DEFAULT 1,
        color TEXT NOT NULL DEFAULT '#0044CC',
        image TEXT,
        ativo INTEGER DEFAULT 1,
        estoque_id INTEGER,
        tenant_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ofertas_spins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        client_whatsapp TEXT NOT NULL,
        prize_id INTEGER,
        prize_name TEXT NOT NULL,
        prize_type TEXT NOT NULL,
        prize_value REAL DEFAULT 0,
        coupon_code TEXT UNIQUE NOT NULL,
        usado INTEGER DEFAULT 0,
        usado_em DATETIME,
        ip_address TEXT,
        tenant_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
      CREATE INDEX IF NOT EXISTS idx_os_tenant ON ordens_servico(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_financeiro_tenant ON financeiro(tenant_id);
    `);

    checkMark('Tabelas criadas');

    // ── Create tenant ──────────────────────────────────────────
    db.prepare('INSERT INTO tenants (name, slug, subdomain) VALUES (?, ?, ?)')
      .run(tenantName, tenantSlug, tenantSlug);

    const tenantId = db.prepare('SELECT id FROM tenants WHERE slug = ?').get(tenantSlug).id;
    checkMark(`Tenant "${tenantName}" criado (slug: ${tenantSlug})`);

    // ── Create admin user ──────────────────────────────────────
    const hashed = bcrypt.hashSync(adminPassword, 10);
    db.prepare('INSERT INTO users (username, password, name, role, tenant_id) VALUES (?, ?, ?, ?, ?)')
      .run(adminUsername, hashed, adminName, 'superadmin', tenantId);
    checkMark(`Superadmin "${adminUsername}" criado`);

    // ── Seed default products ──────────────────────────────────
    const insertProduct = db.prepare(
      'INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const products = [
      ['Kit de Reparos Volkswagen', 'Kit completo para revisão básica VW — filtros, velas e componentes.', 89.90, 'media/kit-reparos-volks.jpeg', 'kit', 10],
      ['Kit de Reparos Gol', 'Kit específico para VW Gol — pastilhas de freio, óleo e filtros.', 79.90, 'media/kit-reparos-gol.jpeg', 'kit', 8],
      ['Kit de Reparos Geral', 'Kit universal para manutenção preventiva.', 69.90, 'media/kit-reparos.jpeg', 'kit', 15],
      ['Troca de Óleo Completa', 'Óleo sintético + filtro premium + mão de obra.', 180.00, 'media/troca-oleo.jpg', 'servico', 20],
      ['Diagnóstico Computadorizado', 'Scanner automotivo completo com relatório.', 120.00, 'media/diagnostico.jpg', 'servico', 99],
      ['Alinhamento e Balanceamento', 'Alinhamento 3D + balanceamento de rodas.', 89.90, 'media/alinhamento.jpg', 'servico', 99],
      ['Pastilhas de Freio', 'Jogo de pastilhas de freio originais.', 149.90, 'media/pastilhas-freio.jpg', 'peca', 20],
      ['Filtro de Óleo', 'Filtro de óleo premium — diversas marcas.', 29.90, 'media/filtro-oleo.jpg', 'peca', 30],
    ];
    for (const p of products) {
      insertProduct.run(...p, tenantId);
    }
    checkMark(`${products.length} produtos padrão adicionados`);

    // ── Seed default prizes ────────────────────────────────────
    const insertPrize = db.prepare(
      'INSERT INTO ofertas_prizes (name, description, type, value, probability_weight, color, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const prizes = [
      ['10% OFF', 'Desconto de 10% em qualquer serviço', 'desconto_pct', 10, 30, '#0044CC'],
      ['15% OFF', 'Desconto de 15% em diagnóstico', 'desconto_pct', 15, 20, '#0A84FF'],
      ['20% OFF', 'Super desconto de 20% em revisão', 'desconto_pct', 20, 15, '#30D158'],
      ['Troca de Óleo Grátis', 'Ganhe uma troca de óleo sintético', 'produto_gratis', 0, 5, '#FF9F0A'],
      ['Diagnóstico Grátis', 'Diagnóstico computadorizado sem custo', 'produto_gratis', 0, 8, '#5AC8FA'],
      ['R$ 50 OFF', 'R$ 50 de desconto em qualquer serviço', 'desconto_fixo', 50, 12, '#F5C800'],
      ['Lavagem Grátis', 'Lavagem completa do seu carro', 'brinde', 0, 10, '#BF5AF2'],
    ];
    for (const p of prizes) {
      insertPrize.run(...p, tenantId);
    }
    checkMark(`${prizes.length} prêmios da roleta adicionados`);

    db.close();
    checkMark('Banco de dados inicializado com sucesso');

  } catch (err) {
    errorMark(`Erro ao inicializar banco: ${err.message}`);
    console.error(err);
    process.exit(1);
  }

  // ─── 6. Summary ─────────────────────────────────────────────
  title('🎉 Instalação Concluída!');
  console.log();
  console.log(`  ${BOLD}${CYAN}─── Credenciais de Acesso ───${RESET}`);
  console.log(`  ${BOLD}URL:${RESET}          http://localhost:${port}`);
  console.log(`  ${BOLD}Admin:${RESET}        http://localhost:${port}/admin`);
  console.log(`  ${BOLD}Login:${RESET}        http://localhost:${port}/login`);
  console.log();
  console.log(`  ${BOLD}Usuário:${RESET}      ${adminUsername}`);
  console.log(`  ${BOLD}Senha:${RESET}        ${adminPassword}`);
  console.log(`  ${BOLD}Tenant:${RESET}       ${tenantName} (${tenantSlug})`);
  console.log();
  console.log(`  ${BOLD}${YELLOW}─── Para Iniciar o Servidor ───${RESET}`);
  console.log(`  ${DIM}$ node server.js${RESET}`);
  console.log();
  console.log(`  ${BOLD}${MAGENTA}─── Próximos Passos ───${RESET}`);
  console.log(`  ${DIM}1.${RESET} Configure Google OAuth no .env para login social`);
  console.log(`  ${DIM}2.${RESET} Acesse Config > Usuários para criar operadores`);
  console.log(`  ${DIM}3.${RESET} Configure WhatsApp Web para notificações`);
  console.log(`  ${DIM}4.${RESET} Personalize os dados da oficina em Config ⚙️`);
  console.log();

  // ─── 7. Ask to start server ──────────────────────────────────
  if (!isQuick) {
    const startNow = await ask('  Deseja iniciar o servidor agora? (S/n): ');
    if (startNow.toLowerCase() !== 'n') {
      console.log(`\n  ${CYAN}Iniciando servidor em segundo plano...${RESET}\n`);
      const { spawn } = require('child_process');
      const child = spawn('node', ['server.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        detached: true
      });
      child.unref();
      console.log(`  ${GREEN}Servidor iniciado (PID: ${child.pid})${RESET}`);
      console.log(`  ${DIM}Acesse: http://localhost:${port}/admin${RESET}\n`);
    }
  }

  rl.close();
  console.log();
}

main().catch(err => {
  console.error(`\n${RED}Erro:${RESET}`, err.message);
  process.exit(1);
});
