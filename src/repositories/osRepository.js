/**
 * Repository for OS data access operations
 * Handles all SQL interactions with the os and os_itens tables
 */

class OsRepository {
  /**
   * @param {Object} db - Database adapter instance
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Find OS by ID
   * @param {number} id - OS ID
   * @returns {Promise<Object|null>} OS data or null if not found
   */
  async findById(id) {
    return this.db.get('SELECT * FROM os WHERE id = ?', [id]);
  }

  /**
   * Find OS with optional filtering (for admin listing)
   * @param {Object} filters - Filter options (status, search)
   * @param {number} tenantId - Tenant ID (for non-superadmin)
   * @param {boolean} isSuperadmin - Whether caller is superadmin
   * @returns {Promise<Array>} List of OS
   */
  async findAll(filters = {}, tenantId = 1, isSuperadmin = false) {
    let query = `
      SELECT o.id, o.numero_os, o.cliente_nome, o.cliente_whatsapp, o.veiculo, o.placa, o.km,
             o.data_prevista, o.status, o.prioridade, o.servico_desc, o.observacoes,
             o.valor_mao_obra, o.valor_pecas, o.desconto, o.forma_pagamento,
             o.tenant_id, o.created_at, o.updated_at,
             COALESCE(t.name, '(sem tenant)') as tenant_name
      FROM os o
      LEFT JOIN tenants t ON o.tenant_id = t.id
    `;
    const params = [];
    const conditions = [];

    if (!isSuperadmin && tenantId !== undefined) {
      conditions.push('o.tenant_id = ?');
      params.push(tenantId);
    }

    if (filters.status) {
      conditions.push('o.status = ?');
      params.push(filters.status);
    }

    if (filters.search) {
      conditions.push('(o.numero_os LIKE ? OR o.cliente_nome LIKE ? OR o.veiculo LIKE ? OR o.placa LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY o.created_at DESC';

    return this.db.all(query, params);
  }

  /**
   * Create a new OS
   * @param {Object} osData - OS data
   * @returns {Promise<Object>} Result with lastInsertRowid
   */
  async create(osData) {
    return this.db.run(
      `INSERT INTO os (numero_os, cliente_nome, cliente_whatsapp, veiculo, placa, km, data_prevista, status, prioridade, servico_desc, observacoes, valor_mao_obra, valor_pecas, desconto, forma_pagamento, tenant_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        osData.numero_os,
        osData.cliente_nome,
        osData.cliente_whatsapp || null,
        osData.veiculo,
        osData.placa || null,
        osData.km || null,
        osData.data_prevista || null,
        osData.status || 'aberta',
        osData.prioridade || 'normal',
        osData.servico_desc || '',
        osData.observacoes || '',
        osData.valor_mao_obra || 0,
        osData.valor_pecas || 0,
        osData.desconto || 0,
        osData.forma_pagamento || null,
        osData.tenant_id || 1
      ]
    );
  }

  /**
   * Update an existing OS
   * @param {number} id - OS ID
   * @param {Object} osData - OS data to update
   * @returns {Promise<Object>} Result of update operation
   */
  async update(id, osData) {
    const fields = [];
    const params = [];

    if (osData.numero_os !== undefined) {
      fields.push('numero_os = ?');
      params.push(osData.numero_os);
    }
    if (osData.cliente_nome !== undefined) {
      fields.push('cliente_nome = ?');
      params.push(osData.cliente_nome);
    }
    if (osData.cliente_whatsapp !== undefined) {
      fields.push('cliente_whatsapp = ?');
      params.push(osData.cliente_whatsapp);
    }
    if (osData.veiculo !== undefined) {
      fields.push('veiculo = ?');
      params.push(osData.veiculo);
    }
    if (osData.placa !== undefined) {
      fields.push('placa = ?');
      params.push(osData.placa);
    }
    if (osData.km !== undefined) {
      fields.push('km = ?');
      params.push(osData.km);
    }
    if (osData.data_prevista !== undefined) {
      fields.push('data_prevista = ?');
      params.push(osData.data_prevista);
    }
    if (osData.status !== undefined) {
      fields.push('status = ?');
      params.push(osData.status);
    }
    if (osData.prioridade !== undefined) {
      fields.push('prioridade = ?');
      params.push(osData.prioridade);
    }
    if (osData.servico_desc !== undefined) {
      fields.push('servico_desc = ?');
      params.push(osData.servico_desc);
    }
    if (osData.observacoes !== undefined) {
      fields.push('observacoes = ?');
      params.push(osData.observacoes);
    }
    if (osData.valor_mao_obra !== undefined) {
      fields.push('valor_mao_obra = ?');
      params.push(osData.valor_mao_obra);
    }
    if (osData.valor_pecas !== undefined) {
      fields.push('valor_pecas = ?');
      params.push(osData.valor_pecas);
    }
    if (osData.desconto !== undefined) {
      fields.push('desconto = ?');
      params.push(osData.desconto);
    }
    if (osData.forma_pagamento !== undefined) {
      fields.push('forma_pagamento = ?');
      params.push(osData.forma_pagamento);
    }
    if (osData.tenant_id !== undefined) {
      fields.push('tenant_id = ?');
      params.push(osData.tenant_id);
    }

    // Always update timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');

    if (fields.length === 0) {
      return { changes: 0 };
    }

    params.push(id);

    return this.db.run(
      `UPDATE os SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  }

  /**
   * Delete an OS
   * @param {number} id - OS ID
   * @returns {Promise<Object>} Result of delete operation
   */
  async delete(id) {
    // First delete OS items
    await this.db.run('DELETE FROM os_itens WHERE os_id = ?', [id]);
    // Then delete OS
    return this.db.run('DELETE FROM os WHERE id = ?', [id]);
  }

  /**
   * Find OS items by OS ID
   * @param {number} osId - OS ID
   * @returns {Promise<Array>} List of OS items
   */
  async findOsItemsByOsId(osId) {
    return this.db.all('SELECT * FROM os_itens WHERE os_id = ?', [osId]);
  }

  /**
   * Find OS item by ID
   * @param {number} id - OS item ID
   * @returns {Promise<Object|null>} OS item data or null if not found
   */
  async findOsItemById(id) {
    return this.db.get('SELECT * FROM os_itens WHERE id = ?', [id]);
  }

  /**
   * Create a new OS item
   * @param {Object} itemData - OS item data
   * @returns {Promise<Object>} Result with lastInsertRowid
   */
  async createOsItem(itemData) {
    return this.db.run(
      'INSERT INTO os_itens (os_id, tipo, descricao, quantidade, valor_unitario, valor_total, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [
        itemData.os_id,
        itemData.tipo,
        itemData.descricao,
        itemData.quantidade,
        itemData.valor_unitario,
        itemData.valor_total || (itemData.quantidade * itemData.valor_unitario)
      ]
    );
  }

  /**
   * Update an existing OS item
   * @param {number} id - OS item ID
   * @param {Object} itemData - OS item data to update
   * @returns {Promise<Object>} Result of update operation
   */
  async updateOsItem(id, itemData) {
    const fields = [];
    const params = [];

    if (itemData.tipo !== undefined) {
      fields.push('tipo = ?');
      params.push(itemData.tipo);
    }
    if (itemData.descricao !== undefined) {
      fields.push('descricao = ?');
      params.push(itemData.descricao);
    }
    if (itemData.quantidade !== undefined) {
      fields.push('quantidade = ?');
      params.push(itemData.quantidade);
    }
    if (itemData.valor_unitario !== undefined) {
      fields.push('valor_unitario = ?');
      params.push(itemData.valor_unitario);
    }
    if (itemData.valor_total !== undefined) {
      fields.push('valor_total = ?');
      params.push(itemData.valor_total);
    }

    // Always update timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');

    if (fields.length === 0) {
      return { changes: 0 };
    }

    params.push(id);

    return this.db.run(
      `UPDATE os_itens SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  }

  /**
   * Delete an OS item
   * @param {number} id - OS item ID
   * @returns {Promise<Object>} Result of delete operation
   */
  async deleteOsItem(id) {
    return this.db.run('DELETE FROM os_itens WHERE id = ?', [id]);
  }

  /**
   * Get OS statistics
   * @param {number} tenantId - Tenant ID (for non-superadmin)
   * @param {boolean} isSuperadmin - Whether caller is superadmin
   * @returns {Promise<Object>} OS statistics
   */
  async getOsStats(tenantId = 1, isSuperadmin = false) {
    let query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'aberta' THEN 1 ELSE 0 END) as abertas,
        SUM(CASE WHEN status = 'em_andamento' THEN 1 ELSE 0 END) as em_andamento,
        SUM(CASE WHEN status = 'finalizado' THEN 1 ELSE 0 END) as finalizadas,
        SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as cancelados
      FROM os o
    `;
    const params = [];
    const conditions = [];

    if (!isSuperadmin && tenantId !== undefined) {
      conditions.push('o.tenant_id = ?');
      params.push(tenantId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await this.db.get(query, params);
    return {
      total: result ? (result.total || 0) : 0,
      abertas: result ? (result.abertas || 0) : 0,
      em_andamento: result ? (result.em_andamento || 0) : 0,
      finalizadas: result ? (result.finalizadas || 0) : 0,
      cancelados: result ? (result.cancelados || 0) : 0
    };
  }
}

module.exports = OsRepository;
