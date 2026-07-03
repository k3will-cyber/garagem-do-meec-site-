const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const https = require('https');
const supabase = require('./lib/supabase');
// WhatsApp carregado de forma lazy para não travar o servidor
let whatsapp = null;
try {
  whatsapp = require('./lib/whatsapp');
} catch (e) {
  console.warn('⚠️ Módulo WhatsApp não pôde ser carregado:', e.message);
  // Módulo fake para evitar crashes
  whatsapp = {
    init: () => { console.log('📱 WhatsApp: desabilitado (módulo não carregou)'); return false; },
    registerRoutes: () => {},
    notifyNewLead: () => Promise.resolve(false),
    sendAutoReply: () => Promise.resolve(false),
    notifyStatusChange: () => Promise.resolve(false),
    getClient: () => null,
    isReady: () => false
  };
}

const app = express();

// ─── Environment Variables ───────────────────────────────────────
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET || 'garagem-do-meec-dev-secret';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Pablo Jhonatan';
const REGISTER_SECRET = process.env.REGISTER_SECRET || 'meec-admin-2026';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'garagem.db');
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
// ⚠️  Railway NÃO define NODE_ENV automaticamente!
// Você PRECISA adicionar NODE_ENV=production nas variáveis de ambiente do Railway
// para que os cookies de sessão funcionem corretamente com HTTPS.
const isProduction = NODE_ENV === 'production';

// ─── Database Setup ──────────────────────────────────────────────
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
    email TEXT DEFAULT '',
    role TEXT DEFAULT 'admin',
    avatar TEXT,
    google_id TEXT UNIQUE,
    auth_provider TEXT DEFAULT 'local',
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
    responsavel TEXT DEFAULT 'Pablo Jhonatan',
    veiculo TEXT,
    servico_interesse TEXT,
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

// ─── Database Migration: Add pipeline columns to existing leads ──
try {
  db.exec(`
    ALTER TABLE leads ADD COLUMN valor REAL DEFAULT 0;
  `);
} catch (e) { /* column already exists */ }
try {
  db.exec(`
    ALTER TABLE leads ADD COLUMN origem TEXT DEFAULT 'site';
  `);
} catch (e) {}
try {
  db.exec(`
    ALTER TABLE leads ADD COLUMN notas TEXT;
  `);
} catch (e) {}
try {
  db.exec(`
    ALTER TABLE leads ADD COLUMN data_proximo_contato DATETIME;
  `);
} catch (e) {}
try {
  db.exec(`
    ALTER TABLE leads ADD COLUMN ultimo_contato DATETIME;
  `);
} catch (e) {}
try {
  db.exec(`
    ALTER TABLE leads ADD COLUMN responsavel TEXT DEFAULT 'Pablo Jhonatan';
  `);
} catch (e) {}
try {
  db.exec(`
    ALTER TABLE leads ADD COLUMN veiculo TEXT;
  `);
} catch (e) {}
try {
  db.exec(`
    ALTER TABLE leads ADD COLUMN servico_interesse TEXT;
  `);
} catch (e) {}
try {
  db.exec(`
    ALTER TABLE leads ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;
  `);
} catch (e) {}
try {
  // Migrate old statuses to new pipeline
  db.prepare("UPDATE leads SET status = 'lead_qualificado' WHERE status = 'new'").run();
  db.prepare("UPDATE leads SET status = 'lead_prospectado' WHERE status = 'contacted'").run();
  db.prepare("UPDATE leads SET status = 'orcamento_finalizado' WHERE status = 'done'").run();
} catch (e) {}

// Create index for pipeline queries
try {
  db.exec('CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)');
} catch (e) {}

try {
  db.exec('CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at)');
} catch (e) {}

console.log('✅ Pipeline de leads migrado para 5 estágios');

// ─── Database Migration: Add new user columns for Google OAuth ────
try {
  db.exec(`ALTER TABLE users ADD COLUMN email TEXT DEFAULT '';`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE users ADD COLUMN avatar TEXT;`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local';`);
} catch (e) {}
console.log('✅ Colunas de autenticação adicionadas à tabela users');

// ─── Multi-tenant SAAS Tables ────────────────────────────────────
db.exec(`
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
`);

// Add tenant_id to existing tables
try { db.exec(`ALTER TABLE users ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);`); } catch (e) {}
try { db.exec(`ALTER TABLE leads ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);`); } catch (e) {}
try { db.exec(`ALTER TABLE estoque ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);`); } catch (e) {}
try { db.exec(`ALTER TABLE pedidos ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);`); } catch (e) {}
try { db.exec(`ALTER TABLE ofertas_prizes ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);`); } catch (e) {}
try { db.exec(`ALTER TABLE ofertas_spins ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);`); } catch (e) {}

console.log('✅ Colunas multi-tenant adicionadas');

