/**
 * Repository for Leads data access operations
 * Handles all SQL interactions with the leads table
 */

class LeadsRepository {
  /**
   * @param {Object} db - Database adapter instance
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Find lead by ID
   * @param {number} id - Lead ID
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Object|null>} Lead data or null if not found
   */
  async findById(id, tenantId) {
    return this.db.get(
      'SELECT * FROM leads WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );
  }

  /**
   * Create a new lead
   * @param {Object} leadData - Lead data
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Object>} Result with lastInsertRowId
   */
  async create(leadData, tenantId) {
    return this.db.run(
      `INSERT INTO leads (
        name, whatsapp, email, message, origem, veiculo, servico_interesse,
        status, valor, notas, data_proximo_contato, ultimo_contato,
        responsavel, tenant_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        leadData.name,
        leadData.whatsapp,
        leadData.email || '',
        leadData.message || '',
        leadData.origem || 'site',
        leadData.veiculo || null,
        leadData.servico_interesse || null,
        leadData.status || 'lead_qualificado',
        leadData.valor || 0,
        leadData.notas || null,
        leadData.data_proximo_contato || null,
        leadData.ultimo_contato || null,
        leadData.responsavel || 'Pablo Jhonatan',
        tenantId
      ]
    );
  }

  /**
   * Update an existing lead
   * @param {number} id - Lead ID
   * @param {Object} leadData - Lead data to update
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Object>} Result of update operation
   */
  async update(id, leadData, tenantId) {
    const fields = [];
    const params = [];

    if (leadData.name !== undefined) {
      fields.push('name = ?');
      params.push(leadData.name);
    }
    if (leadData.whatsapp !== undefined) {
      fields.push('whatsapp = ?');
      params.push(leadData.whatsapp);
    }
    if (leadData.email !== undefined) {
      fields.push('email = ?');
      params.push(leadData.email);
    }
    if (leadData.message !== undefined) {
      fields.push('message = ?');
      params.push(leadData.message);
    }
    if (leadData.origem !== undefined) {
      fields.push('origem = ?');
      params.push(leadData.origem);
    }
    if (leadData.veiculo !== undefined) {
      fields.push('veiculo = ?');
      params.push(leadData.veiculo);
    }
    if (leadData.servico_interesse !== undefined) {
      fields.push('servico_interesse = ?');
      params.push(leadData.servico_interesse);
    }
    if (leadData.status !== undefined) {
      fields.push('status = ?');
      params.push(leadData.status);
    }
    if (leadData.valor !== undefined) {
      fields.push('valor = ?');
      params.push(leadData.valor);
    }
    if (leadData.notas !== undefined) {
      fields.push('notas = ?');
      params.push(leadData.notas);
    }
    if (leadData.data_proximo_contato !== undefined) {
      fields.push('data_proximo_contato = ?');
      params.push(leadData.data_proximo_contato);
    }
    if (leadData.ultimo_contato !== undefined) {
      fields.push('ultimo_contato = ?');
      params.push(leadData.ultimo_contato);
    }
    if (leadData.responsavel !== undefined) {
      fields.push('responsavel = ?');
      params.push(leadData.responsavel);
    }

    // Always update timestamp
    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
    }

    if (fields.length === 0) {
      return { changes: 0 };
    }

    params.push(id, tenantId);

    return this.db.run(
      `UPDATE leads SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`,
      params
    );
  }

  /**
   * Delete a lead
   * @param {number} id - Lead ID
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Object>} Result of delete operation
   */
  async delete(id, tenantId) {
    return this.db.run(
      'DELETE FROM leads WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );
  }

  /**
   * Get leads with filtering and pagination
   * @param {Object} filters - Filter options (status, search)
   * @param {number} tenantId - Tenant ID
   * @param {number} limit - Limit results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} List of leads
   */
  async findAll(filters = {}, tenantId, limit = null, offset = null) {
    let query = 'SELECT * FROM leads WHERE tenant_id = ?';
    const params = [tenantId];
    const conditions = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.search) {
      conditions.push('(name LIKE ? OR whatsapp LIKE ? OR email LIKE ? OR message LIKE ? OR veiculo LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (limit !== null) {
      query += ' LIMIT ?';
      params.push(limit);
      if (offset !== null) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    return this.db.all(query, params);
  }

  /**
   * Count leads with filtering
   * @param {Object} filters - Filter options (status, search)
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<number>} Count of leads
   */
  async count(filters = {}, tenantId) {
    let query = 'SELECT COUNT(*) as count FROM leads WHERE tenant_id = ?';
    const params = [tenantId];
    const conditions = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.search) {
      conditions.push('(name LIKE ? OR whatsapp LIKE ? OR email LIKE ? OR message LIKE ? OR veiculo LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    const result = await this.db.get(query, params);
    return result ? result.count : 0;
  }

  /**
   * Get pipeline summary (counts per status)
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Array>} Summary of leads by status
   */
  async getPipelineSummary(tenantId) {
    return this.db.all(
      `SELECT status, COUNT(*) as count, SUM(valor) as total_valor
       FROM leads
       WHERE tenant_id = ?
       GROUP BY status`,
      [tenantId]
    );
  }

  /**
   * Get lead timeline (activity log)
   * @param {number} id - Lead ID
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Array>} Timeline events
   */
  async getTimeline(id, tenantId) {
    const lead = await this.findById(id, tenantId);
    if (!lead) return [];

    const timeline = [
      {
        date: lead.created_at,
        type: 'created',
        description: 'Lead criado',
        detail: `Origem: ${lead.origem || 'site'}`
      }
    ];

    if (lead.ultimo_contato && lead.ultimo_contato !== lead.created_at) {
      timeline.push({
        date: lead.ultimo_contato,
        type: 'contact',
        description: 'Último contato',
        detail: `Status atual: ${this.getStatusLabel(lead.status) || lead.status}`
      });
    }

    // Sort by date descending
    return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Get status label
   * @private
   */
  getStatusLabel(status) {
    const statusLabels = {
      lead_qualificado: 'Lead Qualificado',
      lead_prospectado: 'Lead Prospectado',
      orcamento_ativo: 'Orçamento Ativo',
      orcamento_fechado: 'Orçamento Fechado',
      orcamento_finalizado: 'Orçamento Finalizado'
    };
    return statusLabels[status] || null;
  }
}

module.exports = LeadsRepository;
