/**
 * WhatsApp Web Service — Garagem do MEEC
 * 
 * Usa whatsapp-web.js para enviar notificações automáticas.
 * Escaneie o QR Code em /api/whatsapp/qr para conectar.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const events = require('events');

// ─── Config ───────────────────────────────────────────────────────
const CHROME_PATH = process.env.CHROME_PATH || '';
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED !== 'false';
const WHATSAPP_OWNER_NUMBER = process.env.WHATSAPP_OWNER_NUMBER || '5561981257477'; // Número do Pablo
const AUTH_DIR = path.join(__dirname, '..', 'data', 'whatsapp-auth');

// Ensure auth directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

// ─── Event Emitter ────────────────────────────────────────────────
const emitter = new events.EventEmitter();

// ─── State ────────────────────────────────────────────────────────
let client = null;
let isReady = false;
let currentQR = null;
let connectionAttempts = 0;
const MAX_RETRIES = 3;
let qrResolvers = [];

// ─── Messages ─────────────────────────────────────────────────────
const AUTO_REPLY = {
  lead: `🛞 *Garagem do MEEC* — Recebemos sua solicitação!\n\nOlá! Recebemos seu contato e em breve o Pablo (ou alguém da equipe) vai responder.\n\n⚡ *Enquanto isso:*\n📍 R. 102, Jardim Ceu Azul — Valparaíso de Goiás\n📞 (61) 98125-7477\n🔧 Diagnóstico computadorizado • Laudo técnico • Orçamento fechado\n\n✅ *Resposta em até 2h em horário comercial.*`,

  orcamento: (nome, status) => {
    if (status === 'orcamento_ativo') {
      return `🛞 *Garagem do MEEC* — Seu orçamento está ativo!\n\nOlá ${nome}, seu orçamento já está sendo preparado. Em breve enviaremos os detalhes.\n\nQualquer dúvida, é só responder esta mensagem.`;
    }
    if (status === 'orcamento_fechado') {
      return `✅ *Garagem do MEEC* — Orçamento fechado!\n\nOlá ${nome}, seu orçamento foi fechado com sucesso! Agora é só aguardar a execução do serviço.\n\nAgradecemos a confiança! 🚗💨`;
    }
    if (status === 'orcamento_finalizado') {
      return `🎉 *Garagem do MEEC* — Serviço finalizado!\n\nOlá ${nome}, o serviço do seu veículo foi concluído! Seu carro já está pronto para retirada.\n\n✅ Garantia de 90 dias • Nota fiscal emitida\n\n📍 R. 102, Jardim Ceu Azul — Valparaíso de Goiás`;
    }
    return '';
  }
};

// ─── Initialize Client ────────────────────────────────────────────
function getPuppeteerConfig() {
  const config = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  };

  if (CHROME_PATH) {
    config.executablePath = CHROME_PATH;
  }

  return config;
}

function init() {
  if (!WHATSAPP_ENABLED) {
    console.log('📱 WhatsApp Web: desabilitado (WHATSAPP_ENABLED=false)');
    return false;
  }

  if (client) return true;

  try {
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: AUTH_DIR }),
      puppeteer: getPuppeteerConfig(),
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
      }
    });

    client.on('qr', async (qr) => {
      currentQR = qr;
      connectionAttempts = 0;
      try {
        const qrImage = await qrcode.toDataURL(qr);
        currentQR = qrImage;
        // Notify any waiting resolvers
        qrResolvers.forEach(resolve => resolve(qrImage));
        qrResolvers = [];
      } catch (err) {
        console.error('❌ WhatsApp QR generation error:', err.message);
      }
      emitter.emit('qr', currentQR);
      console.log('📱 WhatsApp: QR Code atualizado — escaneie em /api/whatsapp/qr');
    });

    client.on('ready', () => {
      isReady = true;
      currentQR = null;
      console.log('✅ WhatsApp Web conectado com sucesso!');
      emitter.emit('ready');
    });

    client.on('authenticated', () => {
      console.log('🔐 WhatsApp Web autenticado');
    });

    client.on('auth_failure', (msg) => {
      console.error('❌ WhatsApp Web falha na autenticação:', msg);
      isReady = false;
    });

    client.on('disconnected', (reason) => {
      console.log(`📱 WhatsApp Web desconectado: ${reason}`);
      isReady = false;
      currentQR = null;
      
      // Tentar reconectar se não foi um logout manual
      if (reason !== 'LOGOUT') {
        setTimeout(() => {
          console.log('📱 Tentando reconectar WhatsApp...');
          init();
        }, 5000);
      }
    });

    client.on('message', async (message) => {
      // Auto-reply for common messages
      const text = message.body.toLowerCase();
      if (message.from.includes(WHATSAPP_OWNER_NUMBER)) return; // Don't auto-reply to owner
      
      // Simple auto-reply for incoming messages when not connected to owner
      if (text.includes('horário') || text.includes('horario') || text.includes('funcionamento')) {
        await sendMessage(message.from, '🕐 *Horário de Funcionamento*\n\nSeg–Sex: 8h às 18h\nSáb: 8h às 12h\n📍 R. 102, Jardim Ceu Azul — Valparaíso de Goiás');
      } else if (text.includes('endereço') || text.includes('endereco') || text.includes('local') || text.includes('onde')) {
        await sendMessage(message.from, '📍 *Endereço*\n\nR. 102, Jardim Ceu Azul\nValparaíso de Goiás · GO, 72871-102\n\n🔗 Abrir no Maps: https://maps.app.goo.gl/...');
      } else if (text.includes('diagnóstico') || text.includes('diagnostico') || text.includes('scanner')) {
        await sendMessage(message.from, '🔧 *Diagnóstico Computadorizado*\n\n✅ Leitura ALPHATEST multimarcas\n✅ Checklist de 50+ itens\n✅ Laudo técnico em PDF\n✅ 1ª visita sem custo\n\nAgende: (61) 98125-7477');
      }
    });

    client.initialize().catch(err => {
      console.error('❌ WhatsApp Web initialization error:', err.message);
      client = null;
      isReady = false;
    });

    return true;
  } catch (err) {
    console.error('❌ WhatsApp Web setup error:', err.message);
    client = null;
    isReady = false;
    return false;
  }
}

// ─── Send Message ─────────────────────────────────────────────────
async function sendMessage(to, message) {
  if (!client || !isReady) {
    console.log('📱 WhatsApp não conectado — mensagem não enviada');
    return false;
  }

  try {
    // Ensure number has @c.us suffix
    const chatId = to.includes('@') ? to : `${to}@c.us`;
    await client.sendMessage(chatId, message);
    return true;
  } catch (err) {
    console.error('❌ WhatsApp send error:', err.message);
    return false;
  }
}

// ─── Public API Functions ─────────────────────────────────────────

/**
 * Send notification to garage owner about a new lead
 */
