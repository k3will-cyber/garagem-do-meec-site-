/**
 * Controller for Estoque (Inventory) HTTP endpoints
 * Handles request/response, validation, and delegates to service layer
 */

class EstoqueController {
  /**
   * @param {EstoqueService} estoqueService - Service instance
   */
  constructor(estoqueService) {
    this.estoqueService = estoqueService;
  }

  /**
   * GET /api/estoque
   * Get active products for tenant (public endpoint)
   */
  async getActiveProducts(req, res) {
    try {
      const produtos = await this.estoqueService.getActiveProducts(req.tenantId);
      res.json(produtos);
    } catch (error) {
      console.error('Error in getActiveProducts:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * GET /api/estoque/all
   * Get all products for tenant (authenticated)
   */
  async getAllProducts(req, res) {
    try {
      const produtos = await this.estoqueService.getAllProducts(req.tenantId);
      res.json(produtos);
    } catch (error) {
      console.error('Error in getAllProducts:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * POST /api/estoque
   * Create new product
   */
  async createProduct(req, res) {
    try {
      const result = await this.estoqueService.createProduct(req.body, req.tenantId);
      res.json({ success: true, id: result.id });
    } catch (error) {
      // Validation errors from service
      if (error.message.includes('obrigatório') ||
          error.message.includes('negativo')) {
        return res.status(400).json({ error: error.message });
      }

      console.error('Error in createProduct:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * PUT /api/estoque/:id
   * Update existing product
   */
  async updateProduct(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      await this.estoqueService.updateProduct(id, req.body, req.tenantId);
      res.json({ success: true });
    } catch (error) {
      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({ error: error.message });
      }

      // Validation errors from service
      if (error.message.includes('obrigatório') ||
          error.message.includes('negativo')) {
        return res.status(400).json({ error: error.message });
      }

      console.error('Error in updateProduct:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * DELETE /api/estoque/:id
   * Delete product
   */
  async deleteProduct(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      await this.estoqueService.deleteProduct(id, req.tenantId);
      res.json({ success: true });
    } catch (error) {
      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({ error: error.message });
      }

      console.error('Error in deleteProduct:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = EstoqueController;