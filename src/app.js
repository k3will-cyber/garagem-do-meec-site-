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

  // Static files
  app.use(express.static(path.join(__dirname, '..')));

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