async function notifyNewLead(lead) {
  if (!isReady) return false;
  
  const message = `🆕 *NOVO LEAD* — Garagem do MEEC\n\n👤 *Nome:* ${lead.name}\n📱 *WhatsApp:* ${lead.whatsapp}\n${lead.email ? `📧 *Email:* ${lead.email}` : ''}\n${lead.veiculo ? `🚗 *Veículo:* ${lead.veiculo}` : ''}\n${lead.servico_interesse ? `🔧 *Serviço:* ${lead.servico_interesse}` : ''}\n${lead.message ? `💬 *Mensagem:* ${lead.message.substring(0, 100)}` : ''}\n📅 *Data:* ${new Date(lead.created_at).toLocaleString('pt-BR')}\n🏷️ *Origem:* ${lead.origem || 'site'}\n\n👉 Gerencie no painel: /admin`;

  return await sendMessage(WHATSAPP_OWNER_NUMBER, message);
}

/**
 * Send auto-reply to a new lead
 */
async function sendAutoReply(lead) {
  if (!isReady) return false;
  
  const number = lead.whatsapp.replace(/\D/g, '');
  if (number.length < 10) return false;
  
  // Send first auto-reply
  return await sendMessage(`55${number}`, AUTO_REPLY.lead);
}

/**
 * Send status update notification
 */
