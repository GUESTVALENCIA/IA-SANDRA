// ═══════════════════════════════════════════════════════
// SANDRA PROFESSIONAL - BACKEND SERVER
// Express API Gateway con SDKs Oficiales
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { AIServices, VoiceServices, BusinessServices, CommServices } = require('./services');
const MCPSystem = require('./mcp-system');
const ExpertSubagentsSystem = require('./mcp-subagents-expert');
const connectorsAPI = require('./connectors-api');
const { SandraComputerVision, SandraComputerVisionIntegration } = require('./sandra-computer-vision');
const SandraNeonDatabase = require('./sandra-neon-database');

const app = express();
const PORT = process.env.PORT || 5000;

// Inicializar Sistemas
const mcp = new MCPSystem(); // Sistema MCP original
const experts = new ExpertSubagentsSystem(); // Sistema Subagentes Expertos Galaxy
const computerVision = new SandraComputerVision(); // Sistema Computer Vision
const neonDB = new SandraNeonDatabase(); // Base de datos Neon PostgreSQL

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos del frontend
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// Integrar API de conectores
app.use('/api', connectorsAPI);

// ══════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  const expertsStatus = experts.getSystemStatus();
  const mcpStatus = mcp.getStatus();
  
  res.json({
    status: 'operational',
    services: {
      ai: {
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        groq: !!process.env.GROQ_API_KEY
      },
      voice: {
        elevenlabs: !!process.env.ELEVENLABS_API_KEY,
        deepgram: !!process.env.DEEPGRAM_API_KEY,
        cartesia: !!process.env.CARTESIA_API_KEY,
        heygen: !!process.env.HEYGEN_API_KEY
      },
      business: {
        supabase: !!process.env.SUPABASE_URL,
        airtable: !!process.env.AIRTABLE_API_KEY,
        paypal: !!process.env.PAYPAL_CLIENT_ID
      },
      communications: {
        twilio: !!process.env.TWILIO_ACCOUNT_SID,
        meta: !!process.env.META_ACCESS_TOKEN
      },
      expertSystem: {
        enabled: true,
        totalExperts: expertsStatus.totalExperts,
        experts: Object.keys(expertsStatus.experts),
        memorySize: expertsStatus.memorySize
      },
      sandraNucleus: {
        enabled: true,
        version: experts.sandraNucleus.version,
        mode: experts.sandraNucleus.mode,
        features: experts.sandraNucleus.config.features,
        status: experts.sandraNucleus.getStatus()
      },
      mcp: {
        enabled: true,
        conversationLength: mcpStatus.conversationLength
      },
      computerVision: {
        enabled: true,
        status: computerVision.getStatus(),
        capabilities: ['object_detection', 'face_recognition', 'ocr', 'image_classification', 'video_analysis']
      },
      neonDatabase: {
        enabled: true,
        status: neonDB.getStatus(),
        capabilities: ['cv_analytics', 'user_tracking', 'metrics', 'feedback', 'export']
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ══════════════════════════════════════════════════════
// ENDPOINTS DE IA
// ══════════════════════════════════════════════════════

// Claude Sonnet 4.5
app.post('/api/claude', async (req, res) => {
  try {
    const { message, context = [], mode = 'professional' } = req.body;
    const result = await AIServices.claudeChat(message, context, mode);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Claude:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GPT-4o
app.post('/api/gpt', async (req, res) => {
  try {
    const { message, context = [] } = req.body;
    const result = await AIServices.gptChat(message, context);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error GPT:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Groq
app.post('/api/groq', async (req, res) => {
  try {
    const { message, context = [] } = req.body;
    const result = await AIServices.groqChat(message, context);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Groq:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════
// SISTEMA MCP - SUBAGENTES INTELIGENTES
// ══════════════════════════════════════════════════════

// Endpoint principal Sandra con routing inteligente
app.post('/api/sandra', async (req, res) => {
  try {
    const { message, taskType = 'auto', context = {} } = req.body;
    const result = await mcp.routeTask(message, taskType);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Sandra MCP:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint específico: Cerebro (razonamiento profundo)
app.post('/api/sandra/cerebro', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const result = await mcp.executeWithCerebro(message, context);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Cerebro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint específico: Conversación (chat natural)
app.post('/api/sandra/conversacion', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const result = await mcp.executeWithConversacion(message, context);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Conversación:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint específico: Desarrollador (código profesional)
app.post('/api/sandra/dev', async (req, res) => {
  try {
    const { task, context = {} } = req.body;
    const result = await mcp.executeWithDesarrollador(task, context);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Desarrollador:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint colaborativo multi-subagente
app.post('/api/sandra/colaborativo', async (req, res) => {
  try {
    const { task, subagents = ['cerebro', 'desarrollador'] } = req.body;
    const results = await mcp.collaborativeTask(task, subagents);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Error Colaborativo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Estado del sistema MCP
app.get('/api/sandra/status', (req, res) => {
  try {
    const status = mcp.getStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    console.error('Error Status MCP:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════
// SISTEMA DE SUBAGENTES EXPERTOS GALAXY 
// ══════════════════════════════════════════════════════

// Endpoint principal: Router automático a experto correcto
app.post('/api/experts/auto', async (req, res) => {
  try {
    const { message, expertHint = 'auto' } = req.body;
    const result = await experts.routeToExpert(message, expertHint);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Expert Router:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoints específicos por experto
app.post('/api/experts/ceo', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const result = await experts.executeExpert('ceo', message, context);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error CEO Expert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/experts/dev', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const result = await experts.executeExpert('dev', message, context);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Dev Expert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/experts/marketing', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const result = await experts.executeExpert('marketing', message, context);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Marketing Expert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/experts/ops', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const result = await experts.executeExpert('ops', message, context);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Ops Expert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/experts/support', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const result = await experts.executeExpert('support', message, context);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Support Expert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/experts/analyst', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const result = await experts.executeExpert('analyst', message, context);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Analyst Expert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Colaboración multi-experto
app.post('/api/experts/collaborate', async (req, res) => {
  try {
    const { task, expertsList = ['ceo', 'dev'] } = req.body;
    const results = await experts.collaborativeTask(task, expertsList);
    res.json({ success: true, ...results });
  } catch (error) {
    console.error('Error Expert Collaboration:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pipeline secuencial de expertos
app.post('/api/experts/pipeline', async (req, res) => {
  try {
    const { task, pipeline = ['ceo', 'dev', 'ops'] } = req.body;
    const results = await experts.expertPipeline(task, pipeline);
    res.json({ success: true, ...results });
  } catch (error) {
    console.error('Error Expert Pipeline:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar expertos disponibles
app.get('/api/experts/list', (req, res) => {
  try {
    const expertsList = experts.listExperts();
    res.json({ success: true, experts: expertsList });
  } catch (error) {
    console.error('Error List Experts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Estado del sistema de expertos
app.get('/api/experts/status', (req, res) => {
  try {
    const status = experts.getSystemStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    console.error('Error Experts Status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════
// SANDRA NUCLEUS CORE - SISTEMA UNIFICADO COMPLETO
// ══════════════════════════════════════════════════════

// Endpoint principal de Sandra Nucleus (Integra TODOS los proyectos fragmentados)
app.post('/api/sandra/nucleus', async (req, res) => {
  try {
    const { message, context = {} } = req.body;

    console.log('🧠 SANDRA NUCLEUS procesando:', message.substring(0, 100) + '...');

    const result = await experts.sandraNucleus.processChatMessage(message, context);

    res.json({
      success: true,
      ...result,
      system: "SANDRA_NUCLEUS_UNIFIED",
      version: experts.sandraNucleus.version,
      mode: experts.sandraNucleus.mode
    });
  } catch (error) {
    console.error('❌ Error Sandra Nucleus:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      system: "SANDRA_NUCLEUS_UNIFIED"
    });
  }
});

// Estado completo de Sandra Nucleus
app.get('/api/sandra/nucleus/status', (req, res) => {
  try {
    const status = experts.sandraNucleus.getStatus();
    res.json({
      success: true,
      nucleus: status,
      integration: "COMPLETE",
      fragmentedProjects: "14_PROJECTS_UNIFIED"
    });
  } catch (error) {
    console.error('❌ Error Sandra Nucleus Status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint multimodal (voz, avatar, etc.) - Próximamente
app.post('/api/sandra/nucleus/multimodal', async (req, res) => {
  try {
    const { message, context = {}, modality = 'text' } = req.body;

    // TODO: Implementar capacidades multimodales extraídas de proyectos
    const result = await experts.sandraNucleus.processChatMessage(message, {
      ...context,
      modality: modality,
      multimodal: true
    });

    res.json({
      success: true,
      ...result,
      modality: modality,
      multimodalCapabilities: experts.sandraNucleus.config.features
    });
  } catch (error) {
    console.error('❌ Error Sandra Nucleus Multimodal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════
// ENDPOINTS DE VOZ
// ══════════════════════════════════════════════════════

// ElevenLabs TTS
app.post('/api/voice/elevenlabs/speak', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    const audioBuffer = await VoiceServices.elevenLabsSpeak(text, voiceId);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error('Error ElevenLabs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deepgram STT
app.post('/api/voice/deepgram/transcribe', async (req, res) => {
  try {
    const { audio, language = 'es' } = req.body;
    const audioBuffer = Buffer.from(audio, 'base64');
    const result = await VoiceServices.deepgramTranscribe(audioBuffer, language);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Deepgram:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cartesia TTS
app.post('/api/voice/cartesia/speak', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    const audioBuffer = await VoiceServices.cartesiaSpeak(text, voiceId);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error('Error Cartesia:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// HeyGen Video Generate
app.post('/api/voice/heygen/generate', async (req, res) => {
  try {
    const { text, avatarId } = req.body;
    const result = await VoiceServices.heygenGenerate(text, avatarId);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error HeyGen:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// HeyGen Video Status
app.get('/api/voice/heygen/status/:videoId', async (req, res) => {
  try {
    const result = await VoiceServices.heygenStatus(req.params.videoId);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error HeyGen Status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════
// ENDPOINTS DE NEGOCIO
// ══════════════════════════════════════════════════════

// Supabase Query
app.post('/api/supabase/query', async (req, res) => {
  try {
    const { table, query } = req.body;
    const data = await BusinessServices.supabaseQuery(table, query);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error Supabase Query:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supabase Insert
app.post('/api/supabase/insert', async (req, res) => {
  try {
    const { table, data } = req.body;
    const inserted = await BusinessServices.supabaseInsert(table, data);
    res.json({ success: true, data: inserted });
  } catch (error) {
    console.error('Error Supabase Insert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supabase Update
app.post('/api/supabase/update', async (req, res) => {
  try {
    const { table, id, data } = req.body;
    const updated = await BusinessServices.supabaseUpdate(table, id, data);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error Supabase Update:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Airtable Get
app.get('/api/airtable/:table/:recordId?', async (req, res) => {
  try {
    const { table, recordId } = req.params;
    const data = await BusinessServices.airtableGet(table, recordId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error Airtable Get:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Airtable Create
app.post('/api/airtable/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { fields } = req.body;
    const data = await BusinessServices.airtableCreate(table, fields);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error Airtable Create:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Airtable Update
app.patch('/api/airtable/:table/:recordId', async (req, res) => {
  try {
    const { table, recordId } = req.params;
    const { fields } = req.body;
    const data = await BusinessServices.airtableUpdate(table, recordId, fields);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error Airtable Update:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PayPal Create Order
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { amount, currency = 'EUR' } = req.body;
    const order = await BusinessServices.paypalCreateOrder(amount, currency);
    res.json({ success: true, ...order });
  } catch (error) {
    console.error('Error PayPal Create Order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PayPal Capture Order
app.post('/api/paypal/capture-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const capture = await BusinessServices.paypalCaptureOrder(orderId);
    res.json({ success: true, ...capture });
  } catch (error) {
    console.error('Error PayPal Capture:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════
// ENDPOINTS DE COMUNICACIÓN
// ══════════════════════════════════════════════════════

// Twilio SMS
app.post('/api/sms/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    const result = await CommServices.sendSMS(to, message);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Twilio SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Twilio WhatsApp
app.post('/api/whatsapp/twilio/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    const result = await CommServices.sendWhatsApp(to, message);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Twilio WhatsApp:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Meta WhatsApp Business
app.post('/api/whatsapp/meta/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    const result = await CommServices.metaWhatsAppSend(to, message);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Meta WhatsApp:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════
// ENDPOINTS DE COMPUTER VISION
// ══════════════════════════════════════════════════════

// Object Detection
app.post('/api/cv/detect-objects', async (req, res) => {
  try {
    const { image, options = {} } = req.body;
    const result = await computerVision.detectObjects(image, options);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Object Detection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Face Recognition
app.post('/api/cv/recognize-faces', async (req, res) => {
  try {
    const { image, options = {} } = req.body;
    const result = await computerVision.recognizeFaces(image, options);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Face Recognition:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// OCR (Optical Character Recognition)
app.post('/api/cv/ocr', async (req, res) => {
  try {
    const { image, options = {} } = req.body;
    const result = await computerVision.performOCR(image, options);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error OCR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Image Classification
app.post('/api/cv/classify', async (req, res) => {
  try {
    const { image, options = {} } = req.body;
    const result = await computerVision.classifyImage(image, options);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Image Classification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Video Analysis
app.post('/api/cv/analyze-video', async (req, res) => {
  try {
    const { video, options = {} } = req.body;
    const result = await computerVision.analyzeVideo(video, options);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Video Analysis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Análisis Inteligente Completo
app.post('/api/cv/intelligent-analysis', async (req, res) => {
  try {
    const { input, context = {} } = req.body;

    // Integrar con Sandra Nucleus para análisis inteligente
    const cvIntegration = new SandraComputerVisionIntegration(experts.sandraNucleus);
    const result = await cvIntegration.performIntelligentAnalysis(input, context);

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error Intelligent Analysis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Batch Processing
app.post('/api/cv/batch-process', async (req, res) => {
  try {
    const { images, operation, options = {} } = req.body;
    const result = await computerVision.processBatch(images, operation, options);
    res.json({ success: true, results: result });
  } catch (error) {
    console.error('Error Batch Processing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Computer Vision Status
app.get('/api/cv/status', (req, res) => {
  try {
    const status = computerVision.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('Error CV Status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Computer Vision Config Update
app.put('/api/cv/config', (req, res) => {
  try {
    const { config } = req.body;
    const updatedConfig = computerVision.updateConfig(config);
    res.json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error('Error CV Config Update:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════
// ENDPOINTS DE NEON DATABASE
// ══════════════════════════════════════════════════════

// Guardar análisis CV en Neon
app.post('/api/neon/save-analysis', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Crear/actualizar usuario
    await neonDB.createOrUpdateUser(sessionId, ipAddress, userAgent);

    // Guardar análisis
    const analysis = await neonDB.saveAnalysis(req.body);

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Error saving analysis to Neon:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener historial de análisis
app.get('/api/neon/analysis-history', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    const limit = parseInt(req.query.limit) || 50;

    const history = await neonDB.getAnalysisHistory(sessionId, limit);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error getting analysis history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener estadísticas del usuario
app.get('/api/neon/user-stats', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    const stats = await neonDB.getUserStats(sessionId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener estadísticas globales
app.get('/api/neon/global-stats', async (req, res) => {
  try {
    const stats = await neonDB.getGlobalStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting global stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener métricas
app.get('/api/neon/metrics/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const hours = parseInt(req.query.hours) || 24;
    const metrics = await neonDB.getMetrics(type, hours);
    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Guardar feedback
app.post('/api/neon/feedback', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    const { analysisId, rating, feedbackText, isAccurate } = req.body;

    const feedback = await neonDB.saveFeedback(analysisId, sessionId, rating, feedbackText, isAccurate);
    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener estadísticas de feedback
app.get('/api/neon/feedback-stats', async (req, res) => {
  try {
    const stats = await neonDB.getFeedbackStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener estadísticas diarias
app.get('/api/neon/daily-stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const stats = await neonDB.getDailyStats(days);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting daily stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Exportar datos
app.get('/api/neon/export', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const format = req.query.format || 'json';

    const data = await neonDB.exportData(sessionId, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sandra-cv-data.csv"');
      res.send(data);
    } else {
      res.json({ success: true, data });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Status de la base de datos
app.get('/api/neon/status', (req, res) => {
  try {
    const status = neonDB.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('Error getting Neon status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════
// MANEJO DE ERRORES
// ══════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: err.message
  });
});

// ══════════════════════════════════════════════════════
// INICIO DEL SERVIDOR
// ══════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     🧠 SANDRA PROFESSIONAL - BACKEND ACTIVO          ║
║                                                       ║
║     Empresa: GuestsValencia                          ║
║     CEO: Claytis Miguel Tom Zuaznabar                ║
║                                                       ║
║     Puerto: ${PORT}                                  ║
║     Status: ✅ Todas las SDKs Oficiales Integradas   ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
  
  console.log('\n🔗 SERVICIOS INTEGRADOS:');
  console.log('├─ IA:');
  console.log('│  ├─ Claude Sonnet 4.5 (Anthropic)');
  console.log('│  ├─ GPT-4o (OpenAI)');
  console.log('│  └─ Groq');
  console.log('├─ Voz:');
  console.log('│  ├─ ElevenLabs (TTS)');
  console.log('│  ├─ Deepgram (STT)');
  console.log('│  ├─ Cartesia (TTS)');
  console.log('│  └─ HeyGen (Video Avatar)');
  console.log('├─ Negocio:');
  console.log('│  ├─ Supabase (Database)');
  console.log('│  ├─ Airtable (Database)');
  console.log('│  └─ PayPal (Payments)');
  console.log('├─ Comunicación:');
  console.log('│  ├─ Twilio (SMS)');
  console.log('│  ├─ Twilio (WhatsApp)');
  console.log('│  └─ Meta (WhatsApp Business)');
  console.log('└─ Computer Vision:');
  console.log('   ├─ Object Detection (YOLO + COCO + Custom)');
  console.log('   ├─ Face Recognition (FaceNet + MediaPipe)');
  console.log('   ├─ OCR (Tesseract + PaddleOCR + EasyOCR)');
  console.log('   ├─ Image Classification (MobileNet + ResNet + EfficientNet)');
  console.log('   └─ Video Analysis (Real-time)');
  
  console.log('\n📡 ENDPOINTS DISPONIBLES:');
  console.log('   GET  /health');
  console.log('   POST /api/claude');
  console.log('   POST /api/gpt');
  console.log('   POST /api/groq');
  console.log('   POST /api/voice/elevenlabs/speak');
  console.log('   POST /api/voice/deepgram/transcribe');
  console.log('   POST /api/voice/cartesia/speak');
  console.log('   POST /api/voice/heygen/generate');
  console.log('   GET  /api/voice/heygen/status/:videoId');
  console.log('   POST /api/supabase/query');
  console.log('   POST /api/supabase/insert');
  console.log('   POST /api/supabase/update');
  console.log('   GET  /api/airtable/:table/:recordId?');
  console.log('   POST /api/airtable/:table');
  console.log('   PATCH /api/airtable/:table/:recordId');
  console.log('   POST /api/paypal/create-order');
  console.log('   POST /api/paypal/capture-order/:orderId');
  console.log('   POST /api/sms/send');
  console.log('   POST /api/whatsapp/twilio/send');
  console.log('   POST /api/whatsapp/meta/send');
  console.log('   POST /api/cv/detect-objects');
  console.log('   POST /api/cv/recognize-faces');
  console.log('   POST /api/cv/ocr');
  console.log('   POST /api/cv/classify');
  console.log('   POST /api/cv/analyze-video');
  console.log('   POST /api/cv/intelligent-analysis');
  console.log('   POST /api/cv/batch-process');
  console.log('   GET  /api/cv/status');
  console.log('   PUT  /api/cv/config');
  console.log('   POST /api/neon/save-analysis');
  console.log('   GET  /api/neon/analysis-history');
  console.log('   GET  /api/neon/user-stats');
  console.log('   GET  /api/neon/global-stats');
  console.log('   GET  /api/neon/metrics/:type');
  console.log('   POST /api/neon/feedback');
  console.log('   GET  /api/neon/feedback-stats');
  console.log('   GET  /api/neon/daily-stats');
  console.log('   GET  /api/neon/export');
  console.log('   GET  /api/neon/status');

  console.log('\n✨ Sistema listo para producción\n');
});

module.exports = app;
