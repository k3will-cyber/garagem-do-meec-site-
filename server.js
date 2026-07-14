const { createApp } = require('./src/app');
const { createDatabase } = require('./src/database');

// ─── Database Setup ──────────────────────────────────────────────
const db = createDatabase();

// ─── Create App ──────────────────────────────────────────────────
const app = createApp(db);

// ─── Start Server (after tenant cache is ready) ──────────────────
const PORT = process.env.PORT || 3000;
const tenant = app.get('tenant');

async function start() {
  // Start HTTP server first (healthcheck needs port open)
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`🔧 Painel admin: http://localhost:${PORT}/admin`);
    console.log(`📦 Banco: ${db.type === 'postgres' ? 'PostgreSQL' : 'SQLite'}`);

    // Initialize schema first, then tenant cache (chain to avoid race condition)
    const initTasks = [];

    if (typeof db.initSchema === 'function') {
      initTasks.push(db.initSchema());
    }

    // Ensure schema is ready before loading tenants
    Promise.all(initTasks)
      .then(() => {
        if (tenant && typeof tenant.init === 'function') {
          return tenant.init();
        }
      })
      .then(() => {
        console.log('[Startup] Database and tenant cache ready');
      })
      .catch(err => console.error('[Startup] Init error:', err.message));
  });

  // ─── Graceful Shutdown ───────────────────────────────────────────
  process.on('SIGINT', async () => {
    console.log('\n🛑 Recebido sinal de encerramento...');
    server.close(async () => {
      if (typeof db.close === 'function') {
        await db.close();
      }
      console.log('✅ Servidor encerrado');
      process.exit(0);
    });
  });
}

start().catch(err => {
  console.error('❌ Erro ao iniciar servidor:', err.message);
  process.exit(1);
});

// ─── Uncaught error handlers ─────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
});

module.exports = app; // For testing purposes
