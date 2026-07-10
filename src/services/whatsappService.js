/**
 * Service for WhatsApp messaging
 * Handles sending WhatsApp notifications
 */

class WhatsAppService {
  constructor() {
    // In a real implementation, you would initialize your WhatsApp client here
    // For example, using Twilio or WhatsApp Business API
    this.enabled = process.env.WHATSAPP_ENABLED !== 'false';
    this.ownerNumber = process.env.WHATSAPP_OWNER_NUMBER || '5561981257477';
  }

  /**
   * Send a WhatsApp message
   * @param {string} to - Recipient phone number
   * @param {string} message - Message content
   * @returns {Promise<Object>} Result of send operation
   */
  async sendMessage(to, message) {
    if (!this.enabled) {
      console.log('WhatsApp is disabled. Message not sent:', { to, message });
      return { success: false, reason: 'disabled' };
    }

    // Validate phone number format (basic validation)
    if (!to || !/^\d+$/.toString().test(to.replace(/\s+/g, ''))) {
      console.error('Invalid phone number for WhatsApp:', to);
      return { success: false, reason: 'invalid_number' };
    }

    try {
      // In a real implementation, this would call the WhatsApp API
      // For example, using Twilio:
      // const accountSid = process.env.TWILIO_ACCOUNT_SID;
      // const authToken = process.env.TWILIO_AUTH_TOKEN;
      // const client = require('twilio')(accountSid, authToken);
      //
      // return await client.messages.create({
      //   body: message,
      //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      //   to: `whatsapp:${to}`
      // });

      // For now, we'll simulate sending by logging
      console.log('WhatsApp message sent:', {
        to: `whatsapp:${to}`,
        from: `whatsapp:${this.ownerNumber}`,
        body: message
      });

      return { success: true, messageId: 'simulated_' + Date.now() };
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send lead notification to WhatsApp
   * @param {Object} lead - Lead data
   * @returns {Promise<Object>} Result of send operation
   */
  async sendLeadNotification(lead) {
    if (!this.enabled) {
      return { success: false, reason: 'disabled' };
    }

    const message = `
*Novo Lead Recebido*

*Nome:* ${lead.name}
*WhatsApp:* ${lead.whatsapp}
*Email:* ${lead.email || 'Não informado'}
*Mensagem:* ${lead.message || 'Não informada'}
*Origem:* ${lead.origem || 'site'}
*Veículo:* ${lead.veiculo || 'Não informado'}
*Serviço de Interesse:* ${lead.servico_interesse || 'Não informado'}
*Status:* ${lead.status}
*Valor:* R$ ${lead.valor || 0}

*Horário:* ${new Date(lead.created_at || Date.now()).toLocaleString()}
    `.trim();

    return this.sendMessage(this.ownerNumber, message);
  }
}

module.exports = WhatsAppService;