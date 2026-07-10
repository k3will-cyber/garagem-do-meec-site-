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
  // Wait for tenant cache to load before accepting requests
  if (tenant && typeof tenant.init === 'function') {
    await tenant.init();
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`🔧 Painel admin: http://localhost:${PORT}/admin`);
    console.log(`📦 Banco: ${db.type === 'postgres' ? 'PostgreSQL' : 'SQLite'}`);
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