// ─── Create Ordem de Serviço (OS) tables ─────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS ordens_servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER REFERENCES tenants(id),
    lead_id INTEGER REFERENCES leads(id),
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
    os_id INTEGER REFERENCES ordens_servico(id),
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
`);

console.log('✅ Tabelas OS e Financeiro criadas');

// Create default tenant if none exists
const tenantCount = db.prepare('SELECT COUNT(*) as count FROM tenants').get().count;
if (tenantCount === 0) {
  db.prepare('INSERT INTO tenants (name, slug, subdomain) VALUES (?, ?, ?)')
    .run('Garagem do MEEC', 'meec', 'meec');
  console.log('✅ Tenant padrão "Garagem do MEEC" criado');
}

// Get default tenant
const defaultTenant = db.prepare('SELECT id FROM tenants ORDER BY id LIMIT 1').get();
const DEFAULT_TENANT_ID = defaultTenant ? defaultTenant.id : 1;

// ─── Auto-seed admin user on first run ───────────────────────────
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get(ADMIN_USERNAME);
if (!adminExists) {
  const hashed = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)')
    .run(ADMIN_USERNAME, hashed, ADMIN_NAME, 'superadmin');
  console.log(`✅ Superadmin user "${ADMIN_USERNAME}" created automatically`);
}

// ─── Seed default products if estoque is empty ───────────────────
const productCount = db.prepare('SELECT COUNT(*) as count FROM estoque').get().count;
if (productCount === 0) {
  const insert = db.prepare('INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade) VALUES (?, ?, ?, ?, ?, ?)');
  const defaultProducts = [
    { nome: 'Kit de Reparos Volkswagen', descricao: 'Kit completo para revisão básica VW — filtros, velas e componentes.', preco: 89.90, imagem: 'media/kit-reparos-volks.jpeg', categoria: 'kit', quantidade: 10 },
    { nome: 'Kit de Reparos Gol', descricao: 'Kit específico para VW Gol — pastilhas de freio, óleo e filtros.', preco: 79.90, imagem: 'media/kit-reparos-gol.jpeg', categoria: 'kit', quantidade: 8 },
    { nome: 'Kit de Reparos Geral', descricao: 'Kit universal para manutenção preventiva — ideal para qualquer modelo.', preco: 69.90, imagem: 'media/kit-reparos.jpeg', categoria: 'kit', quantidade: 15 },
    { nome: 'Troca de Óleo Completa', descricao: 'Óleo sintético + filtro premium + mão de obra especializada.', preco: 180.00, imagem: 'media/troca-oleo.jpg', categoria: 'servico', quantidade: 20 },
  ];
  for (const p of defaultProducts) {
    insert.run(p.nome, p.descricao, p.preco, p.imagem, p.categoria, p.quantidade);
  }
  console.log(`✅ ${defaultProducts.length} default products seeded`);
}

// ─── Middleware ───────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Railway (needed for secure cookies behind proxy)
if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true,
    secure: isProduction, // true in production with HTTPS
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24h
  }
}));

// Static files
app.use(express.static(path.join(__dirname)));

// ─── Multi-tenant Middleware ─────────────────────────────────────
const { createTenantMiddleware } = require('./lib/tenant');
const tenant = createTenantMiddleware(db);
app.use(tenant.middleware);

// ─── Passport Initialization ─────────────────────────────────────
const { setupPassport } = require('./lib/passport');
app.use(passport.initialize());
app.use(passport.session());
const passportInstance = setupPassport(db);

// ─── Health Check (for Railway) ──────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    environment: NODE_ENV,
    db: fs.existsSync(DB_PATH) ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ─── Roles & Permissions ─────────────────────────────────────────
const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  OPERADOR: 'operador'
};

const ROLE_HIERARCHY = {
  superadmin: 100,
  admin: 50,
  operador: 10
};

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  operador: 'Operador'
};

function roleLevel(role) {
  return ROLE_HIERARCHY[role] || 0;
}

function hasMinRole(userRole, minRole) {
  return roleLevel(userRole) >= roleLevel(minRole);
}

// ─── Auth Middleware ──────────────────────────────────────────────
function isAuthenticated(req, res, next) {
  // Check session auth (admin) OR passport auth (Google/user)
  if (req.session && req.session.userId) {
    // Normalize legacy roles on the fly
    if (!req.session.userRole || req.session.userRole === 'user') {
      req.session.userRole = ROLES.OPERADOR;
    }
    return next();
  }
  if (req.isAuthenticated && req.isAuthenticated()) {
    // Set session from passport for downstream compatibility
    req.session.userId = req.user.id;
    const role = req.user.role || ROLES.OPERADOR;
    req.session.userRole = role === 'user' ? ROLES.OPERADOR : role;
    req.session.username = req.user.username;
    req.session.name = req.user.name;
    return next();
  }
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  const role = req.session && req.session.userRole;
  if (role && hasMinRole(role, ROLES.ADMIN)) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.session && req.session.userRole;
    if (role && allowedRoles.includes(role)) {
      return next();
    }
    return res.status(403).json({ error: `Acesso negado. Funções permitidas: ${allowedRoles.join(', ')}` });
  };
}

// operador pode visualizar dados básicos (leads, OS, estoque)
function isStaff(req, res, next) {
  const role = req.session && req.session.userRole;
  if (role && hasMinRole(role, ROLES.OPERADOR)) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado' });
}

// operador pode atualizar status de leads e OS, mas não criar/excluir
function canUpdateForOperador(req, res, next) {
  const role = req.session && req.session.userRole;
  if (role && hasMinRole(role, ROLES.OPERADOR)) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado' });
}

function canViewFinanceiro(req, res, next) {
  const role = req.session && req.session.userRole;
  if (role && (role === ROLES.SUPERADMIN || role === ROLES.ADMIN)) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar o financeiro.' });
}

function canDelete(req, res, next) {
  const role = req.session && req.session.userRole;
  if (role && hasMinRole(role, ROLES.ADMIN)) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem excluir registros.' });
}

// ─── API Routes ──────────────────────────────────────────────────

// Auth
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha obrigatórios' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.username = user.username;
    req.session.name = user.name;

    res.json({ success: true, name: user.name, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/register', (req, res) => {
  const { username, password, name, secret } = req.body;
  
  // Secret key to prevent unauthorized registration
  if (secret !== REGISTER_SECRET) {
    return res.status(403).json({ error: 'Chave de registro inválida' });
  }

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(409).json({ error: 'Usuário já existe' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (username, password, name) VALUES (?, ?, ?)').run(username, hashed, name);
    res.json({ success: true, message: 'Usuário criado com sucesso' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/logout', (req, res) => {
  // Limpa sessão do Passport
  if (req.logout) {
    req.logout(() => {});
  }
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get('/api/me', (req, res) => {
  let userId = req.session && req.session.userId;
  let userName = req.session && req.session.name;
  let userRole = req.session && req.session.userRole;
  let userUsername = req.session && req.session.username;
  let userAvatar = null;

  // Check passport auth
  if (!userId && req.isAuthenticated && req.isAuthenticated()) {
    userId = req.user.id;
    userName = req.user.name;
    userRole = req.user.role;
    userUsername = req.user.username;
    userAvatar = req.user.avatar;
  }

  if (userId) {
    // Normalize role
    const role = userRole === 'user' ? ROLES.OPERADOR : (userRole || ROLES.OPERADOR);
    res.json({ 
      authenticated: true, 
      id: userId,
      name: userName,
      role,
      roleLabel: ROLE_LABELS[role] || role,
      username: userUsername,
      avatar: userAvatar
    });
  } else {
    res.json({ authenticated: false });
  }
});

// ─── Lead Pipeline Validation ────────────────────────────────────
const PIPELINE_STAGES = [
  'lead_qualificado',
  'lead_prospectado',
  'orcamento_ativo',
  'orcamento_fechado',
  'orcamento_finalizado'
];

const PIPELINE_LABELS = {
  lead_qualificado: 'Lead Qualificado',
  lead_prospectado: 'Lead Prospectado',
  orcamento_ativo: 'Orçamento Ativo',
  orcamento_fechado: 'Orçamento Fechado',
  orcamento_finalizado: 'Orçamento Finalizado'
};

const PIPELINE_COLORS = {
  lead_qualificado: '#0A84FF',
  lead_prospectado: '#FF9F0A',
  orcamento_ativo: '#5AC8FA',
  orcamento_fechado: '#30D158',
  orcamento_finalizado: '#636366'
};

// ─── Formspree config ────────────────────────────────────────────
const FORMSPREE_ID = process.env.FORMSPREE_ID || 'xykqdkkz';

// ─── Supabase config (from env) ──────────────────────────────────
// SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

// ─── Leads ───────────────────────────────────────────────────────

// Public: Create lead from site form
app.post('/api/leads', (req, res) => {
  const { name, whatsapp, email, message, origem, veiculo, servico_interesse } = req.body;
  
  if (!name || !whatsapp) {
    return res.status(400).json({ error: 'Nome e WhatsApp são obrigatórios' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO leads (name, whatsapp, email, message, origem, veiculo, servico_interesse, status, tenant_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'lead_qualificado', ?)
    `).run(
      name.trim(),
      whatsapp.trim(),
      (email || '').trim(),
      (message || '').trim(),
      origem || 'site',
      veiculo || null,
      servico_interesse || null,
      req.tenantId || 1
    );

    // Forward to Formspree
    if (FORMSPREE_ID) {
      const formData = JSON.stringify({
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        email: (email || '').trim(),
        message: (message || '').trim(),
        _subject: `Novo lead - Garagem do MEEC: ${name.trim()}`
      });
      const reqF = https.request({
        hostname: 'formspree.io',
        path: `/f/${FORMSPREE_ID}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Length': formData.length
        }
      });
      reqF.write(formData);
      reqF.end();
    }

    // Sync to Supabase
    const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
    if (newLead) supabase.syncLead(newLead);

    // WhatsApp notification + auto-reply
    if (newLead) {
      whatsapp.notifyNewLead(newLead);
      whatsapp.sendAutoReply(newLead);
    }

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(500).json({ error: 'Erro ao salvar lead' });
  }
});

// Admin: List all leads with filters
app.get('/api/leads', isAuthenticated, isStaff, (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT * FROM leads WHERE tenant_id = ?';
  const params = [req.tenantId];
  const conditions = [];

  if (status && PIPELINE_STAGES.includes(status)) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (search) {
    conditions.push('(name LIKE ? OR whatsapp LIKE ? OR email LIKE ? OR message LIKE ? OR veiculo LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';
  
  const leads = db.prepare(query).all(...params);
  res.json(leads);
});

// Admin: Update lead (pipeline stage + fields)
app.put('/api/leads/:id', isAuthenticated, canUpdateForOperador, (req, res) => {
  const { status, valor, notas, data_proximo_contato, responsavel, veiculo, servico_interesse, name, whatsapp, email } = req.body;
  
  // Validate pipeline stage if provided
  if (status && !PIPELINE_STAGES.includes(status)) {
    return res.status(400).json({ 
      error: 'Estágio inválido',
      validStages: PIPELINE_STAGES
    });
  }

  const fields = [];
  const params = [];

  if (status) { fields.push('status = ?'); params.push(status); }
  if (valor !== undefined) { fields.push('valor = ?'); params.push(valor); }
  if (notas !== undefined) { fields.push('notas = ?'); params.push(notas); }
  if (data_proximo_contato !== undefined) { fields.push('data_proximo_contato = ?'); params.push(data_proximo_contato); }
  if (responsavel) { fields.push('responsavel = ?'); params.push(responsavel); }
  if (veiculo !== undefined) { fields.push('veiculo = ?'); params.push(veiculo); }
  if (servico_interesse !== undefined) { fields.push('servico_interesse = ?'); params.push(servico_interesse); }
  if (name) { fields.push('name = ?'); params.push(name); }
  if (whatsapp) { fields.push('whatsapp = ?'); params.push(whatsapp); }
  if (email !== undefined) { fields.push('email = ?'); params.push(email); }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  fields.push('ultimo_contato = CURRENT_TIMESTAMP');
  params.push(req.params.id);

  params.push(req.params.id);

  db.prepare(`UPDATE leads SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`).run(...params, req.tenantId);
  
  // Get old status before updating
  const oldLead = db.prepare('SELECT * FROM leads WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  const oldStatus = oldLead ? oldLead.status : null;
  
  // Get updated lead for response
  const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  
  // Sync to Supabase
  supabase.syncLead(lead);
  
  // WhatsApp notification on status change
  if (status && status !== oldStatus) {
    whatsapp.notifyStatusChange(lead, oldStatus);
  }

  res.json({ success: true, lead });
});

// Admin: Quick status update (pipeline transition)
app.put('/api/leads/:id/status', isAuthenticated, canUpdateForOperador, (req, res) => {
  const { status } = req.body;
  
  if (!status || !PIPELINE_STAGES.includes(status)) {
    return res.status(400).json({ 
      error: 'Estágio inválido',
      validStages: PIPELINE_STAGES
    });
  }

  // Get old status
  const oldLead = db.prepare('SELECT * FROM leads WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  const oldStatus = oldLead ? oldLead.status : null;

  db.prepare('UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP, ultimo_contato = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?')
    .run(status, req.params.id, req.tenantId);

  const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  
  // Sync to Supabase
  supabase.syncLead(lead);
  
  // WhatsApp notification on status transition
  whatsapp.notifyStatusChange(lead, oldStatus);

  res.json({ success: true, lead });
});

// Admin: Delete lead
app.delete('/api/leads/:id', isAuthenticated, canDelete, (req, res) => {
  supabase.deleteLead(parseInt(req.params.id));
  db.prepare('DELETE FROM leads WHERE id = ? AND tenant_id = ?').run(req.params.id, req.tenantId);
  res.json({ success: true });
});

// Admin: Pipeline summary (counts per stage)
app.get('/api/leads/pipeline-summary', isAuthenticated, isStaff, (req, res) => {
  const counts = db.prepare(`
    SELECT status, COUNT(*) as count, SUM(valor) as total_valor
    FROM leads
    WHERE tenant_id = ?
    GROUP BY status
  `).all(req.tenantId);
  
  const summary = PIPELINE_STAGES.map(stage => {
    const found = counts.find(c => c.status === stage);
    return {
      stage,
      label: PIPELINE_LABELS[stage],
      color: PIPELINE_COLORS[stage],
      count: found ? found.count : 0,
      total_valor: found ? found.total_valor : 0
    };
  });

  res.json(summary);
});

// Admin: Lead timeline (activity log)
app.get('/api/leads/:id/timeline', isAuthenticated, isStaff, (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });

  const timeline = [
    {
      date: lead.created_at,
      type: 'created',
      description: 'Lead criado',
      detail: `Origem: ${lead.origem || 'site'}`
    }
  ];

  if (lead.ultimo_contato && lead.ultimo_contato !== lead.created_at) {
    timeline.push({
      date: lead.ultimo_contato,
      type: 'contact',
      description: 'Último contato',
      detail: `Status atual: ${PIPELINE_LABELS[lead.status] || lead.status}`
    });
  }

  res.json(timeline.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Estoque
app.get('/api/estoque', (req, res) => {
  const produtos = db.prepare('SELECT * FROM estoque WHERE ativo = 1 AND tenant_id = ? ORDER BY nome').all(req.tenantId);
  res.json(produtos);
});

app.get('/api/estoque/all', isAuthenticated, isStaff, (req, res) => {
  const produtos = db.prepare('SELECT * FROM estoque WHERE tenant_id = ? ORDER BY nome').all(req.tenantId);
  res.json(produtos);
});

app.post('/api/estoque', isAuthenticated, isAdmin, (req, res) => {
  const { nome, descricao, preco, imagem, categoria, quantidade } = req.body;
  if (!nome || !preco) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }
  db.prepare('INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(nome, descricao || '', parseFloat(preco), imagem || '', categoria || 'geral', parseInt(quantidade) || 0, req.tenantId);
  res.json({ success: true });
});

app.put('/api/estoque/:id', isAuthenticated, isAdmin, (req, res) => {
  const { nome, descricao, preco, imagem, categoria, quantidade, ativo } = req.body;
  db.prepare('UPDATE estoque SET nome=?, descricao=?, preco=?, imagem=?, categoria=?, quantidade=?, ativo=? WHERE id=? AND tenant_id=?')
    .run(nome, descricao, parseFloat(preco), imagem, categoria, parseInt(quantidade), ativo ?? 1, req.params.id, req.tenantId);
  res.json({ success: true });
});

app.delete('/api/estoque/:id', isAuthenticated, canDelete, (req, res) => {
  db.prepare('DELETE FROM estoque WHERE id = ? AND tenant_id = ?').run(req.params.id, req.tenantId);
  res.json({ success: true });
});

// Pedidos
app.get('/api/pedidos', isAuthenticated, isAdmin, (req, res) => {
  const pedidos = db.prepare('SELECT * FROM pedidos WHERE tenant_id = ? ORDER BY created_at DESC').all(req.tenantId);
  res.json(pedidos.map(p => ({ ...p, items: JSON.parse(p.items) })));
});

app.put('/api/pedidos/:id', isAuthenticated, isAdmin, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE pedidos SET status = ? WHERE id = ? AND tenant_id = ?').run(status, req.params.id, req.tenantId);
  res.json({ success: true });
});

// Vagas
app.get('/api/vagas', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  let vaga = db.prepare('SELECT vagas FROM vagas WHERE data = ?').get(today);
  if (!vaga) {
    // Default: 3 vagas, reduce on weekends
    const dayOfWeek = new Date().getDay();
    const defaultVagas = (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 3;
    res.json({ vagas: defaultVagas, data: today });
  } else {
    res.json({ vagas: vaga.vagas, data: today });
  }
});

app.put('/api/vagas', isAuthenticated, isAdmin, (req, res) => {
  const { vagas } = req.body;
  const today = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO vagas (data, vagas) VALUES (?, ?) ON CONFLICT(data) DO UPDATE SET vagas = ?')
    .run(today, vagas, vagas);
  res.json({ success: true });
});

// Dashboard stats
app.get('/api/stats', isAuthenticated, isStaff, (req, res) => {
  const tid = req.tenantId;
  const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE tenant_id = ?').get(tid).count;
  const qualificados = db.prepare("SELECT COUNT(*) as count FROM leads WHERE tenant_id = ? AND status = 'lead_qualificado'").get(tid).count;
  const orcamentosAtivos = db.prepare("SELECT COUNT(*) as count FROM leads WHERE tenant_id = ? AND status IN ('orcamento_ativo', 'orcamento_fechado')").get(tid).count;
  const valorTotalPipeline = db.prepare("SELECT COALESCE(SUM(valor), 0) as total FROM leads WHERE tenant_id = ? AND status IN ('orcamento_ativo', 'orcamento_fechado')").get(tid).total;
  const totalPedidos = db.prepare('SELECT COUNT(*) as count FROM pedidos WHERE tenant_id = ?').get(tid).count;
  const pendingPedidos = db.prepare("SELECT COUNT(*) as count FROM pedidos WHERE tenant_id = ? AND status = 'novo'").get(tid).count;
  const totalEstoque = db.prepare('SELECT COUNT(*) as count FROM estoque WHERE tenant_id = ? AND ativo = 1').get(tid).count;
  const estoqueBaixo = db.prepare('SELECT COUNT(*) as count FROM estoque WHERE tenant_id = ? AND quantidade > 0 AND quantidade < 5').get(tid).count;

  res.json({
    totalLeads,
    qualificados,
    orcamentosAtivos,
    valorTotalPipeline,
    totalPedidos,
    pendingPedidos,
    totalEstoque,
    estoqueBaixo
  });
});

// ─── MEEC OFERTAS — Roleta de Prêmios ────────────────────────────

// Create ofertas tables
try {
  db.exec(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) { console.log('ofertas_prizes table already exists or error:', e.message); }

try {
  db.exec(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) { console.log('ofertas_spins table already exists or error:', e.message); }

// Seed default prizes if empty
const prizeCount = db.prepare('SELECT COUNT(*) as count FROM ofertas_prizes').get().count;
if (prizeCount === 0) {
  const insertPrize = db.prepare('INSERT INTO ofertas_prizes (name, description, type, value, probability_weight, color) VALUES (?, ?, ?, ?, ?, ?)');
  const defaultPrizes = [
    { name: '10% OFF', description: 'Desconto de 10% em qualquer serviço', type: 'desconto_pct', value: 10, probability_weight: 30, color: '#0044CC' },
    { name: '15% OFF', description: 'Desconto de 15% em diagnóstico', type: 'desconto_pct', value: 15, probability_weight: 20, color: '#0A84FF' },
    { name: '20% OFF', description: 'Super desconto de 20% em revisão', type: 'desconto_pct', value: 20, probability_weight: 15, color: '#30D158' },
    { name: 'Troca de Óleo Grátis', description: 'Ganhe uma troca de óleo sintético', type: 'produto_gratis', value: 0, probability_weight: 5, color: '#FF9F0A' },
    { name: 'Diagnóstico Grátis', description: 'Diagnóstico computadorizado sem custo', type: 'produto_gratis', value: 0, probability_weight: 8, color: '#5AC8FA' },
    { name: 'R$ 50 OFF', description: 'R$ 50 de desconto em qualquer serviço', type: 'desconto_fixo', value: 50, probability_weight: 12, color: '#F5C800' },
    { name: 'Lavagem Grátis', description: 'Lavagem completa do seu carro', type: 'brinde', value: 0, probability_weight: 10, color: '#BF5AF2' },
    { name: 'Tente Novamente', description: 'Não foi dessa vez! Tente novamente', type: 'tentar_novamente', value: 0, probability_weight: 0, color: '#636366' },
  ];
  for (const p of defaultPrizes) {
    insertPrize.run(p.name, p.description, p.type, p.value, p.probability_weight, p.color);
  }
  console.log(`✅ ${defaultPrizes.length} prizes seeded for MEEC OFERTAS`);
}

// Public: List active prizes for the wheel
app.get('/api/ofertas/prizes', (req, res) => {
  const prizes = db.prepare('SELECT id, name, description, type, value, color, probability_weight FROM ofertas_prizes WHERE ativo = 1 ORDER BY id').all();
  res.json(prizes);
});

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCoupon() {
  let code = 'MEEC-';
  for (let i = 0; i < 8; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

// Public: Spin the wheel (requires name + whatsapp)
app.post('/api/ofertas/spin', (req, res) => {
  const { client_name, client_whatsapp } = req.body;
  
  if (!client_name || !client_whatsapp) {
    return res.status(400).json({ error: 'Nome e WhatsApp são obrigatórios' });
  }

  try {
    // Get active prizes with probability weights
    const prizes = db.prepare('SELECT * FROM ofertas_prizes WHERE ativo = 1 AND probability_weight > 0 ORDER BY id').all();
    
    if (prizes.length === 0) {
      return res.status(400).json({ error: 'Nenhum prêmio disponível no momento' });
    }

    // Weighted random selection
    const totalWeight = prizes.reduce((sum, p) => sum + p.probability_weight, 0);
    let random = Math.random() * totalWeight;
    let selectedPrize = prizes[0];
    
    for (const prize of prizes) {
      random -= prize.probability_weight;
      if (random <= 0) {
        selectedPrize = prize;
        break;
      }
    }

    // Generate coupon code
    const couponCode = generateCoupon();

    // Save spin
    db.prepare(`
      INSERT INTO ofertas_spins (client_name, client_whatsapp, prize_id, prize_name, prize_type, prize_value, coupon_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      client_name.trim(),
      client_whatsapp.trim(),
      selectedPrize.id,
      selectedPrize.name,
      selectedPrize.type,
      selectedPrize.value,
      couponCode
    );

    // Also create a lead from the spin
    try {
      db.prepare(`
        INSERT INTO leads (name, whatsapp, message, status, origem)
        VALUES (?, ?, ?, 'lead_qualificado', 'meec_ofertas')
      `).run(
        client_name.trim(),
        client_whatsapp.trim(),
        `🎰 Spin na Roleta MEEC OFERTAS - Ganhou: ${selectedPrize.name} (cupom: ${couponCode})`
      );
    } catch (e) { /* ignore lead creation error */ }

    res.json({
      success: true,
      prize: {
        id: selectedPrize.id,
        name: selectedPrize.name,
        description: selectedPrize.description,
        type: selectedPrize.type,
        value: selectedPrize.value,
        color: selectedPrize.color
      },
      coupon_code: selectedPrize.type !== 'tentar_novamente' ? couponCode : null
    });
  } catch (err) {
    console.error('Spin error:', err);
    res.status(500).json({ error: 'Erro ao processar giro' });
  }
});

