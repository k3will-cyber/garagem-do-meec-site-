const { createDatabase } = require('./src/database');
const EstoqueRepository = require('./src/repositories/estoqueRepository');
const path = require('path');

// Override DB_PATH for testing
process.env.DB_PATH = ':memory:'; // Signals SQLite adapter to use in-memory database

async function runTests() {
  console.log('Testing EstoqueRepository...');

  // Create in-memory SQLite database via adapter
  const db = createDatabase();

  // Create tables
  await db.exec(`
    CREATE TABLE estoque (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      imagem TEXT,
      categoria TEXT DEFAULT 'geral',
      quantidade INTEGER DEFAULT 0,
      ativo INTEGER DEFAULT 1,
      tenant_id INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Initialize repository
  const estoqueRepository = new EstoqueRepository(db);

  // Test 1: Create product
  console.log('\n1. Testing product creation...');
  const productData = {
    nome: 'Produto Teste',
    descricao: 'Descrição do produto teste',
    preco: 29.90,
    imagem: 'test.jpg',
    categoria: 'teste',
    quantidade: 10
  };

  const result = await estoqueRepository.create(productData, 1);
  console.log('Created product with ID:', result.lastInsertRowid);

  // Test 2: Get product by ID
  console.log('\n2. Testing get product by ID...');
  const product = await estoqueRepository.findById(result.lastInsertRowid, 1);
  console.log('Found product:', product);

  // Test 3: Get active products
  console.log('\n3. Testing get active products...');
  const activeProducts = await estoqueRepository.findActiveByTenant(1);
  console.log('Active products count:', activeProducts.length);

  // Test 4: Get all products
  console.log('\n4. Testing get all products...');
  const allProducts = await estoqueRepository.findAllByTenant(1);
  console.log('All products count:', allProducts.length);

  // Test 5: Update product
  console.log('\n5. Testing product update...');
  const updateData = {
    nome: 'Produto Atualizado',
    preco: 39.90,
    quantidade: 15
  };

  const updateResult = await estoqueRepository.update(result.lastInsertRowid, updateData, 1);
  console.log('Update result:', updateResult);

  // Verify update
  const updatedProduct = await estoqueRepository.findById(result.lastInsertRowid, 1);
  console.log('Updated product:', updatedProduct);

  // Test 6: Delete product
  console.log('\n6. Testing product deletion...');
  const deleteResult = await estoqueRepository.delete(result.lastInsertRowid, 1);
  console.log('Delete result:', deleteResult);

  // Verify deletion
  const deletedProduct = await estoqueRepository.findById(result.lastInsertRowid, 1);
  console.log('Product after deletion:', deletedProduct);

  await db.close();
  console.log('\n✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);
