/**
 * Repository for Estoque (Inventory) data access operations
 * Handles all SQL interactions with the estoque table
 */

class EstoqueRepository {
  /**
   * @param {Object} db - Database adapter instance
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Get active products for a tenant
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Array>} List of active products
   */
  async findActiveByTenant(tenantId) {
    return this.db.all(
      'SELECT * FROM estoque WHERE ativo = 1 AND tenant_id = ? ORDER BY nome',
      [tenantId]
    );
  }

  /**
   * Get all products for a tenant (including inactive)
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Array>} List of all products
   */
  async findAllByTenant(tenantId) {
    return this.db.all(
      'SELECT * FROM estoque WHERE tenant_id = ? ORDER BY nome',
      [tenantId]
    );
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Object>} Result with lastInsertRowid
   */
  async create(productData, tenantId) {
    return this.db.run(
      'INSERT INTO estoque (nome, descricao, preco, imagem, categoria, quantidade, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        productData.nome,
        productData.descricao || '',
        parseFloat(productData.preco),
        productData.imagem || '',
        productData.categoria || 'geral',
        parseInt(productData.quantidade) || 0,
        tenantId
      ]
    );
  }

  /**
   * Update an existing product
   * @param {number} id - Product ID
   * @param {Object} productData - Product data to update
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Object>} Result of update operation
   */
  async update(id, productData, tenantId) {
    return this.db.run(
      'UPDATE estoque SET nome=?, descricao=?, preco=?, imagem=?, categoria=?, quantidade=?, ativo=? WHERE id=? AND tenant_id=?',
      [
        productData.nome,
        productData.descricao,
        parseFloat(productData.preco),
        productData.imagem,
        productData.categoria,
        parseInt(productData.quantidade),
        productData.ativo ?? 1,
        id,
        tenantId
      ]
    );
  }

  /**
   * Delete a product
   * @param {number} id - Product ID
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Object>} Result of delete operation
   */
  async delete(id, tenantId) {
    return this.db.run(
      'DELETE FROM estoque WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );
  }

  /**
   * Get product by ID and tenant
   * @param {number} id - Product ID
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Object|null>} Product data or null if not found
   */
  async findById(id, tenantId) {
    return this.db.get(
      'SELECT * FROM estoque WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );
  }
}

module.exports = EstoqueRepository;