// Admin: List all spins
app.get('/api/ofertas/spins', isAuthenticated, isAdmin, (req, res) => {
  const { usado } = req.query;
  let query = 'SELECT * FROM ofertas_spins';
  const params = [];
  
  if (usado !== undefined) {
    query += ' WHERE usado = ?';
    params.push(usado === '1' ? 1 : 0);
  }
  
  query += ' ORDER BY created_at DESC LIMIT 200';
  const spins = db.prepare(query).all(...params);
  res.json(spins);
});

// Admin: Mark coupon as used
app.put('/api/ofertas/spins/:id/usar', isAuthenticated, isAdmin, (req, res) => {
  db.prepare("UPDATE ofertas_spins SET usado = 1, usado_em = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Admin: Manage prizes (CRUD)
app.get('/api/ofertas/prizes/manage', isAuthenticated, isAdmin, (req, res) => {
  const prizes = db.prepare('SELECT * FROM ofertas_prizes ORDER BY id').all();
  res.json(prizes);
});

app.post('/api/ofertas/prizes', isAuthenticated, isAdmin, (req, res) => {
  const { name, description, type, value, probability_weight, color, image, estoque_id } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
  }
  db.prepare('INSERT INTO ofertas_prizes (name, description, type, value, probability_weight, color, image, estoque_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(name, description || '', type, parseFloat(value) || 0, parseInt(probability_weight) || 1, color || '#0044CC', image || null, estoque_id || null);
  res.json({ success: true });
});

app.put('/api/ofertas/prizes/:id', isAuthenticated, isAdmin, (req, res) => {
  const { name, description, type, value, probability_weight, color, image, ativo, estoque_id } = req.body;
  db.prepare('UPDATE ofertas_prizes SET name=?, description=?, type=?, value=?, probability_weight=?, color=?, image=?, ativo=?, estoque_id=? WHERE id=?')
    .run(name, description, type, parseFloat(value) || 0, parseInt(probability_weight) || 1, color, image, ativo !== undefined ? ativo : 1, estoque_id || null, req.params.id);
  res.json({ success: true });
});

app.delete('/api/ofertas/prizes/:id', isAuthenticated, isAdmin, (req, res) => {
  db.prepare('DELETE FROM ofertas_prizes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Admin: Stats for MEEC OFERTAS
app.get('/api/ofertas/stats', isAuthenticated, isAdmin, (req, res) => {
  const total_spins = db.prepare('SELECT COUNT(*) as count FROM ofertas_spins').get().count;
  const used_coupons = db.prepare('SELECT COUNT(*) as count FROM ofertas_spins WHERE usado = 1').get().count;
  const today_spins = db.prepare("SELECT COUNT(*) as count FROM ofertas_spins WHERE DATE(created_at) = DATE('now')").get().count;
  const total_prizes = db.prepare('SELECT COUNT(*) as count FROM ofertas_prizes WHERE ativo = 1').get().count;
  
  res.json({
    total_spins,
    used_coupons,
    today_spins,
    total_prizes
  });
});

// ─── Chart Data Endpoints ───────────────────────────────────────

// Leads over time (last 30 days)
app.get('/api/stats/leads-over-time', isAuthenticated, isAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM leads
    WHERE created_at >= DATE('now', '-30 days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all();
  res.json(rows);
});

// Pedidos over time (last 30 days)
app.get('/api/stats/pedidos-over-time', isAuthenticated, isAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM pedidos
    WHERE created_at >= DATE('now', '-30 days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all();
  res.json(rows);
});

// Leads by status
app.get('/api/stats/leads-by-status', isAuthenticated, isAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM leads
    GROUP BY status
  `).all();
  res.json(rows);
});

// Pedidos by status
app.get('/api/stats/pedidos-by-status', isAuthenticated, isAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM pedidos
    GROUP BY status
  `).all();
  res.json(rows);
});

// Estoque by category
app.get('/api/stats/estoque-by-category', isAuthenticated, isAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT categoria, COUNT(*) as count, SUM(quantidade) as total_qty
    FROM estoque
    WHERE ativo = 1
    GROUP BY categoria
    ORDER BY count DESC
  `).all();
  res.json(rows);
});

// Monthly comparison
app.get('/api/stats/monthly', isAuthenticated, isAdmin, (req, res) => {
  const thisMonth = db.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM leads WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')) as leads_this,
      (SELECT COUNT(*) FROM leads WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', '-1 month')) as leads_last,
      (SELECT COUNT(*) FROM pedidos WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')) as pedidos_this,
      (SELECT COUNT(*) FROM pedidos WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', '-1 month')) as pedidos_last
  `).get();
  res.json(thisMonth);
});

// ─── Client Portal — Consulta de Lead por WhatsApp ──────────────
app.get('/api/leads/consulta/:whatsapp', (req, res) => {
  const { whatsapp } = req.params;
  if (!whatsapp) {
    return res.status(400).json({ error: 'WhatsApp é obrigatório' });
  }

  try {
    // Clean the number for search
    const cleanNumber = whatsapp.replace(/\D/g, '');
    
    // Search for leads with this WhatsApp number
    const leads = db.prepare(`
      SELECT id, name, status, valor, veiculo, servico_interesse, 
             created_at, updated_at, message, origem
      FROM leads 
      WHERE REPLACE(REPLACE(REPLACE(REPLACE(whatsapp, '(', ''), ')', ''), '-', ''), ' ', '') LIKE ?
      ORDER BY created_at DESC
      LIMIT 5
    `).all(`%${cleanNumber}%`);

    if (leads.length === 0) {
      return res.json({ found: false, message: 'Nenhum atendimento encontrado com este WhatsApp' });
    }

    // Pipeline info for UI
    const pipelineInfo = {
      lead_qualificado: { etapa: 1, label: 'Lead Qualificado', color: '#0A84FF', icon: '🔵', desc: 'Recebemos seu contato e estamos analisando.' },
      lead_prospectado: { etapa: 2, label: 'Lead Prospectado', color: '#FF9F0A', icon: '🟡', desc: 'Já falamos com você e estamos entendendo suas necessidades.' },
      orcamento_ativo: { etapa: 3, label: 'Orçamento Ativo', color: '#5AC8FA', icon: '🔵', desc: 'Seu orçamento está sendo preparado pela nossa equipe.' },
      orcamento_fechado: { etapa: 4, label: 'Orçamento Fechado', color: '#30D158', icon: '🟢', desc: 'Orçamento aprovado! Seu veículo está na fila para o serviço.' },
      orcamento_finalizado: { etapa: 5, label: 'Serviço Finalizado', color: '#636366', icon: '⚪', desc: 'Serviço concluído! Seu carro já está pronto.' }
    };

    const result = leads.map(lead => ({
      ...lead,
      pipeline: pipelineInfo[lead.status] || { etapa: 0, label: lead.status, color: '#636366', icon: '📋', desc: '' }
    }));

    res.json({ found: true, leads: result });
  } catch (err) {
    console.error('Error consulting lead:', err);
    res.status(500).json({ error: 'Erro ao consultar lead' });
  }
});

// Public pipeline summary for display on site
app.get('/api/leads/public-summary', (req, res) => {
  try {
    const counts = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM leads
      GROUP BY status
    `).all();

    const stages = ['lead_qualificado', 'lead_prospectado', 'orcamento_ativo', 'orcamento_fechado', 'orcamento_finalizado'];
    const labels = {
      lead_qualificado: 'Leads em Análise',
      lead_prospectado: 'Em Contato',
      orcamento_ativo: 'Orçamentos Abertos',
      orcamento_fechado: 'Serviços Fechados',
      orcamento_finalizado: 'Finalizados'
    };

    const summary = stages.map(stage => {
      const found = counts.find(c => c.status === stage);
      return { stage, label: labels[stage], count: found ? found.count : 0 };
    });

    const total = summary.reduce((sum, s) => sum + s.count, 0);
    const ativos = summary.filter(s => ['lead_qualificado', 'lead_prospectado', 'orcamento_ativo'].includes(s.stage))
                         .reduce((sum, s) => sum + s.count, 0);

    res.json({ summary, total, ativos });
  } catch (err) {
    console.error('Error loading public summary:', err);
    res.status(500).json({ error: 'Erro ao carregar resumo' });
  }
});

// ─── OS (Ordem de Serviço) Routes ──────────────────────────────

// List OS with filters
app.get('/api/os', isAuthenticated, isStaff, (req, res) => {
  const { status, search, tenant_id } = req.query;
  const tid = tenant_id || req.tenantId;
  let query = 'SELECT * FROM ordens_servico WHERE tenant_id = ?';
  const params = [tid];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (cliente_nome LIKE ? OR veiculo LIKE ? OR placa LIKE ? OR numero_os LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  query += ' ORDER BY created_at DESC LIMIT 200';
  const ordens = db.prepare(query).all(...params);

  // Get item counts for each OS
  const result = ordens.map(os => {
    const itens = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(valor_total),0) as total FROM os_itens WHERE os_id = ?').get(os.id);
    return { ...os, itens_count: itens.count, itens_total: itens.total };
  });

  res.json(result);
});

// Get single OS with items
app.get('/api/os/:id', isAuthenticated, isStaff, (req, res) => {
  const os = db.prepare('SELECT * FROM ordens_servico WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!os) return res.status(404).json({ error: 'OS não encontrada' });

  const itens = db.prepare('SELECT * FROM os_itens WHERE os_id = ? ORDER BY id').all(os.id);
  const pagamentos = db.prepare('SELECT * FROM financeiro WHERE os_id = ? ORDER BY created_at').all(os.id);

  res.json({ ...os, itens, pagamentos });
});

// Create OS
app.post('/api/os', isAuthenticated, isAdmin, (req, res) => {
  const { lead_id, cliente_nome, cliente_whatsapp, cliente_email, veiculo, placa, km, servico_desc, data_prevista, prioridade, observacoes } = req.body;

  if (!cliente_nome || !veiculo) {
    return res.status(400).json({ error: 'Nome do cliente e veículo são obrigatórios' });
  }

  // Generate OS number (per tenant)
  const year = new Date().getFullYear().toString().slice(-2);
  const seq = db.prepare("SELECT COUNT(*) as count FROM ordens_servico WHERE tenant_id = ? AND strftime('%Y', created_at) = strftime('%Y', 'now')").get(req.tenantId).count + 1;
  const numero_os = `OS${year}-${String(seq).padStart(4, '0')}`;

  const result = db.prepare(`
    INSERT INTO ordens_servico (tenant_id, lead_id, numero_os, cliente_nome, cliente_whatsapp, cliente_email, veiculo, placa, km, servico_desc, data_prevista, prioridade, observacoes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.tenantId, lead_id || null, numero_os,
    cliente_nome.trim(), cliente_whatsapp || '', cliente_email || '',
    veiculo.trim(), placa || '', km || null, servico_desc || '',
    data_prevista || null, prioridade || 'normal', observacoes || ''
  );

  res.json({ success: true, id: result.lastInsertRowid, numero_os });
});

// Update OS
app.put('/api/os/:id', isAuthenticated, canUpdateForOperador, (req, res) => {
  const os = db.prepare('SELECT * FROM ordens_servico WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!os) return res.status(404).json({ error: 'OS não encontrada' });

  const { status, cliente_nome, cliente_whatsapp, cliente_email, veiculo, placa, km, servico_desc,
          data_prevista, data_saida, prioridade, valor_mao_obra, valor_pecas, desconto,
          forma_pagamento, observacoes } = req.body;

  const fields = [];
  const params = [];

  if (status) { fields.push('status = ?'); params.push(status); }
  if (cliente_nome) { fields.push('cliente_nome = ?'); params.push(cliente_nome); }
  if (cliente_whatsapp !== undefined) { fields.push('cliente_whatsapp = ?'); params.push(cliente_whatsapp); }
  if (cliente_email !== undefined) { fields.push('cliente_email = ?'); params.push(cliente_email); }
  if (veiculo) { fields.push('veiculo = ?'); params.push(veiculo); }
  if (placa !== undefined) { fields.push('placa = ?'); params.push(placa); }
  if (km !== undefined) { fields.push('km = ?'); params.push(km); }
  if (servico_desc !== undefined) { fields.push('servico_desc = ?'); params.push(servico_desc); }
  if (data_prevista !== undefined) { fields.push('data_prevista = ?'); params.push(data_prevista); }
  if (data_saida !== undefined) { fields.push('data_saida = ?'); params.push(data_saida); }
  if (prioridade) { fields.push('prioridade = ?'); params.push(prioridade); }
  if (valor_mao_obra !== undefined) { fields.push('valor_mao_obra = ?'); params.push(valor_mao_obra); }
  if (valor_pecas !== undefined) { fields.push('valor_pecas = ?'); params.push(valor_pecas); }
  if (desconto !== undefined) { fields.push('desconto = ?'); params.push(desconto); }
  if (forma_pagamento !== undefined) { fields.push('forma_pagamento = ?'); params.push(forma_pagamento); }
  if (observacoes !== undefined) { fields.push('observacoes = ?'); params.push(observacoes); }

  // Recalc total
  const m_o = valor_mao_obra !== undefined ? valor_mao_obra : os.valor_mao_obra;
  const p = valor_pecas !== undefined ? valor_pecas : os.valor_pecas;
  const d = desconto !== undefined ? desconto : os.desconto;
  const total = (parseFloat(m_o) + parseFloat(p)) - parseFloat(d);
  fields.push('valor_total = ?');
  params.push(total);
  fields.push('updated_at = CURRENT_TIMESTAMP');

  params.push(req.params.id);
  db.prepare(`UPDATE ordens_servico SET ${fields.join(', ')} WHERE id = ?`).run(...params);

  // If status changed to 'finalizado', set data_saida
  if (status === 'finalizado' && os.status !== 'finalizado') {
    db.prepare('UPDATE ordens_servico SET data_saida = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
  }

  // Auto-create financeiro entry when OS is closed
  if (status === 'finalizado' && os.status !== 'finalizado') {
    const updated = db.prepare('SELECT * FROM ordens_servico WHERE id = ?').get(req.params.id);
    if (updated.valor_total > 0) {
      db.prepare(`
        INSERT INTO financeiro (tenant_id, os_id, tipo, categoria, descricao, valor, forma_pagamento, status, data_vencimento)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.tenantId, updated.id, 'receita', 'servico',
        `OS ${updated.numero_os} - ${updated.cliente_nome}`,
        updated.valor_total, updated.forma_pagamento || 'PIX',
        'pendente', new Date().toISOString().split('T')[0]);
    }
  }

  const updated = db.prepare('SELECT * FROM ordens_servico WHERE id = ?').get(req.params.id);
  res.json({ success: true, os: updated });
});

// Add item to OS
app.post('/api/os/:id/itens', isAuthenticated, isAdmin, (req, res) => {
  const { tipo, descricao, quantidade, valor_unitario, estoque_id } = req.body;
  if (!descricao) return res.status(400).json({ error: 'Descrição é obrigatória' });

  const qty = parseFloat(quantidade) || 1;
  const vUnit = parseFloat(valor_unitario) || 0;
  const vTotal = qty * vUnit;

  db.prepare(`
    INSERT INTO os_itens (os_id, tipo, descricao, quantidade, valor_unitario, valor_total, estoque_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, tipo || 'servico', descricao, qty, vUnit, vTotal, estoque_id || null);

  // Recalc OS totals
  const itens = db.prepare('SELECT SUM(valor_total) as total, tipo FROM os_itens WHERE os_id = ? GROUP BY tipo').all(req.params.id);
  const maoObra = itens.filter(i => i.tipo === 'servico').reduce((s, i) => s + i.total, 0);
  const pecas = itens.filter(i => i.tipo === 'peca').reduce((s, i) => s + i.total, 0);
  const os = db.prepare('SELECT * FROM ordens_servico WHERE id = ?').get(req.params.id);
  const total = maoObra + pecas - (os.desconto || 0);

  db.prepare('UPDATE ordens_servico SET valor_mao_obra = ?, valor_pecas = ?, valor_total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(maoObra, pecas, total, req.params.id);

  res.json({ success: true });
});

// Delete OS item
app.delete('/api/os/itens/:id', isAuthenticated, isAdmin, (req, res) => {
  const item = db.prepare('SELECT * FROM os_itens WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item não encontrado' });

  db.prepare('DELETE FROM os_itens WHERE id = ?').run(req.params.id);

  // Recalc totals
  const itens = db.prepare('SELECT SUM(valor_total) as total, tipo FROM os_itens WHERE os_id = ? GROUP BY tipo').all(item.os_id);
  const maoObra = itens.filter(i => i.tipo === 'servico').reduce((s, i) => s + i.total, 0);
  const pecas = itens.filter(i => i.tipo === 'peca').reduce((s, i) => s + i.total, 0);
  const os = db.prepare('SELECT * FROM ordens_servico WHERE id = ?').get(item.os_id);
  const total = maoObra + pecas - (os.desconto || 0);

  db.prepare('UPDATE ordens_servico SET valor_mao_obra = ?, valor_pecas = ?, valor_total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(maoObra, pecas, total, item.os_id);

  res.json({ success: true });
});

// Delete OS
app.delete('/api/os/:id', isAuthenticated, canDelete, (req, res) => {
  const os = db.prepare('SELECT * FROM ordens_servico WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!os) return res.status(404).json({ error: 'OS não encontrada' });

  db.prepare('DELETE FROM os_itens WHERE os_id = ?').run(os.id);
  db.prepare('DELETE FROM ordens_servico WHERE id = ?').run(os.id);
  res.json({ success: true });
});

// OS Dashboard Stats
app.get('/api/os/stats', isAuthenticated, isStaff, (req, res) => {
  const tid = req.tenantId;
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'aberta' THEN 1 ELSE 0 END) as abertas,
      SUM(CASE WHEN status = 'em_andamento' THEN 1 ELSE 0 END) as em_andamento,
      SUM(CASE WHEN status = 'finalizado' THEN 1 ELSE 0 END) as finalizadas,
      SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as canceladas,
      COALESCE(SUM(CASE WHEN status IN ('finalizado','em_andamento') THEN valor_total ELSE 0 END), 0) as valor_total_ativos
    FROM ordens_servico
    WHERE tenant_id = ?
  `).get(tid);

  const recentes = db.prepare('SELECT id, numero_os, cliente_nome, veiculo, status, data_entrada, valor_total FROM ordens_servico WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 5').all(tid);

  res.json({ ...stats, recentes });
});

// ─── Financeiro Routes ──────────────────────────────────────────

// List transactions
app.get('/api/financeiro', isAuthenticated, canViewFinanceiro, (req, res) => {
  const { tipo, status, start, end, categoria } = req.query;
  const tid = req.tenantId;
  let query = 'SELECT f.*, os.numero_os, os.cliente_nome as os_cliente FROM financeiro f LEFT JOIN ordens_servico os ON f.os_id = os.id WHERE f.tenant_id = ?';
  const params = [tid];

  if (tipo) { query += ' AND f.tipo = ?'; params.push(tipo); }
  if (status) { query += ' AND f.status = ?'; params.push(status); }
  if (categoria) { query += ' AND f.categoria = ?'; params.push(categoria); }
  if (start) { query += ' AND f.created_at >= ?'; params.push(start); }
  if (end) { query += ' AND f.created_at <= ?'; params.push(end); }

  query += ' ORDER BY f.created_at DESC LIMIT 200';
  res.json(db.prepare(query).all(...params));
});

// Create transaction
app.post('/api/financeiro', isAuthenticated, canViewFinanceiro, (req, res) => {
  const { tipo, categoria, descricao, valor, forma_pagamento, data_vencimento, data_pagamento, status, os_id } = req.body;
  if (!descricao || !valor) {
    return res.status(400).json({ error: 'Descrição e valor são obrigatórios' });
  }

  db.prepare(`
    INSERT INTO financeiro (tenant_id, os_id, tipo, categoria, descricao, valor, forma_pagamento, data_vencimento, data_pagamento, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.tenantId, os_id || null,
    tipo || 'receita', categoria || 'servico',
    descricao, parseFloat(valor),
    forma_pagamento || 'PIX',
    data_vencimento || null, data_pagamento || null,
    status || 'pendente'
  );

  res.json({ success: true });
});

// Update transaction
app.put('/api/financeiro/:id', isAuthenticated, canViewFinanceiro, (req, res) => {
  const { tipo, categoria, descricao, valor, forma_pagamento, status, data_vencimento, data_pagamento } = req.body;
  const fields = [];
  const params = [];

  if (tipo) { fields.push('tipo = ?'); params.push(tipo); }
  if (categoria) { fields.push('categoria = ?'); params.push(categoria); }
  if (descricao) { fields.push('descricao = ?'); params.push(descricao); }
  if (valor !== undefined) { fields.push('valor = ?'); params.push(parseFloat(valor)); }
  if (forma_pagamento) { fields.push('forma_pagamento = ?'); params.push(forma_pagamento); }
  if (status) { fields.push('status = ?'); params.push(status); }
  if (data_vencimento !== undefined) { fields.push('data_vencimento = ?'); params.push(data_vencimento); }
  if (data_pagamento !== undefined) { fields.push('data_pagamento = ?'); params.push(data_pagamento); }

  if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

  params.push(req.params.id, req.tenantId);
  db.prepare(`UPDATE financeiro SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`).run(...params);
  res.json({ success: true });
});

// Delete transaction
app.delete('/api/financeiro/:id', isAuthenticated, canDelete, (req, res) => {
  db.prepare('DELETE FROM financeiro WHERE id = ? AND tenant_id = ?').run(req.params.id, req.tenantId);
  res.json({ success: true });
});

// Financial Dashboard Summary
app.get('/api/financeiro/resumo', isAuthenticated, canViewFinanceiro, (req, res) => {
  const tid = req.tenantId;
  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  // Monthly summary
  const monthly = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pago' THEN valor ELSE 0 END), 0) as receitas_pagas,
      COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pendente' THEN valor ELSE 0 END), 0) as receitas_pendentes,
      COALESCE(SUM(CASE WHEN tipo = 'despesa' AND status = 'pago' THEN valor ELSE 0 END), 0) as despesas_pagas,
      COALESCE(SUM(CASE WHEN tipo = 'despesa' AND status = 'pendente' THEN valor ELSE 0 END), 0) as despesas_pendentes
    FROM financeiro
    WHERE tenant_id = ? AND created_at >= ?
  `).get(tid, monthStart);

  // Daily sales this month
  const daily = db.prepare(`
    SELECT DATE(created_at) as date, SUM(valor) as total
    FROM financeiro
    WHERE tenant_id = ? AND tipo = 'receita' AND status = 'pago' AND created_at >= ?
    GROUP BY DATE(created_at)
    ORDER BY date
  `).all(tid, monthStart);

  // Payment methods breakdown
  const formas = db.prepare(`
    SELECT forma_pagamento, COUNT(*) as count, SUM(valor) as total
    FROM financeiro
    WHERE tenant_id = ? AND tipo = 'receita' AND status = 'pago'
    GROUP BY forma_pagamento
    ORDER BY total DESC
  `).all(tid);

  // Category breakdown
  const categorias = db.prepare(`
    SELECT categoria, COUNT(*) as count, SUM(valor) as total
    FROM financeiro
    WHERE tenant_id = ? AND tipo = 'receita' AND status = 'pago'
    GROUP BY categoria
    ORDER BY total DESC
  `).all(tid);

  const saldo = monthly.receitas_pagas - monthly.despesas_pagas;

  res.json({ monthly, daily, formas, categorias, saldo });
});

// Monthly sales chart data (12 months)
app.get('/api/financeiro/vendas-mensais', isAuthenticated, canViewFinanceiro, (req, res) => {
  const tid = req.tenantId;
  const rows = db.prepare(`
    SELECT
      strftime('%Y-%m', created_at) as mes,
      COUNT(*) as total_transacoes,
      SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END) as total_pago,
      SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as total_pendente,
      SUM(valor) as total_bruto
    FROM financeiro
    WHERE tenant_id = ? AND tipo = 'receita'
      AND created_at >= DATE('now', '-12 months')
    GROUP BY strftime('%Y-%m', created_at)
    ORDER BY mes ASC
  `).all(tid);

  // Also get OS monthly completion stats
  const osRows = db.prepare(`
    SELECT
      strftime('%Y-%m', data_saida) as mes,
      COUNT(*) as total_os,
      SUM(COALESCE(valor_total, 0)) as total_faturado
    FROM ordens_servico
    WHERE tenant_id = ? AND status = 'finalizado' AND data_saida IS NOT NULL
      AND data_saida >= DATE('now', '-12 months')
    GROUP BY strftime('%Y-%m', data_saida)
    ORDER BY mes ASC
  `).all(tid);

  res.json({ financeiro: rows, os: osRows });
});

// ─── Tenant Settings Routes ──────────────────────────────────────

// Get current tenant info
app.get('/api/tenant', isAuthenticated, (req, res) => {
  const t = db.prepare('SELECT id, name, slug, subdomain, logo, whatsapp, address, settings, created_at FROM tenants WHERE id = ?').get(req.tenantId);
  res.json(t || {});
});

// Update tenant settings
app.put('/api/tenant', isAuthenticated, isAdmin, (req, res) => {
  const { name, logo, whatsapp, address, settings } = req.body;
  const fields = [];
  const params = [];

  if (name) { fields.push('name = ?'); params.push(name); }
  if (logo !== undefined) { fields.push('logo = ?'); params.push(logo); }
  if (whatsapp !== undefined) { fields.push('whatsapp = ?'); params.push(whatsapp); }
  if (address !== undefined) { fields.push('address = ?'); params.push(address); }
  if (settings !== undefined) { fields.push('settings = ?'); params.push(JSON.stringify(settings)); }

  if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

  params.push(req.tenantId);
  db.prepare(`UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  tenant.refreshCache();

  res.json({ success: true });
});

// List tenants (superadmin only)
app.get('/api/tenants', isAuthenticated, requireRole(ROLES.SUPERADMIN), (req, res) => {
  const tenants = db.prepare('SELECT id, name, slug, subdomain, ativo, created_at FROM tenants ORDER BY name').all();
  res.json(tenants);
});

// ─── User Management Routes ─────────────────────────────────────

// List users (superadmin sees all, admin sees users within their tenant)
app.get('/api/users', isAuthenticated, isAdmin, (req, res) => {
  const role = req.session.userRole;
  
  if (role === ROLES.SUPERADMIN) {
    // Superadmin sees all users with tenant info
    const users = db.prepare(`
      SELECT u.id, u.username, u.name, u.email, u.role, u.auth_provider, u.created_at, 
             COALESCE(t.name, '(sem tenant)') as tenant_name, u.tenant_id
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      ORDER BY u.created_at DESC
    `).all();
    return res.json(users);
  }
  
  // Admin sees users in their tenant
  const users = db.prepare(`
    SELECT id, username, name, email, role, auth_provider, created_at
    FROM users WHERE tenant_id = ?
    ORDER BY created_at DESC
  `).all(req.tenantId);
  res.json(users);
});

// Create user (superadmin can create any role, admin can create operador in their tenant)
app.post('/api/users', isAuthenticated, isAdmin, (req, res) => {
  const { username, password, name, email, role } = req.body;
  const callerRole = req.session.userRole;
  
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, senha e nome são obrigatórios' });
  }
  
  // Validate role assignment
  let newRole = role || ROLES.OPERADOR;
  if (callerRole === ROLES.ADMIN && newRole !== ROLES.OPERADOR) {
    return res.status(403).json({ error: 'Administradores só podem criar usuários com função Operador' });
  }
  
  const validRoles = Object.values(ROLES);
  if (!validRoles.includes(newRole)) {
    return res.status(400).json({ error: `Função inválida. Válidas: ${validRoles.join(', ')}` });
  }
  
  try {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(409).json({ error: 'Usuário já existe' });
    }
    
    const hashed = bcrypt.hashSync(password, 10);
    
    // Superadmin can be created without tenant
    if (newRole === ROLES.SUPERADMIN && callerRole !== ROLES.SUPERADMIN) {
      return res.status(403).json({ error: 'Apenas superadmins podem criar outros superadmins' });
    }
    
    const tenantId = newRole === ROLES.SUPERADMIN ? null : (req.tenantId || 1);
    
    db.prepare('INSERT INTO users (username, password, name, email, role, tenant_id) VALUES (?, ?, ?, ?, ?, ?)')
      .run(username, hashed, name, email || '', newRole, tenantId);
    
    res.json({ success: true, message: `Usuário "${username}" criado como ${ROLE_LABELS[newRole]}` });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Update user (change role, name, reset password)
app.put('/api/users/:id', isAuthenticated, isAdmin, (req, res) => {
  const { name, email, role, password } = req.body;
  const callerRole = req.session.userRole;
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  // Superadmin can edit anyone. Admin can only edit users in their tenant with role operador
  if (callerRole === ROLES.ADMIN) {
    if (user.tenant_id !== req.tenantId) {
      return res.status(403).json({ error: 'Você só pode editar usuários da sua oficina' });
    }
    if (role && role !== ROLES.OPERADOR) {
      return res.status(403).json({ error: 'Você só pode atribuir função Operador' });
    }
  }
  
  // Cannot change own role (prevent lockout)
  if (role && parseInt(req.params.id) === req.session.userId) {
    return res.status(400).json({ error: 'Você não pode alterar sua própria função' });
  }
  
  const fields = [];
  const params = [];
  
  if (name) { fields.push('name = ?'); params.push(name); }
  if (email !== undefined) { fields.push('email = ?'); params.push(email); }
  if (role) { fields.push('role = ?'); params.push(role); }
  if (password) {
    fields.push('password = ?');
    params.push(bcrypt.hashSync(password, 10));
  }
  
  if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });
  
  params.push(req.params.id);
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  
  res.json({ success: true, message: 'Usuário atualizado com sucesso' });
});

// Delete user
app.delete('/api/users/:id', isAuthenticated, requireRole(ROLES.SUPERADMIN, ROLES.ADMIN), (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  // Cannot delete self
  if (parseInt(req.params.id) === req.session.userId) {
    return res.status(400).json({ error: 'Você não pode excluir sua própria conta' });
  }
  
  // Admin can only delete operador users in their tenant
  if (req.session.userRole === ROLES.ADMIN) {
    if (user.tenant_id !== req.tenantId) {
      return res.status(403).json({ error: 'Você só pode excluir usuários da sua oficina' });
    }
    if (user.role !== ROLES.OPERADOR) {
      return res.status(403).json({ error: 'Você só pode excluir usuários com função Operador' });
    }
  }
  
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Usuário excluído' });
});

// ─── Enhanced Dashboard Stats (with OS + Financeiro) ────────────
app.get('/api/stats/completo', isAuthenticated, (req, res) => {
  const tid = req.tenantId;
  const role = req.session.userRole;
  const isOperador = role === ROLES.OPERADOR;

  // Lead stats (accessible to all)
  const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE tenant_id = ?').get(tid).count;
  const qualificados = db.prepare("SELECT COUNT(*) as count FROM leads WHERE tenant_id = ? AND status = 'lead_qualificado'").get(tid).count;

  // OS stats (accessible to all)
  const osStats = db.prepare("SELECT COUNT(*) as total, COALESCE(SUM(CASE WHEN status NOT IN ('cancelado','finalizado') THEN 1 ELSE 0 END),0) as abertas, COALESCE(SUM(valor_total),0) as faturamento FROM ordens_servico WHERE tenant_id = ?").get(tid);

  // Financeiro stats (only admin+ can see real data)
  let finStats = { recebido: 0, a_receber: 0, despesas: 0 };
  if (!isOperador) {
    finStats = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pago' THEN valor ELSE 0 END),0) as recebido,
        COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pendente' THEN valor ELSE 0 END),0) as a_receber,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' AND status = 'pago' THEN valor ELSE 0 END),0) as despesas
      FROM financeiro WHERE tenant_id = ?
    `).get(tid);
  }

  // Estoque (accessible to all)
  const totalEstoque = db.prepare('SELECT COUNT(*) as count FROM estoque WHERE tenant_id = ? AND ativo = 1').get(tid).count;
  const estoqueBaixo = db.prepare('SELECT COUNT(*) as count FROM estoque WHERE tenant_id = ? AND quantidade > 0 AND quantidade < 5').get(tid).count;

  res.json({
    leads: { total: totalLeads, qualificados },
    os: osStats,
    financeiro: finStats,
    estoque: { total: totalEstoque, baixo: estoqueBaixo }
  });
});

// ─── WhatsApp Routes ────────────────────────────────────────────
whatsapp.registerRoutes(app, db);

// ─── Google OAuth Routes ─────────────────────────────────────────
app.get('/auth/google',
  passportInstance.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

app.get('/auth/google/callback',
  passportInstance.authenticate('google', { failureRedirect: '/login?error=google_failed' }),
  (req, res) => {
    // Copia dados do Passport para a sessão express-session
    req.session.userId = req.user.id;
    req.session.userRole = req.user.role;
    req.session.username = req.user.username;
    req.session.name = req.user.name;
    res.redirect('/');
  }
);

// ─── Login Page — Site User ─────────────────────────────────────
app.get('/login', (req, res) => {
  // If already authenticated, show logged-in state
  if (req.session && req.session.userId) {
    return res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login — Garagem do MEEC</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #08080A;
      color: #F2F2F7;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 24px;
      background-image: radial-gradient(ellipse at 50% 0%, rgba(0,68,204,0.08) 0%, transparent 70%);
    }
    .card {
      background: #0F0F12;
      border: 1px solid #1C1C21;
      border-radius: 16px;
      padding: 48px;
      width: 100%; max-width: 400px;
      text-align: center;
    }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 14px 24px;
      border-radius: 10px; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; text-decoration: none;
      border: none;
    }
    .btn-primary { background: #0044CC; color: #fff; }
    .btn-primary:hover { background: #003399; }
    .btn-outline {
      background: transparent; color: #F2F2F7;
      border: 1px solid #2A2A31;
    }
    .btn-outline:hover { border-color: #FF453A; background: rgba(255,69,58,0.05); }
  </style>
</head>
<body>
  <div class="card">
    <div class="w-16 h-16 rounded-xl bg-[#0044CC] flex items-center justify-center mx-auto mb-4 font-sans font-black text-2xl">GM</div>
    <h1 class="font-sans font-black text-2xl mb-1">Bem-vindo de volta!</h1>      <p class="text-sm text-[#636366] mb-6">Você está logado como <strong class="text-[#F2F2F7]">${req.session.name}</strong></p>
    <div class="space-y-3">
      <a href="/" class="btn btn-primary">Ir para o Site</a>
      <a href="/admin" class="btn btn-outline">Painel Admin</a>
      <form action="/api/logout" method="POST" onsubmit="return confirm('Sair da conta?')">
        <button type="submit" class="btn btn-outline mt-2" style="color:#FF453A;border-color:#FF453A20;">Sair da Conta</button>
      </form>
    </div>
  </div>
</body>
</html>
    `);
  }

  const errorParam = req.query.error;
  const successParam = req.query.success;

  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login — Garagem do MEEC</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #08080A;
      color: #F2F2F7;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 24px;
      background-image: 
        radial-gradient(ellipse at 50% 0%, rgba(0,68,204,0.1) 0%, transparent 70%),
        linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
      background-size: 100% 100%, 48px 48px, 48px 48px;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(0,68,204,0.2); }
      50% { box-shadow: 0 0 40px rgba(0,68,204,0.4); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .login-container {
      width: 100%; max-width: 420px;
      animation: slideUp 0.6s ease-out;
    }
    .login-card {
      background: #0F0F12;
      border: 1px solid #1C1C21;
      border-radius: 20px;
      padding: 48px 40px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .login-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #0044CC, #F5C800, transparent);
      background-size: 200% center;
      animation: shimmer 3s linear infinite;
    }
    .login-card:hover {
      border-color: #2A2A31;
      box-shadow: 0 8px 40px rgba(0,0,0,0.3);
    }
    .logo-wrapper {
      animation: float 3s ease-in-out infinite;
      margin-bottom: 24px;
    }
    .logo-box {
      width: 72px; height: 72px;
      border-radius: 18px;
      background: linear-gradient(135deg, #0044CC, #003399);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto;
      font-family: 'Inter', sans-serif;
      font-weight: 900; font-size: 28px;
      color: #fff;
      position: relative;
      animation: glow 3s ease-in-out infinite;
    }
    .logo-box::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 22px;
      background: linear-gradient(135deg, #0044CC, #F5C800);
      z-index: -1;
      opacity: 0.3;
      animation: glow 3s ease-in-out infinite;
    }
    .scan-line {
      position: absolute;
      top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, #0044CC, transparent);
      animation: scan 4s linear infinite;
      opacity: 0.3;
    }
    @keyframes scan {
      0% { transform: translateY(0); }
      100% { transform: translateY(100vh); }
    }
    .divider {
      display: flex; align-items: center;
      gap: 16px; margin: 24px 0;
      color: #636366; font-size: 12px;
    }
    .divider::before, .divider::after {
      content: ''; flex: 1;
      height: 1px; background: #1C1C21;
    }
    input {
      width: 100%;
      background: #08080A;
      border: 1px solid #1C1C21;
      border-radius: 10px;
      padding: 14px 16px;
      color: #F2F2F7;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }
    input:focus { border-color: #0044CC; box-shadow: 0 0 0 3px rgba(0,68,204,0.1); }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; padding: 14px 24px;
      border-radius: 10px; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      text-decoration: none; border: none;
    }
    .btn-primary { background: #0044CC; color: #fff; }
    .btn-primary:hover { background: #003399; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,68,204,0.25); }
    .btn-google {
      background: #fff; color: #1C1C1E;
      border: 1px solid #E5E5EA;
      font-weight: 500;
    }
    .btn-google:hover { background: #F2F2F7; transform: translateY(-1px); }
    .btn-google svg { width: 20px; height: 20px; }
    .btn-secondary {
      background: transparent; color: #8E8E93;
      border: 1px solid #2A2A31;
    }
    .btn-secondary:hover { border-color: #F2F2F7; color: #F2F2F7; }
    .error-msg {
      background: rgba(255,69,58,0.1);
      border: 1px solid rgba(255,69,58,0.2);
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 13px;
      color: #FF453A;
      text-align: center;
      margin-bottom: 16px;
      display: none;
    }
    .success-msg {
      background: rgba(48,209,88,0.1);
      border: 1px solid rgba(48,209,88,0.2);
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 13px;
      color: #30D158;
      text-align: center;
      margin-bottom: 16px;
      display: none;
    }
    .feature-list {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #1C1C21;
    }
    .feature-item {
      display: flex; align-items: center; gap: 10px;
      font-size: 12px; color: #636366;
      padding: 6px 0;
    }
    .feature-item svg { width: 16px; height: 16px; flex-shrink: 0; }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="login-card">
      <div class="scan-line"></div>
      
      <div class="text-center">
        <div class="logo-wrapper">
          <div class="logo-box">GM</div>
        </div>
        <h1 class="font-sans font-black text-2xl tracking-tight">
          GARAGEM <span class="text-[#0044CC]">DO MEEC</span>
        </h1>
        <p class="text-sm text-[#636366] mt-2 font-mono">Faça login para continuar</p>
      </div>

      ${successParam === 'google' ? '<div class="success-msg" style="display:block">✅ Login com Google realizado com sucesso!</div>' : ''}
      <div id="error-msg" class="error-msg">${errorParam === 'google_failed' ? 'Falha na autenticação com Google. Tente novamente.' : ''}</div>
      <div id="form-error" class="error-msg"></div>

      <!-- Google Login Button -->
      <a href="/auth/google" class="btn btn-google mb-4">
        <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Entrar com Google
      </a>

      <div class="divider">ou entre com email</div>

      <!-- Email/Password Form -->
      <form id="login-form" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-[#8E8E93] mb-1.5">Email ou Usuário</label>
          <input type="text" id="username" required placeholder="seu@email.com" autocomplete="username">
        </div>
        <div>
          <label class="block text-xs font-medium text-[#8E8E93] mb-1.5">Senha</label>
          <input type="password" id="password" required placeholder="••••••••" autocomplete="current-password">
        </div>
        <button type="submit" class="btn btn-primary" id="login-btn">
          Entrar
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </button>
      </form>

      <div class="feature-list">
        <div class="feature-item">
          <svg fill="none" stroke="#30D158" viewBox="0 0 24 24" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Acompanhe seus atendimentos</span>
        </div>
        <div class="feature-item">
          <svg fill="none" stroke="#30D158" viewBox="0 0 24 24" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Consulte orçamentos em tempo real</span>
        </div>
        <div class="feature-item">
          <svg fill="none" stroke="#30D158" viewBox="0 0 24 24" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Descontos exclusivos no MEEC OFERTAS</span>
        </div>
      </div>

      <div class="text-center mt-6">
        <a href="/" class="text-xs text-[#636366] hover:text-[#8E8E93] transition-colors">
          ← Voltar para o site
        </a>
      </div>
    </div>
  </div>

  <script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      const formError = document.getElementById('form-error');
      btn.disabled = true;
      btn.innerHTML = 'Entrando... <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>';
      formError.style.display = 'none';

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
          })
        });
        const data = await res.json();
        if (data.success) {
          window.location.href = '/login';
        } else {
          formError.textContent = data.error || 'Usuário ou senha inválidos';
          formError.style.display = 'block';
          btn.disabled = false;
          btn.innerHTML = 'Entrar <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>';
        }
      } catch (err) {
        formError.textContent = 'Erro de conexão. Tente novamente.';
        formError.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = 'Entrar <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>';
      }
    });
  </script>
</body>
</html>
  `);
});

// ─── Admin Pages ─────────────────────────────────────────────────
app.get('/admin', (req, res) => {
  if (!req.session.userId) return res.redirect('/admin/login');
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin/login', (req, res) => {
  if (req.session.userId) return res.redirect('/admin');
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin — Garagem do MEEC</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #08080A;
      color: #F2F2F7;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 24px;
    }
    .login-card {
      background: #0F0F12;
      border: 1px solid #1C1C21;
      border-radius: 16px;
      padding: 40px;
      width: 100%; max-width: 400px;
    }
    input {
      width: 100%;
      background: #08080A;
      border: 1px solid #1C1C21;
      border-radius: 10px;
      padding: 14px 16px;
      color: #F2F2F7;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #0044CC; }
    .btn {
      width: 100%;
      background: #0044CC;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 14px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn:hover { background: #003399; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #FF453A; font-size: 13px; text-align: center; }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="text-center mb-8">
      <div class="w-14 h-14 rounded-xl bg-[#0044CC] flex items-center justify-center mx-auto mb-4 font-sans font-black text-xl">M</div>
      <h1 class="font-sans font-black text-2xl">GARAGEM <span class="text-[#0044CC]">DO MEEC</span></h1>
      <p class="text-sm text-[#636366] mt-2 font-mono">Painel de Administração</p>
    </div>
    <form id="login-form" class="space-y-4">
      <div>
        <label class="block text-xs font-medium text-[#8E8E93] mb-1.5">Usuário</label>
        <input type="text" id="username" required placeholder="admin" autocomplete="username">
      </div>
      <div>
        <label class="block text-xs font-medium text-[#8E8E93] mb-1.5">Senha</label>
        <input type="password" id="password" required placeholder="••••••••" autocomplete="current-password">
      </div>
      <div id="login-error" class="error hidden"></div>
      <button type="submit" class="btn" id="login-btn">Entrar</button>
    </form>
  </div>
  <script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      const errorEl = document.getElementById('login-error');
      btn.disabled = true;
      btn.textContent = 'Entrando...';
      errorEl.classList.add('hidden');

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
          })
        });
        const data = await res.json();
        if (data.success) {
          window.location.href = '/admin';
        } else {
          errorEl.textContent = data.error || 'Erro ao fazer login';
          errorEl.classList.remove('hidden');
          btn.disabled = false;
          btn.textContent = 'Entrar';
        }
      } catch (err) {
        errorEl.textContent = 'Erro de conexão';
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }
    });
  </script>
</body>
</html>
  `);
});

// ─── Start Server ────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Garagem do MEEC - Servidor rodando`);
  console.log(`   🌐 Site:  http://localhost:${PORT}`);
  console.log(`   🔐 Admin: http://localhost:${PORT}/admin`);
  console.log(`   🔑 Login:  http://localhost:${PORT}/login`);
  console.log(`   📦 Modo: ${NODE_ENV}`);
  if (isProduction) {
    console.log(`   💡 Lembre-se de configurar o Volume Persistente no Railway montado em: ${path.dirname(DB_PATH)}`);
  }
  
  // Sync existing leads to Supabase on startup
  if (supabase.isConfigured()) {
    supabase.ensureTables().then(() => {
      supabase.syncAllLeads(db);
    });
  }
  
  // Initialize WhatsApp Web service (deferred para não bloquear)
  setTimeout(() => {
    try {
      whatsapp.init();
    } catch (e) {
      console.warn('⚠️ WhatsApp init error (non-blocking):', e.message);
    }
  }, 2000);
});

// ─── Graceful Shutdown ───────────────────────────────────────────
function gracefulShutdown(signal) {
  console.log(`\n🛑 Recebido ${signal} — encerrando servidor gracefully...`);
  // Gracefully close WhatsApp connection
  const waClient = whatsapp.getClient();
  if (waClient) {
    try { waClient.destroy(); } catch (e) { /* ignore */ }
  }
  
  server.close(() => {
    console.log('✅ Servidor parou de aceitar conexões');
    db.close();
    console.log('✅ Banco de dados fechado com segurança');
    process.exit(0);
  });
  // Força encerramento após 10s se não fechar
  setTimeout(() => {
    console.error('⚠️  Timeout - forçando encerramento');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
