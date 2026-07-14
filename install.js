/**
 * Install script for Railway deployment.
 * Runs after default npm install to ensure all dependencies are installed.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(__dirname, 'node_modules');
const pgPath = path.join(nodeModulesPath, 'pg');

if (!fs.existsSync(pgPath)) {
  console.log('[install] pg not found, running npm install...');
  try {
    execSync('npm install --production', { stdio: 'inherit', cwd: __dirname });
    console.log('[install] npm install completed');
  } catch (err) {
    console.error('[install] npm install failed:', err.message);
    // Try just pg
    try {
      execSync('npm install pg', { stdio: 'inherit', cwd: __dirname });
      console.log('[install] pg installed successfully');
    } catch (err2) {
      console.error('[install] pg install also failed:', err2.message);
    }
  }
} else {
  console.log('[install] pg already installed, skipping');
}