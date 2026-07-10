/**
 * Controller for OS HTTP endpoints
 * Handles request/response, validation, and delegates to service layer
 */

class OsController {
  /**
   * @param {OsService} osService - Service instance
   */
  constructor(osService) {
    this.osService = osService;
  }

  /**
   * GET /api/os
   * Get OS with filtering and pagination
   */
  async getOs(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const { status, search, limit, offset } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (search) filters.search = search;

      const result = await this.osService.getAll(
        filters,
        tenantId,
        limit ? parseInt(limit) : null,
        offset ? parseInt(offset) : null
      );

      res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          limit: limit ? parseInt(limit) : result.total,
          offset: offset ? parseInt(offset) : 0
        }
      });
    } catch (error) {
      console.error('Get OS error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/os/:id
   * Get OS by ID
   */
  async getOsById(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const osId = parseInt(req.params.id);

      if (isNaN(osId)) {
        return res.status(400).json({ error: 'Invalid OS ID' });
      }

      const os = await this.osService.getById(osId, tenantId);

      if (!os) {
        return res.status(404).json({ error: 'OS not found' });
      }

      res.json({
        success: true,
        data: os
      });
    } catch (error) {
      if (error.message === 'OS não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Get OS by ID error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/os
   * Create a new OS
   */
  async createOs(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const osData = req.body;

      // Basic validation
      if (!osData.cliente_nome || osData.cliente_nome.trim() === '') {
        return res.status(400).json({ error: 'Nome do cliente é obrigatório' });
      }

      if (!osData.veiculo || osData.veiculo.trim() === '') {
        return res.status(400).json({ error: 'Veículo é obrigatório' });
      }

      const os = await this.osService.create(osData, tenantId);

      res.status(201).json({
        success: true,
        message: 'OS criada com sucesso',
        data: os
      });
    } catch (error) {
      if (error.message.includes('obrigatório') || error.message.includes('vazio')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Create OS error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /api/os/:id
   * Update an existing OS
   */
  async updateOs(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const osId = parseInt(req.params.id);
      const osData = req.body;

      if (isNaN(osId)) {
        return res.status(400).json({ error: 'Invalid OS ID' });
      }

      const os = await this.osService.update(osId, osData, tenantId);

      res.json({
        success: true,
        message: 'OS atualizada com sucesso',
        data: os
      });
    } catch (error) {
      if (error.message === 'OS não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('obrigatório') || error.message.includes('vazio') || error.message.includes('não pode ser vazio')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Update OS error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/os/:id
   * Delete an OS
   */
  async deleteOs(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const osId = parseInt(req.params.id);

      if (isNaN(osId)) {
        return res.status(400).json({ error: 'Invalid OS ID' });
      }

      const deleted = await this.osService.delete(osId, tenantId);

      if (!deleted) {
        return res.status(404).json({ error: 'OS not found' });
      }

      res.json({
        success: true,
        message: 'OS deleted successfully'
      });
    } catch (error) {
      console.error('Delete OS error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/os/:id/itens
   * Get OS items by OS ID
   */
  async getOsItems(req, res) {
    try {
      const osId = parseInt(req.params.id);

      if (isNaN(osId)) {
        return res.status(400).json({ error: 'Invalid OS ID' });
      }

      const items = await this.osService.getOsItems(osId);

      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      console.error('Get OS items error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/os/:id/itens
   * Create a new OS item
   */
  async createOsItem(req, res) {
    try {
      const osId = parseInt(req.params.id);
      const itemData = req.body;

      if (isNaN(osId)) {
        return res.status(400).json({ error: 'Invalid OS ID' });
      }

      // Basic validation
      if (!itemData.descricao || itemData.descricao.trim() === '') {
        return res.status(400).json({ error: 'Descrição do item é obrigatório' });
      }

      if (!itemData.quantidade || itemData.quantidade <= 0) {
        return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
      }

      if (!itemData.valor_unitario || itemData.valor_unitario < 0) {
        return res.status(400).json({ error: 'Valor unitário deve ser maior ou igual a zero' });
      }

      const item = await this.osService.createOsItem(itemData, osId);

      res.status(201).json({
        success: true,
        message: 'Item da OS criado com sucesso',
        data: item
      });
    } catch (error) {
      if (error.message.includes('obrigatório') || error.message.includes('vazio') || error.message.includes('não pode ser vazio')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Create OS item error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /api/os/:id/itens/:itemId
   * Update an existing OS item
   */
  async updateOsItem(req, res) {
    try {
      const osId = parseInt(req.params.osId);
      const itemId = parseInt(req.params.itemId);
      const itemData = req.body;

      if (isNaN(osId) || isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      const item = await this.osService.updateOsItem(itemId, itemData);

      if (!item) {
        return res.status(404).json({ error: 'OS item not found' });
      }

      res.json({
        success: true,
        message: 'OS item atualizado com sucesso',
        data: item
      });
    } catch (error) {
      if (error.message === 'Item não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('obrigatório') || error.message.includes('vazio') || error.message.includes('não pode ser vazio')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Update OS item error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/os/:id/itens/:itemId
   * Delete an OS item
   */
  async deleteOsItem(req, res) {
    try {
      const osId = parseInt(req.params.osId);
      const itemId = parseInt(req.params.itemId);

      if (isNaN(osId) || isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      const deleted = await this.osService.deleteOsItem(itemId);

      if (!deleted) {
        return res.status(404).json({ error: 'OS item not found' });
      }

      res.json({
        success: true,
        message: 'OS item deleted successfully'
      });
    } catch (error) {
      console.error('Delete OS item error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/os/stats
   * Get OS statistics
   */
  async getOsStats(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const isSuperadmin = req.user?.role === 'superadmin'; // Assuming req.user is set by auth middleware

      const stats = await this.osService.getOsStats(tenantId, isSuperadmin);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get OS stats error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = OsController;