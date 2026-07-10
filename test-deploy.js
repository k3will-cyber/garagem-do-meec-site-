/**
 * Temporary test deploy — minimal server that only responds to healthcheck
 * Replace server.js with this to test if Railway deployment infrastructure works
 */
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Garagem do MEEC - Diagnostic Mode' });
});

app.listen(PORT, () => {
  console.log(`[Test] Server running on port ${PORT}`);
});
