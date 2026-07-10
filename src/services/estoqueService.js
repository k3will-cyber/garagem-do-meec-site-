/**
 * Service for Estoque (Inventory) business logic
 * Handles validation, business rules, and coordinates repository operations
 */

class EstoqueService {
  /**
   * @param {EstoqueRepository} estoqueRepository - Repository instance
   */
  constructor(estoqueRepository) {
    this.estoqueRepository = estoqueRepository;
  }

  /**
   * Get active products for a tenant
   * @param {number} tenantId - Tenant ID
   * @returns {Array} List of active products
   */
  async getActiveProducts(tenantId) {
    // Business rule: only return active products for public endpoints
    return await this.estoqueRepository.findActiveByTenant(tenantId);
  }

  /**
   * Get all products for a tenant (requires authentication)
   * @param {number} tenantId - Tenant ID
   * @returns {Array} List of all products
   */
  async getAllProducts(tenantId) {
    // Business rule: authenticated users can see all products
    return await this.estoqueRepository.findAllByTenant(tenantId);
  }

  /**
   * Create a new product with validation
   * @param {Object} productData - Product data
   * @param {number} tenantId - Tenant ID
   * @returns {Object} Created product ID
   * @throws {Error} If validation fails
   */
  async createProduct(productData, tenantId) {
    // Business validation
    if (!productData.nome || productData.nome.trim() === '') {
      throw new Error('Nome é obrigatório');
    }

    if (!productData.preco && productData.preco !== 0) {
      throw new Error('Preço é obrigatório');
    }

    if (parseFloat(productData.preco) < 0) {
      throw new Error('Preço não pode ser negativo');
    }

    if (parseInt(productData.quantidade) < 0) {
      throw new Error('Quantidade não pode ser negativa');
    }

    // Apply business rules for defaults
    const produto = {
      nome: productData.nome.trim(),
      descricao: productData.descricao ? productData.descricao.trim() : '',
      preco: parseFloat(productData.preco),
      imagem: productData.imagem || null,
      categoria: productData.categoria ? productData.categoria.trim() : 'geral',
      quantidade: parseInt(productData.quantidade) || 0
    };

    // Persist to database
    const result = await this.estoqueRepository.create(produto, tenantId);
    return { id: result.lastInsertRowid };
  }

  /**
   * Update an existing product with validation
   * @param {number} id - Product ID
   * @param {Object} productData - Product data to update
   * @param {number} tenantId - Tenant ID
   * @returns {boolean} True if updated
   * @throws {Error} If validation fails or product not found
   */
  async updateProduct(id, productData, tenantId) {
    // Check if product exists and belongs to tenant
    const existing = await this.estoqueRepository.findById(id, tenantId);
    if (!existing) {
      throw new Error('Produto não encontrado');
    }

    // Business validation (same as create)
    if (productData.nome !== undefined && (productData.nome === null || productData.nome.trim() === '')) {
      throw new Error('Nome é obrigatório');
    }

    if (productData.preco !== undefined && productData.preco !== null) {
      if (parseFloat(productData.preco) < 0) {
        throw new Error('Preço não pode ser negativo');
      }
    }

    if (productData.quantidade !== undefined && productData.quantidade !== null) {
      if (parseInt(productData.quantidade) < 0) {
        throw new Error('Quantidade não pode ser negativa');
      }
    }

    // Apply business rules for defaults
    const produto = {
      nome: productData.nome !== undefined ? productData.nome.trim() : existing.nome,
      descricao: productData.descricao !== undefined ? productData.descricao.trim() : existing.descricao,
      preco: productData.preco !== undefined ? parseFloat(productData.preco) : existing.preco,
      imagem: productData.imagem !== undefined ? productData.imagem : existing.imagem,
      categoria: productData.categoria !== undefined ? productData.categoria.trim() : existing.categoria,
      quantidade: productData.quantidade !== undefined ? parseInt(productData.quantidade) : existing.quantidade,
      ativo: productData.ativo !== undefined ? productData.ativo : existing.ativo
    };

    // Persist to database
    await this.estoqueRepository.update(id, produto, tenantId);
    return true;
  }

  /**
   * Delete a product
   * @param {number} id - Product ID
   * @param {number} tenantId - Tenant ID
   * @returns {boolean} True if deleted
   * @throws {Error} If product not found
   */
  async deleteProduct(id, tenantId) {
    // Check if product exists and belongs to tenant
    const existing = await this.estoqueRepository.findById(id, tenantId);
    if (!existing) {
      throw new Error('Produto não encontrado');
    }

    // Persist deletion
    await this.estoqueRepository.delete(id, tenantId);
    return true;
  }

  /**
   * Get product by ID (internal use)
   * @param {number} id - Product ID
   * @param {number} tenantId - Tenant ID
   * @returns {Object|null} Product data or null if not found
   */
  async getProductById(id, tenantId) {
    return await this.estoqueRepository.findById(id, tenantId);
  }
}

module.exports = EstoqueService;