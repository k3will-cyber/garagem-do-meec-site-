/**
 * Service for Leads business logic
 * Handles validation, business rules, and coordinates repository operations
 */

const WhatsAppService = require('../services/whatsappService');

class LeadsService {
  /**
   * @param {LeadsRepository} leadsRepository - Repository instance
   * @param {import('better-sqlite3').Database} db - Database instance (for sync to crm_leads)
   */
  constructor(leadsRepository, db) {
    this.leadsRepository = leadsRepository;
    this.db = db;
    this.whatsappService = new WhatsAppService();
  }

  /**
   * Find lead by ID
   * @param {number} id - Lead ID
   * @param {number} tenantId - Tenant ID
   * @returns {Object|null} Lead data or null if not found
   */
  async findById(id, tenantId) {
    return await this.leadsRepository.findById(id, tenantId);
  }

  /**
   * Create a new lead
   * @param {Object} leadData - Lead data
   * @param {number} tenantId - Tenant ID
   * @returns {Object} Created lead data
   * @throws {Error} If validation fails
   */
  async create(leadData, tenantId) {
    // Validation
    if (!leadData.name || leadData.name.trim() === '') {
      throw new Error('Nome é obrigatório');
    }

    if (!leadData.whatsapp || leadData.whatsapp.trim() === '') {
      throw new Error('WhatsApp é obrigatório');
    }

    // Create lead
    const result = await this.leadsRepository.create(leadData, tenantId);
    const createdLead = await this.leadsRepository.findById(result.lastInsertRowid, tenantId);

    // Sync to CRM crm_leads table (non-blocking)
    this.syncToCrmLeads(leadData, createdLead).catch(syncError => {
      console.error('Failed to sync lead to CRM:', syncError.message);
    });

    // Send WhatsApp notification (non-blocking)
    this.whatsappService.sendLeadNotification(createdLead).catch(error => {
      console.error('Failed to send WhatsApp notification for lead:', error);
    });

    return createdLead;
  }

  /**
   * Update an existing lead
   * @param {number} id - Lead ID
   * @param {Object} leadData - Lead data to update
   * @param {number} tenantId - Tenant ID
   * @returns {Object} Updated lead data
   * @throws {Error} If validation fails or lead not found
   */
  async update(id, leadData, tenantId) {
    // Validate if lead exists
    const existingLead = await this.findById(id, tenantId);
    if (!existingLead) {
      throw new Error('Lead não encontrado');
    }

    // Validate name if provided
    if (leadData.name !== undefined && leadData.name.trim() === '') {
      throw new Error('Nome não pode ser vazio');
    }

    // Validate whatsapp if provided
    if (leadData.whatsapp !== undefined && leadData.whatsapp.trim() === '') {
      throw new Error('WhatsApp não pode ser vazio');
    }

    // Update lead
    const result = await this.leadsRepository.update(id, leadData, tenantId);
    if (result.changes === 0) {
      throw new Error('Lead não encontrado');
    }

    const updatedLead = await this.leadsRepository.findById(id, tenantId);
    return updatedLead;
  }

  /**
   * Delete a lead
   * @param {number} id - Lead ID
   * @param {number} tenantId - Tenant ID
   * @returns {boolean} True if deleted
   * @throws {Error} If lead not found
   */
  async delete(id, tenantId) {
    // Validate if lead exists
    const existingLead = await this.findById(id, tenantId);
    if (!existingLead) {
      throw new Error('Lead não encontrado');
    }

    const result = await this.leadsRepository.delete(id, tenantId);
    return result.changes > 0;
  }

  /**
   * Get leads with filtering and pagination
   * @param {Object} filters - Filter options (status, search)
   * @param {number} tenantId - Tenant ID
   * @param {number} limit - Limit results
   * @param {number} offset - Offset for pagination
   * @returns {Array} List of leads
   */
  async findAll(filters = {}, tenantId, limit = null, offset = null) {
    return await this.leadsRepository.findAll(filters, tenantId, limit, offset);
  }

  /**
   * Count leads with filtering
   * @param {Object} filters - Filter options (status, search)
   * @param {number} tenantId - Tenant ID
   * @returns {number} Count of leads
   */
  async count(filters = {}, tenantId) {
    return await this.leadsRepository.count(filters, tenantId);
  }

  /**
   * Get pipeline summary (counts per status)
   * @param {number} tenantId - Tenon ID
   * @returns {Array} Summary of leads by status
   */
  async getPipelineSummary(tenantId) {
    return await this.leadsRepository.getPipelineSummary(tenantId);
  }

  /**
   * Get lead timeline (activity log)
   * @param {number} id - Lead ID
   * @param {number} tenantId - Tenant ID
   * @returns {Array} Timeline events
   */
  async getTimeline(id, tenantId) {
    return await this.leadsRepository.getTimeline(id, tenantId);
  }

  /**
   * Sync lead to CRM crm_leads table
   * Maps MEEC lead fields to CRM lead fields
   * @param {Object} leadData - Original lead data from request
   * @param {Object} createdLead - Created lead from database
   */
  async syncToCrmLeads(leadData, createdLead) {
    if (!this.db) return;

    // Map MEEC status to CRM status
    const statusMap = {
      'lead_qualificado': 'new',
      'lead_prospectado': 'contacted',
      'orcamento_ativo': 'quoted',
      'orcamento_fechado': 'won',
      'orcamento_finalizado': 'won',
      'new': 'new',
      'contacted': 'contacted',
      'quoted': 'quoted',
      'won': 'won',
      'lost': 'lost'
    };

    const name = leadData.name || createdLead.name || '';
    const whatsapp = leadData.whatsapp || createdLead.whatsapp || '';
    const email = leadData.email || createdLead.email || '';
    const message = leadData.message || createdLead.message || '';
    const origem = leadData.origem || createdLead.origem || 'site';
    const status = statusMap[leadData.status || createdLead.status] || 'new';
    const valor = leadData.valor || createdLead.valor || 0;
    const createdAt = createdLead.created_at || new Date().toISOString();

    // Dedup: check by phone or email
    const existing = await this.db.get(
      `SELECT id FROM crm_leads WHERE (phone = ? AND phone != '' AND phone IS NOT NULL) OR (email = ? AND email != '' AND email IS NOT NULL) LIMIT 1`,
      [whatsapp, email]
    );
    if (existing) return; // Already synced

    await this.db.run(
      `INSERT INTO crm_leads (name, phone, email, source, status, estimatedValue, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        name,
        whatsapp,
        email,
        origem || 'site',
        status,
        valor,
        message,
        createdAt
      ]
    );

    console.log('[Sync] Lead "' + name + '" synced to CRM crm_leads');
  }
}

module.exports = LeadsService;