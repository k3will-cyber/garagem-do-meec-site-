/**
 * Main Express application setup
 * Configures middleware, routes, and error handling
 */

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const { createTenantMiddleware } = require('../lib/tenant');
const { setupPassport } = require('../lib/passport');

// Load controllers
const estoqueController = require('./controllers/estoqueController');
const authController = require('./controllers/authController');
const leadsController = require('./controllers/leadsController');
const osController = require('./controllers/osController');

// Initialize Express app factory function
function createApp(db) {
  const app = express();

  // ─── Environment Variables ───────────────────────────────────────
  const PORT = process.env.PORT || 3000;
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const SESSION_SECRET = process.env.SESSION_SECRET || 'garagem-do-meec-dev-secret';
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  const ADMIN_NAME = process.env.ADMIN_NAME || 'Pablo Jhonatan';
  const REGISTER_SECRET = process.env.REGISTER_SECRET || 'meec-admin-2026';
  const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
  const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED !== 'false';
  const WHATSAPP_OWNER_NUMBER = process.env.WHATSAPP_OWNER_NUMBER || '5561981257477';
  const isProduction = NODE_ENV === 'production';

  // ─── Middleware Setup ────────────────────────────────────────────
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : ['http://localhost:5000', 'http://localhost:5173', 'http://localhost:3000', 'https://garagem-do-meec.netlify.app', 'https://garagemdomeec.com.br', 'https://www.garagemdomeec.com.br'];

  app.use(cors({
    origin: corsOrigin,
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Trust proxy for Railway (needed for secure cookies behind proxy)
  if (isProduction) {
    app.set('trust proxy', 1);
  }

  // Session configuration
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24h
    }
  }));

  // Static files - serve da pasta public/ para evitar expor backend no CDN
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // ─── Health Check (BEFORE tenant middleware — must respond instantly) ─
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      environment: NODE_ENV,
      database: db.type,
      uptime: process.uptime()
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/api/config', (req, res) => {
    res.json({
      crmUrl: process.env.CRM_URL || 'http://localhost:5000'
    });
  });

  // ─── Multi-tenant Middleware ─────────────────────────────────────
  const tenant = createTenantMiddleware(db);
  app.use(tenant.middleware);

  // Store tenant for server.js to await before listening
  app.set('tenant', tenant);

  // ─── Passport Initialization ─────────────────────────────────────
  app.use(passport.initialize());
  app.use(passport.session());
  const passportInstance = setupPassport(db);

  // ─── Dependency Injection ───────────────────────────────────────
  // Initialize repositories
  const EstoqueRepository = require('./repositories/estoqueRepository');
  const AuthRepository = require('./repositories/authRepository');
  const LeadsRepository = require('./repositories/leadsRepository');
  const OsRepository = require('./repositories/osRepository');
  const estoqueRepository = new EstoqueRepository(db);
  const authRepository = new AuthRepository(db);
  const leadsRepository = new LeadsRepository(db);
  const osRepository = new OsRepository(db);

  // Initialize services
  const EstoqueService = require('./services/estoqueService');
  const AuthService = require('./services/authService');
  const LeadsService = require('./services/leadsService');
  const OsService = require('./services/osService');
  const estoqueService = new EstoqueService(estoqueRepository);
  const authService = new AuthService(authRepository, db);
  const leadsService = new LeadsService(leadsRepository, db);
  const osService = new OsService(osRepository);

  // Initialize controllers
  const estoqueControllerInstance = new estoqueController(estoqueService);
  const authControllerInstance = new authController(authService);
  const leadsControllerInstance = new leadsController(leadsService);
  const osControllerInstance = new osController(osService);

  // ─── Auth Routes ─────────────────────────────────────────────────
  app.post('/api/login', (req, res) => authControllerInstance.login(req, res));
  app.post('/api/register', (req, res) => authControllerInstance.register(req, res));
  app.post('/api/logout', (req, res) => authControllerInstance.logout(req, res));
  app.get('/api/me', (req, res) => authControllerInstance.getProfile(req, res));
  app.put('/api/users/:id', (req, res) => authControllerInstance.updateUser(req, res));
  app.delete('/api/users/:id', (req, res) => authControllerInstance.deleteUser(req, res));
  app.get('/api/users', (req, res) => authControllerInstance.listUsers(req, res));

  // Google OAuth routes
  app.get('/api/auth/google', (req, res) => passportInstance.authenticate('google', { scope: ['profile', 'email'] }));
  app.get(
    '/api/auth/google/callback',
    passportInstance.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
      const token = jwt.sign(
        {
          userId: req.user.id,
          username: req.user.username,
          role: req.user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    }
  );

  // ─── Estoque routes ──────────────────────────────────────────────
  app.get('/api/estoque', (req, res) => estoqueControllerInstance.getActiveProducts(req, res));
  app.get('/api/estoque/all', (req, res) => estoqueControllerInstance.getAllProducts(req, res));
  app.post('/api/estoque', (req, res) => estoqueControllerInstance.createProduct(req, res));
  app.put('/api/estoque/:id', (req, res) => estoqueControllerInstance.updateProduct(req, res));
  app.delete('/api/estoque/:id', (req, res) => estoqueControllerInstance.deleteProduct(req, res));

  // ─── Leads routes ────────────────────────────────────────────────
  app.get('/api/leads', (req, res) => leadsControllerInstance.getLeads(req, res));
  app.get('/api/leads/:id', (req, res) => leadsControllerInstance.getLeadById(req, res));
  app.post('/api/leads', (req, res) => leadsControllerInstance.createLead(req, res));
  app.put('/api/leads/:id', (req, res) => leadsControllerInstance.updateLead(req, res));
  app.delete('/api/leads/:id', (req, res) => leadsControllerInstance.deleteLead(req, res));
  app.get('/api/leads/pipeline/summary', (req, res) => leadsControllerInstance.getPipelineSummary(req, res));
  app.get('/api/leads/:id/timeline', (req, res) => leadsControllerInstance.getLeadTimeline(req, res));

  // ─── OS routes ───────────────────────────────────────────────────
  app.get('/api/os', (req, res) => osControllerInstance.getOs(req, res));
  app.get('/api/os/:id', (req, res) => osControllerInstance.getOsById(req, res));
  app.post('/api/os', (req, res) => osControllerInstance.createOs(req, res));
  app.put('/api/os/:id', (req, res) => osControllerInstance.updateOs(req, res));
  app.delete('/api/os/:id', (req, res) => osControllerInstance.deleteOs(req, res));
  app.get('/api/os/:id/itens', (req, res) => osControllerInstance.getOsItems(req, res));
  app.post('/api/os/:id/itens', (req, res) => osControllerInstance.createOsItem(req, res));
  app.put('/api/os/:id/itens/:itemId', (req, res) => osControllerInstance.updateOsItem(req, res));
  app.delete('/api/os/:id/itens/:itemId', (req, res) => osControllerInstance.deleteOsItem(req, res));
  app.get('/api/os/stats', (req, res) => osControllerInstance.getOsStats(req, res));

  // ─── Public API Routes (no auth required) ───────────────────────
  app.get('/api/public/meec-stock', async (req, res) => {
    try {
      const tenantId = req.tenant?.id || 1;
      const products = await estoqueService.getActiveProducts(tenantId);
      res.json(products);
    } catch (error) {
      console.error('Get public stock error:', error.message);
      res.status(500).json({ error: 'Failed to fetch stock' });
    }
  });

  app.get('/api/public/meec-stock/meta/categorias', async (req, res) => {
    try {
      const tenantId = req.tenant?.id || 1;
      const products = await estoqueService.getActiveProducts(tenantId);
      const categorias = [...new Set(products.map(p => p.categoria).filter(Boolean))];
      res.json(categorias);
    } catch (error) {
      console.error('Get categories error:', error.message);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.get('/api/public/meec-stock/meta/summary', async (req, res) => {
    try {
      const tenantId = req.tenant?.id || 1;
      const products = await estoqueService.getActiveProducts(tenantId);
      const total = products.length;
      const porCategoria = products.reduce((acc, p) => {
        const cat = p.categoria || 'geral';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      res.json({ total, porCategoria });
    } catch (error) {
      console.error('Get stock summary error:', error.message);
      res.status(500).json({ error: 'Failed to fetch stock summary' });
    }
  });

  app.post('/api/public/leads', async (req, res) => {
    try {
      const tenantId = req.tenant?.id || 1;
      const leadData = {
        name: req.body.name,
        whatsapp: req.body.whatsapp,
        email: req.body.email || '',
        message: req.body.message || '',
        origem: req.body.origem || 'site',
        veiculo: req.body.veiculo || '',
        servico_interesse: req.body.servico_interesse || ''
      };
      const createdLead = await leadsService.create(leadData, tenantId);
      res.status(201).json({ success: true, data: createdLead });
    } catch (error) {
      console.error('Create public lead error:', error.message);
      res.status(400).json({ error: error.message || 'Failed to create lead' });
    }
  });

  // ─── Admin routes ────────────────────────────────────────────────
  app.get('/api/admin/recent-logins', async (req, res) => {
    try {
      const tenantId = req.tenant?.id || 1;
      const filters = {};
      const users = await authRepository.findAll(filters, tenantId, false);

      const usersWithLogin = users.filter(user => user.last_login_at);
      const sortedUsers = usersWithLogin.sort(
        (a, b) => new Date(b.last_login_at) - new Date(a.last_login_at)
      );

      const safeUsers = sortedUsers.map(user => {
        const { password: _, ...safeUser } = user;
        return safeUser;
      });

      res.json({
        success: true,
        data: safeUsers.slice(0, 50)
      });
    } catch (error) {
      console.error('Get recent logins error:', error.message);
      res.status(500).json({ error: 'Failed to fetch recent logins' });
    }
  });

  app.get('/api/admin/recent-leads', async (req, res) => {
    try {
      const tenantId = req.tenant?.id || 1;
      const filters = {};
      const leads = await leadsRepository.findAll(filters, tenantId, null, null);

      const sortedLeads = leads.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 50);

      res.json({
        success: true,
        data: sortedLeads
      });
    } catch (error) {
      console.error('Get recent leads error:', error.message);
      res.status(500).json({ error: 'Failed to fetch recent leads' });
    }
  });

  // ─── Seed CRM Route ─────────────────────────────────────────────
  // Popula a tabela crm_leads do CRM (crm-garagem) via API interna.
  // Usa variável de ambiente CRM_DB_URL (formato: postgresql://user:pass@host:port/db)
  app.post('/api/admin/seed-crm', async (req, res) => {
    if (process.env.NODE_ENV !== 'production') {
      return res.status(403).json({ error: 'Disponível apenas em produção' });
    }
    const dbUrl = process.env.CRM_DB_URL;
    if (!dbUrl) {
      return res.status(500).json({ error: 'CRM_DB_URL não configurada' });
    }
    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: dbUrl });
      await client.connect();

      // Verificar se crm_leads existe
      const tableCheck = await client.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_name = 'crm_leads' AND table_schema = 'public'
      `);
      if (tableCheck.rows.length === 0) {
        await client.end();
        return res.status(500).json({ error: 'Tabela crm_leads não encontrada no banco CRM' });
      }

      // Leads a inserir (nome, telefone, email, source, veiculos_estimados, notas)
      const leads = [
        ["ANTONIO CARLOS", "61993669417", "", "crm_import", 1, "CPF: 64579271149"],
        ["Adriano Almeida", "61998260946", "adrianoalmeida9275@gmail.com", "crm_import", 2, "CPF: 05399391104"],
        ["Alisson", "61992086408", "", "crm_import", 1, "CPF: 08328094118"],
        ["Andreia dutra", "61993495230", "aadultra50@gmail.com", "crm_import", 1, "CPF: 61114561134"],
        ["Antonio lucas dutra", "61994121847", "", "crm_import", 1, "CPF: 05113249106"],
        ["Auricia Maria de Sa", "61982388378", "", "crm_import", 1, "CPF: 73912115320"],
        ["BALTASAR", "61999015366", "", "crm_import", 1, "CPF: 19109954600"],
        ["BRUNO GELEIA", "61992709367", "", "crm_import", 0, "CPF: 06389949189"],
        ["Benisson Nascimento", "61981826263", "", "crm_import", 1, "CPF: 03563374139"],
        ["Bruno Ronny", "61985773309", "", "crm_import", 1, "CPF: 02892333130"],
        ["CHEILA SILVA", "61995054658", "", "crm_import", 1, "CPF: 02903220140"],
        ["CLAUDIOMAR DELFINO", "61984772242", "", "crm_import", 2, "CPF: 94759871187"],
        ["Cleidson Cláudio", "61991410060", "", "crm_import", 1, "CPF: 02360734199"],
        ["Cleverson Favaro", "61981202282", "", "crm_import", 1, "CPF: 05393683189"],
        ["DEIVID ALVES", "61992462979", "", "crm_import", 1, "CPF: 09068991175"],
        ["DOUGLAS SANTOS", "61993618574", "", "crm_import", 1, "CPF: 70246059109"],
        ["Dayane Lins Rezende", "61982267844", "", "crm_import", 1, "CPF: 05480842110"],
        ["Deborah cristina santos bernades", "61991431092", "", "crm_import", 1, "CPF: 71547453125"],
        ["Deivid gomes", "61995993827", "", "crm_import", 2, "CPF: 04199461108"],
        ["Diego amorin", "61995993039", "migueldiego1301@gmail.com", "crm_import", 2, "CPF: 05119739180"],
        ["Douglas Antonio", "61991042190", "ddoglasferreira@gmail.com", "crm_import", 1, "CPF: 61753300134"],
        ["EDIMILSON JOSE", "61993801837", "", "crm_import", 1, "CPF: 57326711100"],
        ["EVANILSON", "61995715564", "", "crm_import", 0, "CPF: 96008075315"],
        ["Edilson luiz", "61992542339", "", "crm_import", 1, "CPF: 95355030149"],
        ["Eduardo medeiros", "61982013979", "medeiroseduardo2002@gmail.com", "crm_import", 1, "CPF: 05970360120"],
        ["FRANCISCO LOPES", "61992278105", "", "crm_import", 1, "CPF: 49339451104"],
        ["GABRIEL TRINDADE", "61992682777", "", "crm_import", 1, "CPF: 05544176183"],
        ["GILBERTE AVILA", "61991553799", "", "crm_import", 1, "CPF: 05374986139"],
        ["GILBERTO BARBOSA", "61992568569", "", "crm_import", 1, "CPF: 11448350468"],
        ["GUILHERME CARVALHO", "61993191885", "", "crm_import", 1, "CPF: 07554646133"],
        ["Gladson do nascimento Carvalho", "61992064787", "", "crm_import", 1, "CPF: 03534584147"],
        ["Henrique Carvalho", "61991610354", "", "crm_import", 1, "CPF: 02101553104"],
        ["IVAN ROYAL MULTMARCA", "61993325258", "", "crm_import", 2, "CPF: 03466168163"],
        ["JAIRO ROMULO", "61998645687", "", "crm_import", 1, "CPF: 01764065140"],
        ["JIVANILDO DE LIMA GUERRA", "61981371365", "", "crm_import", 1, "CPF: 01153852152"],
        ["JOSE ADRIANO DE SOUSA", "61991396165", "", "crm_import", 1, "CPF: 78352878115"],
        ["JOSE AIRTON", "61992044156", "", "crm_import", 1, "CPF: 06967964305"],
        ["JUAN", "61994514346", "", "crm_import", 1, "CPF: 06589106126"],
        ["Jane Cleia Alves Da Silva", "61993482622", "", "crm_import", 1, "CPF: 0273273123"],
        ["Keli Mota", "61986521710", "", "crm_import", 1, "CPF: 00254693121"],
        ["LEONIDAS DE OLIVEIRA", "61981398609", "", "crm_import", 1, "CPF: 37164155100"],
        ["LUCAS MUNIZ", "61992834344", "", "crm_import", 1, "CPF: 71074001184"],
        ["Larissa Sousa", "61991694615", "", "crm_import", 1, "CPF: 03255015138"],
        ["Laysa Perreira", "61995664242", "", "crm_import", 1, "CPF: 06921458180"],
        ["Leandro Batista", "61981459373", "", "crm_import", 1, "CPF: 09720902400"],
        ["Letícia Silva", "61991285673", "", "crm_import", 1, "CPF: 08784810106"],
        ["Lorrany Adrielly", "61981862290", "lorranyadriell@gmail.com", "crm_import", 1, "CPF: 09733072184"],
        ["Lucas Gomes de Souza", "61983724130", "maura35@gmail.com", "crm_import", 1, "CPF: 11896786405"],
        ["Luiz Elligton", "61995697482", "", "crm_import", 1, "CPF: 33963207191"],
        ["Luiz Fernando", "61981757105", "", "crm_import", 1, "CPF: 05558460164"],
        ["Luiz Otavio", "61996810715", "", "crm_import", 1, "CPF: 10364704152"],
        ["MARIA KAROLINE GONÇALVES VERAS", "61992504801", "", "crm_import", 1, "CPF: 06493771170"],
        ["Marcelo Alves", "61991421815", "Marceloalves.gama@yahoo.com.br", "crm_import", 1, "CPF: 80274900149"],
        ["Marcus vinicius", "61981087505", "", "crm_import", 1, "CPF: 03290828174"],
        ["Maria aparecida", "61984766260", "", "crm_import", 1, "CPF: 34342222191"],
        ["Mateus Januario", "61993879770", "", "crm_import", 0, "CPF: 06367184171"],
        ["Mateus Ribeiro", "61992268448", "", "crm_import", 1, "CPF: 06687411128"],
        ["Paulo Henrique", "61982418684", "", "crm_import", 1, "CPF: 05411925150"],
        ["Paulo Henrique sousa", "61991718042", "", "crm_import", 1, "CPF: 00825850169"],
        ["Paulo cruzes", "61994290449", "", "crm_import", 1, "CPF: 00340285109"],
        ["Pedro amorim", "61993025781", "", "crm_import", 1, "CPF: 04319840186"],
        ["Pedro lucas", "61992790991", "", "crm_import", 1, "CPF: 06293389140"],
        ["Raimundo Nonato", "61995805098", "", "crm_import", 1, "CPF: 91396360387"],
        ["Robson renato", "61994120980", "", "crm_import", 1, "CPF: 01151570265"],
        ["SERGIO VALENTIM", "61995273087", "", "crm_import", 1, "CPF: 00811851117"],
        ["SUELMA MATOS", "61993031369", "", "crm_import", 1, "CPF: 04427800106"],
        ["SUIAMY", "61996568181", "", "crm_import", 1, "CPF: 07198489117"],
        ["Sarah khetley pereira monteiro da silva", "61995833537", "Sarakhetlen1234@gmail.com", "crm_import", 1, "CPF: 70617889171"],
      ];

      let ok = 0, skipped = 0;
      for (const [name, phone, email, source, veiculos, notas] of leads) {
        const result = await client.query(`
          INSERT INTO crm_leads (name, phone, email, source, status, "estimatedValue", notes, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, 'new', $5, $6, NOW(), NOW())
          ON CONFLICT DO NOTHING
          RETURNING id
        `, [name, phone, email || null, source, veiculos * 500, notas]);
        if (result.rowCount > 0) ok++;
        else skipped++;
      }

      const { rows: [{ count }] } = await client.query('SELECT COUNT(*) FROM crm_leads');
      await client.end();
      console.log(`[Seed CRM] {ok} inseridos, {skipped} duplicados, total: {count}`);
      res.json({ success: true, inseridos: ok, duplicados: skipped, total: parseInt(count) });
    } catch (err) {
      console.error('[Seed CRM] Erro:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // ─── 404 Handler ─────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      error: 'Endpoint não encontrado',
      path: req.originalUrl
    });
  });

  // ─── Error Handler ───────────────────────────────────────────────
  app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  return app;
}

module.exports = { createApp };
