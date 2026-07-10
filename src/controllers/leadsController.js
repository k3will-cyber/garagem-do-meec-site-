/**
 * Controller for Leads HTTP endpoints
 * Handles request/response, validation, and delegates to service layer
 */

class LeadsController {
  /**
   * @param {LeadsService} leadsService - Service instance
   */
  constructor(leadsService) {
    this.leadsService = leadsService;
  }

  /**
   * GET /api/leads
   * Get leads with filtering and pagination
   */
  async getLeads(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const { status, search, limit, offset } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (search) filters.search = search;

      const leads = await this.leadsService.findAll(
        filters,
        tenantId,
        limit ? parseInt(limit) : null,
        offset ? parseInt(offset) : null
      );

      const total = await this.leadsService.count(filters, tenantId);

      res.json({
        success: true,
        data: leads,
        pagination: {
          total,
          limit: limit ? parseInt(limit) : total,
          offset: offset ? parseInt(offset) : 0
        }
      });
    } catch (error) {
      console.error('Get leads error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/leads/:id
   * Get lead by ID
   */
  async getLeadById(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const leadId = parseInt(req.params.id);

      if (isNaN(leadId)) {
        return res.status(400).json({ error: 'Invalid lead ID' });
      }

      const lead = await this.leadsService.findById(leadId, tenantId);

      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error('Get lead by ID error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/leads
   * Create a new lead
   */
  async createLead(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const leadData = req.body;

      // Basic validation
      if (!leadData.name || leadData.name.trim() === '') {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      if (!leadData.whatsapp || leadData.whatsapp.trim() === '') {
        return res.status(400).json({ error: 'WhatsApp é obrigatório' });
      }

      const lead = await this.leadsService.create(leadData, tenantId);

      res.status(201).json({
        success: true,
        message: 'Lead criado com sucesso',
        data: lead
      });
    } catch (error) {
      if (error.message.includes('obrigatório') || error.message.includes('obrigatório')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Create lead error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /api/leads/:id
   * Update an existing lead
   */
  async updateLead(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const leadId = parseInt(req.params.id);
      const leadData = req.body;

      if (isNaN(leadId)) {
        return res.status(400).json({ error: 'Invalid lead ID' });
      }

      const lead = await this.leadsService.update(leadId, leadData, tenantId);

      res.json({
        success: true,
        message: 'Lead atualizado com sucesso',
        data: lead
      });
    } catch (error) {
      if (error.message === 'Lead não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('obrigatório') || error.message.includes('vazio') || error.message.includes('não pode ser vazio')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Update lead error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/leads/:id
   * Delete a lead
   */
  async deleteLead(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const leadId = parseInt(req.params.id);

      if (isNaN(leadId)) {
        return res.status(400).json({ error: 'Invalid lead ID' });
      }

      const deleted = await this.leadsService.delete(leadId, tenantId);

      if (!deleted) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.json({
        success: true,
        message: 'Lead excluído com sucesso'
      });
    } catch (error) {
      if (error.message === 'Lead não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Delete lead error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/leads/pipeline/summary
   * Get pipeline summary (counts per status)
   */
  async getPipelineSummary(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const summary = await this.leadsService.getPipelineSummary(tenantId);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get pipeline summary error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/leads/:id/timeline
   * Get lead timeline (activity log)
   */
  async getLeadTimeline(req, res) {
    try {
      const tenantId = req.tenant?.id || 1;
      const leadId = parseInt(req.params.id);

      if (isNaN(leadId)) {
        return res.status(400).json({ error: 'Invalid lead ID' });
      }

      const timeline = await this.leadsService.getTimeline(leadId, tenantId);

      res.json({
        success: true,
        data: timeline
      });
    } catch (error) {
      console.error('Get lead timeline error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = LeadsController;