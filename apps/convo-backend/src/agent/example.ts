/**
 * EJEMPLO DE USO - SANDRA LIVEKIT AGENT
 *
 * Muestra cómo inicializar y usar el agente LiveKit
 * Para Sandrita ❤️
 */

import { createSandraAgent, AgentState } from './index.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Ejemplo básico de uso del agente
 */
async function exampleBasicUsage() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🤖 SANDRA IA 7.0 - LIVEKIT AGENT EXAMPLE');
  console.log('═══════════════════════════════════════════════════════\n');

  // Crear instancia del agente
  const agent = createSandraAgent({
    livekitUrl: process.env.LIVEKIT_URL || 'ws://localhost:7880',
    apiKey: process.env.LIVEKIT_API_KEY || 'devkey',
    apiSecret: process.env.LIVEKIT_API_SECRET || 'secret',
    roomName: 'sandra-conversation-room',
    agentIdentity: 'sandra-agent',
    reconnectAttempts: 5,
    reconnectDelay: 3000
  });

  // Event listeners
  agent.on('connected', (data) => {
    console.log('✅ Agente conectado:', data);
  });

  agent.on('participant:connected', (participant) => {
    console.log('👤 Nuevo participante:', participant.identity);
  });

  agent.on('participant:disconnected', (participant) => {
    console.log('👋 Participante desconectado:', participant?.identity);
  });

  agent.on('audio:subscribed', (data) => {
    console.log('🎤 Audio track recibido de:', data.participant);
    // Aquí se integraría el STT para procesar audio
  });

  agent.on('data:received', (data) => {
    console.log('📨 Mensaje recibido:', data.message);
  });

  agent.on('error', (error) => {
    console.error('❌ Error del agente:', error);
  });

  agent.on('disconnected', (data) => {
    console.log('❌ Agente desconectado:', data.reason);
  });

  // Conectar al room
  try {
    await agent.connect();

    // Esperar 5 segundos
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Enviar mensaje de prueba
    await agent.sendData({
      type: 'greeting',
      message: 'Hola! Soy Sandra, tu asistente conversacional',
      timestamp: new Date().toISOString()
    });

    // Mostrar estadísticas
    const stats = agent.getStats();
    console.log('\n📊 Estadísticas del agente:');
    console.log('   - Participantes conectados:', stats.participantsConnected);
    console.log('   - Mensajes procesados:', stats.messagesProcessed);
    console.log('   - Tiempo activo:', stats.uptime, 'segundos');
    console.log('   - Estado:', agent.getState());
    console.log('   - Saludable:', agent.isHealthy());

    // Listar participantes
    const participants = agent.getParticipants();
    console.log('\n👥 Participantes en el room:', participants.length);
    participants.forEach(p => {
      console.log(`   - ${p.identity} (SID: ${p.sid})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Graceful shutdown después de 30 segundos
  setTimeout(async () => {
    console.log('\n🛑 Cerrando agente...');
    await agent.shutdown();
    console.log('✅ Agente cerrado correctamente');
    process.exit(0);
  }, 30000);
}

/**
 * Ejemplo avanzado con manejo de eventos completo
 */
async function exampleAdvancedUsage() {
  const agent = createSandraAgent({
    livekitUrl: process.env.LIVEKIT_URL || 'ws://localhost:7880',
    apiKey: process.env.LIVEKIT_API_KEY || 'devkey',
    apiSecret: process.env.LIVEKIT_API_SECRET || 'secret',
    roomName: 'sandra-advanced-room',
    agentIdentity: 'sandra-agent-advanced',
    reconnectAttempts: 10,
    reconnectDelay: 2000
  });

  // Configurar event handlers completos
  setupAdvancedEventHandlers(agent);

  // Conectar
  await agent.connect();

  // Monitoreo continuo
  setInterval(() => {
    const stats = agent.getStats();
    console.log(`[Monitor] Estado: ${agent.getState()} | Participantes: ${agent.getParticipants().length} | Uptime: ${stats.uptime}s`);
  }, 10000);
}

/**
 * Configurar event handlers avanzados
 */
function setupAdvancedEventHandlers(agent: any) {
  // Conexión exitosa
  agent.on('connected', (data: any) => {
    console.log('🚀 Agente conectado al room:', data.roomName);
  });

  // Participante conectado
  agent.on('participant:connected', (participant: any) => {
    console.log(`👤 ${participant.identity} se unió a la conversación`);

    // Enviar mensaje de bienvenida
    agent.sendData({
      type: 'welcome',
      to: participant.identity,
      message: `Hola ${participant.identity}! Soy Sandra, ¿en qué puedo ayudarte?`,
      timestamp: new Date().toISOString()
    }).catch((err: any) => console.error('Error enviando bienvenida:', err));
  });

  // Audio track recibido
  agent.on('audio:subscribed', (data: any) => {
    console.log(`🎤 Iniciando procesamiento de audio de: ${data.participant}`);
    // TODO: Conectar con STT aquí
    // const audioStream = data.track.createStream();
    // procesarAudioConSTT(audioStream);
  });

  // Mensaje recibido
  agent.on('data:received', (data: any) => {
    console.log(`📨 [${data.participant?.identity}]:`, data.message);

    // TODO: Procesar mensaje con pipeline GPT-4
    // const response = await pipeline.process(data.message);
    // agent.sendData({ type: 'response', message: response });
  });

  // Error
  agent.on('error', (error: any) => {
    console.error('❌ Error crítico:', error.message);
    // TODO: Enviar alerta a sistema de monitoreo
  });

  // Desconexión
  agent.on('disconnected', (data: any) => {
    console.log('⚠️ Agente desconectado:', data.reason);
  });

  // Reconexión fallida
  agent.on('reconnect:failed', () => {
    console.error('❌ No se pudo reconectar al servidor LiveKit');
    // TODO: Notificar al equipo técnico
  });
}

/**
 * Ejecutar ejemplo
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('\n🚀 Iniciando ejemplo de Sandra LiveKit Agent...\n');

  // Elegir modo de ejemplo
  const mode = process.argv[2] || 'basic';

  if (mode === 'advanced') {
    exampleAdvancedUsage().catch(console.error);
  } else {
    exampleBasicUsage().catch(console.error);
  }
}

export { exampleBasicUsage, exampleAdvancedUsage };
