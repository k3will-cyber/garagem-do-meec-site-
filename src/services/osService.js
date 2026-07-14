/**
 * Service for OS business logic
 * Handles validation, business rules, and coordinates repository operations
 */

class OsService {
  /**
   * @param {OsRepository} osRepository - Repository instance
   */
  constructor(osRepository) {
    this.osRepository = osRepository;
  }

  /**
   * Get OS by ID
   * @param {number} id - OS ID
   * @param {number} tenantId - Tenant ID (for authorization)
   * @returns {Object|null} OS data with items or null if not found or unauthorized
   */
  async getById(id, tenantId) {
    const os = await this.osRepository.findById(id);
    if (!os) return null;

    // Check if the OS belongs to the tenant (unless it's a superadmin scenario)
    // In a real implementation, we'd also check user role here
    if (os.tenant_id !== tenantId) {
      return null; // Not authorized
    }

    // Fetch and attach OS items
    const items = await this.osRepository.findOsItemsByOsId(id);
    return {
      ...os,
      itens: items
    };
  }

  /**
   * Get OS with optional filtering and pagination
   * @param {Object} filters - Filter options (status, search)
   * @param {number} tenantId - Tenant ID
   * @param {number} limit - Limit (optional)
   * @param {number} offset - Offset (optional)
   * @returns {Object} Paginated results
   */
  async getAll(filters = {}, tenantId = 1, limit = null, offset = null) {
    // Get all matching records
    const osList = await this.osRepository.findAll(filters, tenantId, false); // Assuming caller handles auth

    // Apply pagination manually (since our findAll doesn't support limit/offset directly)
    // In a real implementation, we'd modify the repository to support limit/offset
    const start = offset || 0;
    const end = limit === null ? osList.length : start + limit;
    const paginatedOs = osList.slice(start, end);

    return {
      data: paginatedOs,
      total: osList.length
    };
  }

  /**
   * Create a new OS
   * @param {Object} osData - OS data
   * @param {number} tenantId - Tenant ID
   * @returns {Object} Created OS data
   */
  async create(osData, tenantId) {
    // Validation
    if (!osData.cliente_nome || osData.cliente_nome.trim() === '') {
      throw new Error('Nome do cliente é obrigatório');
    }

    if (!osData.veiculo || osData.veiculo.trim() === '') {
      throw new Error('Veículo é obrigatório');
    }

    // Set default values
    osData.numero_os = osData.numero_os || this.generateOsNumber();
    osData.status = osData.status || 'aberta';
    osData.prioridade = osData.prioridade || 'normal';
    osData.valor_mao_obra = osData.valor_mao_obra || 0;
    osData.valor_pecas = osData.valor_pecas || 0;
    osData.desconto = osData.desconto || 0;

    // Create OS
    const result = await this.osRepository.create({
      ...osData,
      tenant_id: tenantId
    });

    const createdOs = await this.osRepository.findById(result.lastInsertRowid);
    // Fetch and attach items (will be empty for new OS)
    const items = await this.osRepository.findOsItemsByOsId(createdOs.id);
    return {
      ...createdOs,
      itens: items
    };
  }

  /**
   * Update an existing OS
   * @param {number} id - OS ID
   * @param {Object} osData - OS data to update
   * @param {number} tenantId - Tenant ID
   * @returns {Object} Updated OS data
   */
  async update(id, osData, tenantId) {
    // Verify OS exists and belongs to tenant
    const existingOs = await this.osRepository.findById(id);
    if (!existingOs) {
      throw new Error('OS não encontrada');
    }

    // In a real app, we'd check tenant ownership here
    // For now, we'll assume the controller handles auth

    // Update OS
    await this.osRepository.update(id, {
      ...osData,
      updated_at: new Date().toISOString()
    });

    const updatedOs = await this.osRepository.findById(id);
    // Fetch and attach items
    const items = await this.osRepository.findOsItemsByOsId(id);
    return {
      ...updatedOs,
      itens: items
    };
  }

  /**
   * Delete an OS
   * @param {number} id - OS ID
   * @returns {boolean} True if deleted
   */
  async delete(id) {
    const result = await this.osRepository.delete(id);
    return result.changes > 0;
  }

  /**
   * Get OS items by OS ID
   * @param {number} osId - OS ID
   * @returns {Array} List of OS items
   */
  async getOsItems(osId) {
    return await this.osRepository.findOsItemsByOsId(osId);
  }

  /**
   * Create a new OS item
   * @param {Object} itemData - OS item data
   * @param {number} osId - OS ID
   * @returns {Object} Created OS item data
   */
  async createOsItem(itemData, osId) {
    // Validation
    if (!itemData.descricao || itemData.descricao.trim() === '') {
      throw new Error('Descrição do item é obrigatória');
    }

    if (!itemData.quantidade || itemData.quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    if (!itemData.valor_unitario || itemData.valor_unitario < 0) {
      throw new Error('Valor unitário deve ser maior ou igual a zero');
    }

    // Calculate total if not provided
    const valor_total = itemData.valor_total || (itemData.quantidade * itemData.valor_unitario);

    // Create OS item
    const result = await this.osRepository.createOsItem({
      ...itemData,
      os_id: osId,
      valor_total: valor_total
    });

    const createdItem = await this.osRepository.findOsItemById(result.lastInsertRowid);
    return createdItem;
  }

  /**
   * Update an existing OS item
   * @param {number} id - OS item ID
   * @param {Object} itemData - OS item data to update
   * @returns {Object} Updated OS item data
   */
  async updateOsItem(id, itemData) {
    // Verify item exists
    const existingItem = await this.osRepository.findOsItemById(id);
    if (!existingItem) {
      throw new Error('Item não encontrado');
    }

    // Update OS item
    await this.osRepository.updateOsItem(id, {
      ...itemData,
      updated_at: new Date().toISOString()
    });

    const updatedItem = await this.osRepository.findOsItemById(id);
    return updatedItem;
  }

  /**
   * Delete an OS item
   * @param {number} id - OS item ID
   * @returns {boolean} True if deleted
   */
  async deleteOsItem(id) {
    const result = await this.osRepository.deleteOsItem(id);
    return result.changes > 0;
  }

  /**
   * Get OS statistics
   * @param {number} tenantId - Tenant ID (for non-superadmin)
   * @param {boolean} isSuperadmin - Whether caller is superadmin
   * @returns {Object} OS statistics
   */
  async getOsStats(tenantId = 1, isSuperadmin = false) {
    return await this.osRepository.getOsStats(tenantId, isSuperadmin);
  }

  /**
   * Generate a unique OS number
   * @returns {string} Generated OS number
   */
  generateOsNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().substring(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `OS${year}${month}${day}-${random}`;
  }
}

module.exports = OsService;