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

    // Initialize database schema for PostgreSQL (non-blocking)
    if (db.type === 'postgres' && typeof db.initSchema === 'function') {
      db.initSchema().catch(err => console.error('[DB] Schema init error:', err.message));
    }

    // Initialize tenant cache in background (non-blocking)
    if (tenant && typeof tenant.init === 'function') {
      tenant.init().catch(err => console.error('[Tenant] Init error:', err.message));
    }
  });

  // ─── Graceful Shutdown ───────────────────────────────────────────
  process.on('SIGINT', async () => {
    console.log('\n🛑 Recebido sinal de encerramento...');
    server.close(async () => {
      await db.close();
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
