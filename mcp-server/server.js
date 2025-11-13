/**
 * MCP Server - Modular Control Panel
 * Servidor backend para Sandra IA 8.0 Pro
 * Modo Offline - Sin dependencias externas
 */

const express = require('express');
const path = require('path');
require('dotenv').config({ path: '../.env.pro' });

const app = express();
const PORT = process.env.MCP_PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticación simple
app.use((req, res, next) => {
  const token = req.headers['mcp-secret'];
  if (token !== process.env.MCP_SECRET_KEY && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }
  next();
});

// ============================================
// RUTAS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mode: 'offline'
  });
});

// Status
app.get('/status', (req, res) => {
  res.json({
    application: 'Sandra IA 8.0 Pro',
    version: '8.0.0',
    environment: process.env.NODE_ENV || 'development',
    mode: 'offline',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Chat endpoint (offline)
app.post('/api/chat', (req, res) => {
  const { message, role = 'general' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  // Respuesta offline simulada
  const responses = {
    youtuber: `[YouTuber] Ese es un gran tema para contenido. Podríamos crear una serie sobre: ${message}`,
    community: `[Community Manager] Excelente idea para engajar a la comunidad: ${message}`,
    sales: `[Sales Negotiator] Para esta propuesta podríamos negociar: ${message}`,
    developer: `[Developer] Técnicamente podemos implementar: ${message}`,
    general: `[Sandra] Entendido tu mensaje: "${message}". ¿Cómo puedo ayudarte más?`
  };

  res.json({
    success: true,
    response: responses[role] || responses.general,
    role,
    timestamp: new Date().toISOString()
  });
});

// Validate role
app.post('/api/validate-role', (req, res) => {
  const { role } = req.body;
  const validRoles = [
    'youtuber', 'community', 'sales', 'developer',
    'analyst', 'strategist', 'content-creator',
    'social-media', 'influencer', 'negotiator',
    'researcher', 'designer', 'architect',
    'devops', 'security', 'manager', 'mentor', 'general'
  ];

  const isValid = validRoles.includes(role);

  res.json({
    role,
    isValid,
    message: isValid ? `Rol ${role} validado correctamente` : `Rol ${role} no es válido`,
    timestamp: new Date().toISOString()
  });
});

// System info
app.get('/api/system', (req, res) => {
  const { cpuUsage, uptime, memUsage } = getSystemInfo();

  res.json({
    cpu: cpuUsage,
    memory: memUsage,
    uptime,
    platform: process.platform,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

// Generate code (offline)
app.post('/api/generate-code', (req, res) => {
  const { task, language = 'javascript' } = req.body;

  if (!task) {
    return res.status(400).json({ error: 'Tarea requerida' });
  }

  // Código de ejemplo offline
  const sampleCode = `// Código generado para: ${task}
// Lenguaje: ${language}
// Timestamp: ${new Date().toISOString()}

function sandraAI() {
  console.log('🚀 Sandra IA 8.0 Pro');
  console.log('Tarea: ${task}');
  
  // Implementación aquí
  return {
    success: true,
    task: '${task}',
    status: 'ready for implementation'
  };
}

// Ejecutar
sandraAI();
`;

  res.json({
    success: true,
    code: sampleCode,
    language,
    task,
    timestamp: new Date().toISOString()
  });
});

// Negotiate price
app.post('/api/negotiate', (req, res) => {
  const { initialPrice, discount = 0.15 } = req.body;

  if (!initialPrice) {
    return res.status(400).json({ error: 'Precio inicial requerido' });
  }

  const finalPrice = initialPrice * (1 - discount);

  res.json({
    success: true,
    initialPrice,
    discount: `${(discount * 100).toFixed(0)}%`,
    finalPrice: finalPrice.toFixed(2),
    savings: (initialPrice - finalPrice).toFixed(2),
    message: 'Negociación completada exitosamente',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function getSystemInfo() {
  const uptime = Math.floor(process.uptime());
  const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  const cpuUsage = process.cpuUsage().user;

  return {
    cpuUsage: `${(cpuUsage / 1000000).toFixed(2)}ms`,
    uptime: `${Math.floor(uptime / 60)}m ${uptime % 60}s`,
    memUsage: `${memUsage}MB`
  };
}

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║          🚀 MCP SERVER - SANDRA IA 8.0        ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Servidor activo: http://localhost:${PORT}`);
  console.log(`📊 Modo: Offline (sin internet)`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏱️  Tiempo: ${new Date().toLocaleString('es-ES')}`);
  console.log('');
  console.log('Endpoints disponibles:');
  console.log(`  GET  /health              - Estado del servidor`);
  console.log(`  GET  /status              - Información del sistema`);
  console.log(`  POST /api/chat            - Chat interactivo`);
  console.log(`  POST /api/validate-role   - Validar roles`);
  console.log(`  GET  /api/system          - Info del sistema`);
  console.log(`  POST /api/generate-code   - Generar código`);
  console.log(`  POST /api/negotiate       - Negociar precios`);
  console.log('');
});

// Manejo de errores
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

module.exports = app;