async function notifyStatusChange(lead, oldStatus) {
  if (!isReady) return false;

  const pipelineLabels = {
    lead_qualificado: 'Lead Qualificado',
    lead_prospectado: 'Lead Prospectado',
    orcamento_ativo: 'Orçamento Ativo',
    orcamento_fechado: 'Orçamento Fechado',
    orcamento_finalizado: 'Orçamento Finalizado'
  };

  const pipelineEmojis = {
    lead_qualificado: '🔵',
    lead_prospectado: '🟡',
    orcamento_ativo: '🔵',
    orcamento_fechado: '🟢',
    orcamento_finalizado: '⚪'
  };

  const newLabel = pipelineLabels[lead.status] || lead.status;
  const oldLabel = pipelineLabels[oldStatus] || oldStatus;
  const emoji = pipelineEmojis[lead.status] || '⚪';
  const valorStr = lead.valor ? `\n💰 *Valor:* R$ ${parseFloat(lead.valor).toFixed(2).replace('.', ',')}` : '';

  // Notify owner
  await sendMessage(WHATSAPP_OWNER_NUMBER, 
    `📋 *Lead Atualizado* — Garagem do MEEC\n\n👤 *Cliente:* ${lead.name}\n📱 *WhatsApp:* ${lead.whatsapp}\n🔄 *Status:* ${emoji} ${oldLabel} → ${newLabel}${valorStr}\n📅 *Data:* ${new Date().toLocaleString('pt-BR')}`
  );

  // Send status update to client (for non-initial statuses)
  if (lead.status.startsWith('orcamento_') && lead.status !== 'lead_qualificado') {
    const replyMsg = AUTO_REPLY.orcamento(lead.name, lead.status);
    if (replyMsg) {
      const number = lead.whatsapp.replace(/\D/g, '');
      if (number.length >= 10) {
        await sendMessage(`55${number}`, replyMsg);
      }
    }
  }
}

/**
 * Send a broadcast message to all leads with a specific status
 */
async function broadcastToLeads(leads, message) {
  if (!isReady) return { sent: 0, failed: 0 };
  
  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    const number = lead.whatsapp.replace(/\D/g, '');
    if (number.length >= 10) {
      const ok = await sendMessage(`55${number}`, message);
      if (ok) sent++; else failed++;
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return { sent, failed };
}

// ─── Express Routes ──────────────────────────────────────────────

function registerRoutes(app, db) {
  if (!app) return;

  // Get QR code for scanning
  app.get('/api/whatsapp/qr', (req, res) => {
    if (isReady) {
      return res.json({ status: 'connected', message: 'WhatsApp já está conectado!' });
    }

    if (currentQR) {
      return res.json({ 
        status: 'awaiting_scan', 
        qr: currentQR,
        message: 'Escaneie o QR Code com seu WhatsApp para conectar'
      });
    }

    // If no QR yet, wait for one
    if (!client) {
      init();
    }

    // Wait for QR code up to 15 seconds
    const timeout = setTimeout(() => {
      res.json({ status: 'timeout', message: 'Ainda gerando QR Code, tente novamente' });
    }, 15000);

    qrResolvers.push((qrImage) => {
      clearTimeout(timeout);
      res.json({ status: 'awaiting_scan', qr: qrImage });
    });
  });

  // Check WhatsApp connection status
  app.get('/api/whatsapp/status', (req, res) => {
    res.json({
      connected: isReady,
      enabled: WHATSAPP_ENABLED,
      hasClient: !!client,
      ownerNumber: WHATSAPP_OWNER_NUMBER
    });
  });

  // Disconnect WhatsApp
  app.post('/api/whatsapp/disconnect', async (req, res) => {
    try {
      if (client) {
        await client.destroy();
      }
    } catch (err) {
      console.error('WhatsApp disconnect error:', err.message);
    }
    client = null;
    isReady = false;
    currentQR = null;
    res.json({ success: true, message: 'WhatsApp desconectado' });
  });

  // Send test message
  app.post('/api/whatsapp/test', async (req, res) => {
    const { to, message } = req.body;
    const target = to || WHATSAPP_OWNER_NUMBER;
    const msg = message || '🔧 Teste de conexão — Garagem do MEEC';
    
    const ok = await sendMessage(target, msg);
    res.json({ success: ok, message: ok ? 'Mensagem enviada!' : 'WhatsApp não conectado' });
  });
}

// ─── Export ───────────────────────────────────────────────────────
module.exports = {
  init,
  sendMessage,
  notifyNewLead,
  sendAutoReply,
  notifyStatusChange,
  broadcastToLeads,
  registerRoutes,
  isReady: () => isReady,
  getClient: () => client,
  emitter,
  WHATSAPP_OWNER_NUMBER
};
