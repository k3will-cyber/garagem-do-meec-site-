// Simple verification script to check if modules can be imported
try {
  const estoqueRepository = require('./src/repositories/estoqueRepository');
  console.log('✅ estoqueRepository imported successfully');
} catch (error) {
  console.error('❌ Failed to import estoqueRepository:', error.message);
}

try {
  const estoqueService = require('./src/services/estoqueService');
  console.log('✅ estoqueService imported successfully');
} catch (error) {
  console.error('❌ Failed to import estoqueService:', error.message);
}

try {
  const estoqueController = require('./src/controllers/estoqueController');
  console.log('✅ estoqueController imported successfully');
} catch (error) {
  console.error('❌ Failed to import estoqueController:', error.message);
}

try {
  const app = require('./src/app');
  console.log('✅ app module imported successfully');
} catch (error) {
  console.error('❌ Failed to import app module:', error.message);
}

try {
  const server = require('./server');
  console.log('✅ server imported successfully');
} catch (error) {
  console.error('❌ Failed to import server:', error.message);
}

console.log('Verification complete');