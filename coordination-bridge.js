/**
 * SANDRA IA GALAXY - COORDINATION BRIDGE v7.0
 * Sistema de Coordinación entre MCP Bridge (puerto 3000) y Backend Server (puerto 3001)
 * Implementa comunicación bidireccional y sincronización de estados
 */

const http = require('http');
const WebSocket = require('ws');
const EventEmitter = require('events');
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');
const { workflowOrchestrator } = require('./workflow-orchestrator');

// Integración con Multi-Agent Coordinator
let multiAgentCoordinator = null;
try {
  const { multiAgentCoordinator: coordinator } = require('./multi-agent-coordinator');
  multiAgentCoordinator = coordinator;
} catch (error) {
  logger.warn('[COORDINATION BRIDGE] Multi-Agent Coordinator not available:', error.message);
}

class CoordinationBridge extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_COORDINATION_BRIDGE";
    this.version = "7.0_GALAXY_ENTERPRISE";

    // Estado de coordinación
    this.coordinationState = {
      mcpBridge: {
        host: 'localhost',
        port: 3000,
        status: 'DISCONNECTED',
        lastPing: null,
        activeConnections: 0
      },
      backendServer: {
        host: 'localhost',
        port: 3001,
        status: 'DISCONNECTED',
        lastHealthCheck: null,
        mode: 'GALAXY_ENTERPRISE'
      },
      synchronization: {
        enabled: true,
        interval: 5000, // 5 segundos
        lastSync: null,
        syncErrors: 0
      },
      workflows: {
        active: new Map(),
        completed: new Map(),
        failed: new Map()
      }
    };

    // Canal de comunicación interno
    this.communicationChannel = new EventEmitter();

    this.initialize();
  }

  async initialize() {
    logger.info('[COORDINATION BRIDGE] Initializing Galaxy Enterprise coordination');

    try {
      // 1. Verificar conectividad con ambos servicios
      await this.verifyServiceConnectivity();

      // 2. Establecer canales de comunicación
      await this.establishCommunicationChannels();

      // 3. Configurar sincronización automática
      await this.setupAutoSynchronization();

      // 4. Integrar con Workflow Orchestrator
      await this.integrateWithOrchestrator();

      // 5. Integrar con Multi-Agent Coordinator
      await this.integrateWithMultiAgentCoordinator();

      // 6. Activar monitoreo de estado
      await this.activateStateMonitoring();

      logger.info('[COORDINATION BRIDGE] ✅ Galaxy Enterprise coordination ACTIVE');

      this.emit('coordination:ready', {
        bridge: this.name,
        version: this.version,
        services: this.coordinationState
      });

    } catch (error) {
      logger.error('[COORDINATION BRIDGE] Initialization failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // SERVICE CONNECTIVITY VERIFICATION
  // ============================================================================
  async verifyServiceConnectivity() {
    logger.info('[COORDINATION BRIDGE] Verifying service connectivity');

    // Verificar MCP Bridge (puerto 3000)
    try {
      const mcpHealth = await this.checkServiceHealth('localhost', 3000, '/health');
      this.coordinationState.mcpBridge.status = mcpHealth.status === 'active' ? 'CONNECTED' : 'DEGRADED';
      this.coordinationState.mcpBridge.lastPing = new Date();

      logger.info('[COORDINATION BRIDGE] ✅ MCP Bridge connected:', mcpHealth);
    } catch (error) {
      logger.warn('[COORDINATION BRIDGE] ⚠️ MCP Bridge not available:', error.message);
      this.coordinationState.mcpBridge.status = 'DISCONNECTED';
    }

    // Verificar Backend Server (puerto 3001)
    try {
      const backendHealth = await this.checkServiceHealth('localhost', 3001, '/health');
      this.coordinationState.backendServer.status = backendHealth.status === 'healthy' ? 'CONNECTED' : 'DEGRADED';
      this.coordinationState.backendServer.lastHealthCheck = new Date();
      this.coordinationState.backendServer.mode = backendHealth.mode || 'UNKNOWN';

      logger.info('[COORDINATION BRIDGE] ✅ Backend Server connected:', backendHealth);
    } catch (error) {
      logger.warn('[COORDINATION BRIDGE] ⚠️ Backend Server not available:', error.message);
      this.coordinationState.backendServer.status = 'DISCONNECTED';
    }
  }

  async checkServiceHealth(host, port, path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: host,
        port: port,
        path: path,
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const healthData = JSON.parse(data);
            resolve(healthData);
          } catch (error) {
            reject(new Error('Invalid health response format'));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Health check timeout')));
      req.setTimeout(5000);
      req.end();
    });
  }

  // ============================================================================
  // COMMUNICATION CHANNELS
  // ============================================================================
  async establishCommunicationChannels() {
    logger.info('[COORDINATION BRIDGE] Establishing communication channels');

    // Canal WebSocket con MCP Bridge
    if (this.coordinationState.mcpBridge.status === 'CONNECTED') {
      await this.setupMCPWebSocketChannel();
    }

    // Canal HTTP con Backend Server
    if (this.coordinationState.backendServer.status === 'CONNECTED') {
      await this.setupBackendHTTPChannel();
    }

    // Canal interno para coordinación
    this.setupInternalCommunicationChannel();
  }

  async setupMCPWebSocketChannel() {
    try {
      this.mcpWebSocket = new WebSocket(`ws://localhost:3000`);

      this.mcpWebSocket.on('open', () => {
        logger.info('[COORDINATION BRIDGE] ✅ WebSocket channel with MCP Bridge established');
        this.coordinationState.mcpBridge.status = 'CONNECTED';

        // Enviar identificación del bridge
        this.mcpWebSocket.send(JSON.stringify({
          type: 'bridge_identification',
          source: 'COORDINATION_BRIDGE',
          version: this.version,
          capabilities: ['workflow_coordination', 'state_synchronization']
        }));
      });

      this.mcpWebSocket.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMCPMessage(message);
        } catch (error) {
          logger.error('[COORDINATION BRIDGE] Invalid MCP message format:', error);
        }
      });

      this.mcpWebSocket.on('close', () => {
        logger.warn('[COORDINATION BRIDGE] ⚠️ MCP WebSocket channel closed');
        this.coordinationState.mcpBridge.status = 'DISCONNECTED';
        this.attemptMCPReconnection();
      });

      this.mcpWebSocket.on('error', (error) => {
        logger.error('[COORDINATION BRIDGE] MCP WebSocket error:', error);
        this.coordinationState.mcpBridge.status = 'ERROR';
      });

    } catch (error) {
      logger.error('[COORDINATION BRIDGE] Failed to setup MCP WebSocket channel:', error);
    }
  }

  async setupBackendHTTPChannel() {
    // Configurar cliente HTTP para comunicación con Backend Server
    this.backendClient = {
      host: 'localhost',
      port: 3001,

      async sendRequest(path, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
          const options = {
            hostname: this.host,
            port: this.port,
            path: path,
            method: method,
            headers: {
              'Content-Type': 'application/json',
              'X-Source': 'COORDINATION_BRIDGE',
              'X-Version': '7.0_GALAXY_ENTERPRISE'
            }
          };

          const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
              try {
                const parsedData = JSON.parse(responseData);
                resolve({ status: res.statusCode, data: parsedData });
              } catch (error) {
                resolve({ status: res.statusCode, data: responseData });
              }
            });
          });

          req.on('error', reject);

          if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
          }

          req.end();
        });
      }
    };

    logger.info('[COORDINATION BRIDGE] ✅ HTTP channel with Backend Server configured');
  }

  setupInternalCommunicationChannel() {
    // Canal interno para coordinación entre componentes
    this.communicationChannel.on('workflow:start', (workflow) => {
      this.handleWorkflowStart(workflow);
    });

    this.communicationChannel.on('workflow:complete', (workflow) => {
      this.handleWorkflowComplete(workflow);
    });

    this.communicationChannel.on('workflow:error', (workflow) => {
      this.handleWorkflowError(workflow);
    });

    this.communicationChannel.on('sync:request', (data) => {
      this.handleSyncRequest(data);
    });

    logger.info('[COORDINATION BRIDGE] ✅ Internal communication channel configured');
  }

  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================
  async handleMCPMessage(message) {
    logger.debug('[COORDINATION BRIDGE] Handling MCP message:', message.type);

    switch (message.type) {
      case 'dev_request':
        await this.handleDevRequest(message);
        break;

      case 'workflow_request':
        await this.handleWorkflowRequest(message);
        break;

      case 'status_update':
        await this.handleStatusUpdate(message);
        break;

      case 'expert_request':
        await this.handleExpertRequest(message);
        break;

      case 'multi_agent_request':
        await this.handleMultiAgentRequest(message);
        break;

      case 'multi_agent_coordination':
        await this.handleMultiAgentCoordination(message);
        break;

      default:
        logger.warn('[COORDINATION BRIDGE] Unknown MCP message type:', message.type);
    }
  }

  async handleDevRequest(message) {
    logger.info('[COORDINATION BRIDGE] Processing development request');

    try {
      // Enviar request al Backend Server para procesamiento
      const backendResponse = await this.backendClient.sendRequest(
        '/api/orchestrator/execute-agent',
        'POST',
        {
          agentName: 'sandra-dev-expert',
          params: message.params || {}
        }
      );

      // Enviar respuesta de vuelta a MCP Bridge
      if (this.mcpWebSocket && this.mcpWebSocket.readyState === WebSocket.OPEN) {
        this.mcpWebSocket.send(JSON.stringify({
          type: 'dev_response',
          requestId: message.requestId,
          success: backendResponse.status === 200,
          data: backendResponse.data,
          source: 'COORDINATION_BRIDGE'
        }));
      }

      // Actualizar métricas
      metrics.incrementOrchestratorSuccess();

    } catch (error) {
      logger.error('[COORDINATION BRIDGE] Dev request failed:', error);

      // Enviar error de vuelta a MCP Bridge
      if (this.mcpWebSocket && this.mcpWebSocket.readyState === WebSocket.OPEN) {
        this.mcpWebSocket.send(JSON.stringify({
          type: 'dev_response',
          requestId: message.requestId,
          success: false,
          error: error.message,
          source: 'COORDINATION_BRIDGE'
        }));
      }

      metrics.incrementOrchestratorFailure();
    }
  }

  async handleMultiAgentRequest(message) {
    logger.info('[COORDINATION BRIDGE] Processing multi-agent request');

    if (!multiAgentCoordinator) {
      this.sendErrorResponse(message.requestId, 'Multi-Agent Coordinator not available');
      return;
    }

    try {
      // Ejecutar coordinación multi-agente
      const result = await multiAgentCoordinator.coordinateMultiAgentTask(
        message.task || message.tasks,
        message.options || {}
      );

      // Enviar respuesta a MCP Bridge
      if (this.mcpWebSocket && this.mcpWebSocket.readyState === WebSocket.OPEN) {
        this.mcpWebSocket.send(JSON.stringify({
          type: 'multi_agent_response',
          requestId: message.requestId,
          success: true,
          result,
          source: 'COORDINATION_BRIDGE'
        }));
      }

      metrics.incrementOrchestratorSuccess();

    } catch (error) {
      logger.error('[COORDINATION BRIDGE] Multi-agent request failed:', error);
      this.sendErrorResponse(message.requestId, error.message, 'multi_agent_response');
      metrics.incrementOrchestratorFailure();
    }
  }

  async handleMultiAgentCoordination(message) {
    logger.info('[COORDINATION BRIDGE] Processing multi-agent coordination request');

    if (!multiAgentCoordinator) {
      this.sendErrorResponse(message.requestId, 'Multi-Agent Coordinator not available');
      return;
    }

    try {
      let result;

      switch (message.action) {
        case 'get_status':
          result = multiAgentCoordinator.getCoordinationStatus();
          break;

        case 'emergency_coordination':
          result = await multiAgentCoordinator.emergencyCoordination(message.situation);
          break;

        case 'optimize_performance':
          result = await multiAgentCoordinator.optimizePerformance();
          break;

        case 'execute_distributed_workflow':
          result = await multiAgentCoordinator.executeDistributedWorkflow(
            message.workflow,
            message.options || {}
          );
          break;

        default:
          throw new Error(`Unknown coordination action: ${message.action}`);
      }

      // Enviar respuesta a MCP Bridge
      if (this.mcpWebSocket && this.mcpWebSocket.readyState === WebSocket.OPEN) {
        this.mcpWebSocket.send(JSON.stringify({
          type: 'multi_agent_coordination_response',
          requestId: message.requestId,
          action: message.action,
          success: true,
          result,
          source: 'COORDINATION_BRIDGE'
        }));
      }

    } catch (error) {
      logger.error('[COORDINATION BRIDGE] Multi-agent coordination failed:', error);
      this.sendErrorResponse(message.requestId, error.message, 'multi_agent_coordination_response');
    }
  }

  sendErrorResponse(requestId, errorMessage, responseType = 'error_response') {
    if (this.mcpWebSocket && this.mcpWebSocket.readyState === WebSocket.OPEN) {
      this.mcpWebSocket.send(JSON.stringify({
        type: responseType,
        requestId,
        success: false,
        error: errorMessage,
        source: 'COORDINATION_BRIDGE'
      }));
    }
  }

  async handleWorkflowRequest(message) {
    logger.info('[COORDINATION BRIDGE] Processing workflow request');

    try {
      // Delegar al Workflow Orchestrator
      const workflowResult = await workflowOrchestrator.executeWorkflow(message.workflow);

      // Registrar workflow en estado de coordinación
      this.coordinationState.workflows.active.set(workflowResult.workflowId, {
        ...workflowResult,
        source: 'MCP_BRIDGE',
        requestId: message.requestId
      });

      // Enviar confirmación a MCP Bridge
      if (this.mcpWebSocket && this.mcpWebSocket.readyState === WebSocket.OPEN) {
        this.mcpWebSocket.send(JSON.stringify({
          type: 'workflow_response',
          requestId: message.requestId,
          workflowId: workflowResult.workflowId,
          success: true,
          status: workflowResult.status,
          source: 'COORDINATION_BRIDGE'
        }));
      }

    } catch (error) {
      logger.error('[COORDINATION BRIDGE] Workflow request failed:', error);

      if (this.mcpWebSocket && this.mcpWebSocket.readyState === WebSocket.OPEN) {
        this.mcpWebSocket.send(JSON.stringify({
          type: 'workflow_response',
          requestId: message.requestId,
          success: false,
          error: error.message,
          source: 'COORDINATION_BRIDGE'
        }));
      }
    }
  }

  // ============================================================================
  // AUTO SYNCHRONIZATION
  // ============================================================================
  async setupAutoSynchronization() {
    logger.info('[COORDINATION BRIDGE] Setting up auto-synchronization');

    if (this.coordinationState.synchronization.enabled) {
      this.syncInterval = setInterval(async () => {
        await this.performSynchronization();
      }, this.coordinationState.synchronization.interval);

      logger.info(`[COORDINATION BRIDGE] ✅ Auto-sync active (${this.coordinationState.synchronization.interval}ms)`);
    }
  }

  async performSynchronization() {
    try {
      logger.debug('[COORDINATION BRIDGE] Performing synchronization');

      // 1. Sincronizar estado de servicios
      await this.syncServiceStates();

      // 2. Sincronizar workflows activos
      await this.syncActiveWorkflows();

      // 3. Sincronizar métricas
      await this.syncMetrics();

      // 4. Verificar integridad del sistema
      await this.verifySystemIntegrity();

      this.coordinationState.synchronization.lastSync = new Date();
      this.coordinationState.synchronization.syncErrors = 0;

    } catch (error) {
      logger.error('[COORDINATION BRIDGE] Synchronization failed:', error);
      this.coordinationState.synchronization.syncErrors++;

      // Si hay muchos errores de sincronización, reiniciar coordinación
      if (this.coordinationState.synchronization.syncErrors > 5) {
        logger.warn('[COORDINATION BRIDGE] Too many sync errors, restarting coordination');
        await this.restartCoordination();
      }
    }
  }

  async syncServiceStates() {
    // Verificar estado actual de servicios
    await this.verifyServiceConnectivity();

    // Enviar estado al Workflow Orchestrator
    workflowOrchestrator.emit('coordination:state-update', {
      mcpBridge: this.coordinationState.mcpBridge,
      backendServer: this.coordinationState.backendServer,
      timestamp: new Date()
    });
  }

  async syncActiveWorkflows() {
    // Obtener workflows activos del orchestrator
    const orchestratorStatus = workflowOrchestrator.getOrchestrationStatus();

    // Sincronizar con estado local
    for (const [workflowId, workflow] of this.coordinationState.workflows.active) {
      if (!orchestratorStatus.workflows.active || workflow.status === 'COMPLETED') {
        // Mover workflow completado
        this.coordinationState.workflows.completed.set(workflowId, workflow);
        this.coordinationState.workflows.active.delete(workflowId);
      }
    }
  }

  async syncMetrics() {
    // Obtener métricas del Backend Server
    try {
      const metricsResponse = await this.backendClient.sendRequest('/metrics');

      if (metricsResponse.status === 200) {
        // Procesar y almacenar métricas para coordinación
        this.lastMetricsSync = {
          timestamp: new Date(),
          data: metricsResponse.data
        };
      }
    } catch (error) {
      logger.debug('[COORDINATION BRIDGE] Metrics sync failed:', error.message);
    }
  }

  // ============================================================================
  // INTEGRATION WITH WORKFLOW ORCHESTRATOR
  // ============================================================================
  async integrateWithOrchestrator() {
    logger.info('[COORDINATION BRIDGE] Integrating with Workflow Orchestrator');

    // Escuchar eventos del orchestrator
    workflowOrchestrator.on('workflow:start', (data) => {
      this.communicationChannel.emit('workflow:start', data);
    });

    workflowOrchestrator.on('workflow:complete', (data) => {
      this.communicationChannel.emit('workflow:complete', data);
    });

    workflowOrchestrator.on('workflow:error', (data) => {
      this.communicationChannel.emit('workflow:error', data);
    });

    workflowOrchestrator.on('metrics:update', (metrics) => {
      this.handleMetricsUpdate(metrics);
    });

    logger.info('[COORDINATION BRIDGE] ✅ Orchestrator integration active');
  }

  // ============================================================================
  // INTEGRATION WITH MULTI-AGENT COORDINATOR
  // ============================================================================
  async integrateWithMultiAgentCoordinator() {
    if (!multiAgentCoordinator) {
      logger.warn('[COORDINATION BRIDGE] Multi-Agent Coordinator not available for integration');
      return;
    }

    logger.info('[COORDINATION BRIDGE] Integrating with Multi-Agent Coordinator');

    // Escuchar eventos del multi-agent coordinator
    multiAgentCoordinator.on('coordinator:ready', (data) => {
      logger.info('[COORDINATION BRIDGE] Multi-Agent Coordinator ready:', data);
      this.coordinationState.multiAgentCoordinator = {
        status: 'CONNECTED',
        totalAgents: data.totalAgents,
        mode: data.mode,
        version: data.version
      };
    });

    multiAgentCoordinator.on('realtime:status', (status) => {
      // Enviar estado de agentes a MCP Bridge
      if (this.mcpWebSocket && this.mcpWebSocket.readyState === WebSocket.OPEN) {
        this.mcpWebSocket.send(JSON.stringify({
          type: 'multi_agent_status',
          status: status,
          source: 'COORDINATION_BRIDGE',
          timestamp: new Date().toISOString()
        }));
      }
    });

    multiAgentCoordinator.on('task:completed', (data) => {
      this.communicationChannel.emit('multi-agent:task-completed', data);

      // Notificar a servicios conectados
      this.broadcastMultiAgentEvent('task_completed', data);
    });

    multiAgentCoordinator.on('task:failed', (data) => {
      this.communicationChannel.emit('multi-agent:task-failed', data);

      // Notificar a servicios conectados
      this.broadcastMultiAgentEvent('task_failed', data);
    });

    // Configurar canal de comunicación bidireccional
    this.communicationChannel.on('multi-agent:execute', async (data) => {
      try {
        const result = await multiAgentCoordinator.coordinateMultiAgentTask(data.task, data.options);
        this.communicationChannel.emit('multi-agent:result', { requestId: data.requestId, result });
      } catch (error) {
        this.communicationChannel.emit('multi-agent:error', {
          requestId: data.requestId,
          error: error.message
        });
      }
    });

    logger.info('[COORDINATION BRIDGE] ✅ Multi-Agent Coordinator integration active');
  }

  async broadcastMultiAgentEvent(eventType, data) {
    // Enviar a MCP Bridge
    if (this.mcpWebSocket && this.mcpWebSocket.readyState === WebSocket.OPEN) {
      this.mcpWebSocket.send(JSON.stringify({
        type: `multi_agent_${eventType}`,
        data,
        source: 'COORDINATION_BRIDGE',
        timestamp: new Date().toISOString()
      }));
    }

    // Enviar a Backend Server
    try {
      await this.backendClient.sendRequest('/api/multi-agent/event', 'POST', {
        eventType,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.debug('[COORDINATION BRIDGE] Failed to notify backend of multi-agent event:', error.message);
    }
  }

  handleMetricsUpdate(metrics) {
    // Enviar métricas a MCP Bridge si está conectado
    if (this.mcpWebSocket && this.mcpWebSocket.readyState === WebSocket.OPEN) {
      this.mcpWebSocket.send(JSON.stringify({
        type: 'metrics_update',
        metrics: metrics,
        source: 'COORDINATION_BRIDGE',
        timestamp: new Date().toISOString()
      }));
    }
  }

  // ============================================================================
  // STATE MONITORING
  // ============================================================================
  async activateStateMonitoring() {
    logger.info('[COORDINATION BRIDGE] Activating state monitoring');

    this.stateMonitor = {
      active: true,
      checkInterval: 10000, // 10 segundos

      startMonitoring: () => {
        setInterval(() => {
          this.checkSystemHealth();
          this.monitorPerformance();
          this.detectAnomalies();
        }, this.stateMonitor.checkInterval);
      },

      checkSystemHealth: () => {
        const healthStatus = {
          timestamp: new Date().toISOString(),
          services: {
            mcpBridge: this.coordinationState.mcpBridge.status,
            backendServer: this.coordinationState.backendServer.status
          },
          coordination: {
            syncEnabled: this.coordinationState.synchronization.enabled,
            lastSync: this.coordinationState.synchronization.lastSync,
            syncErrors: this.coordinationState.synchronization.syncErrors
          },
          workflows: {
            active: this.coordinationState.workflows.active.size,
            completed: this.coordinationState.workflows.completed.size,
            failed: this.coordinationState.workflows.failed.size
          }
        };

        this.emit('health:status', healthStatus);
        return healthStatus;
      }
    };

    this.stateMonitor.startMonitoring();
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================
  getCoordinationStatus() {
    return {
      bridge: this.name,
      version: this.version,
      status: this.coordinationState,
      performance: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        lastSync: this.coordinationState.synchronization.lastSync
      },
      connections: {
        mcpBridge: this.coordinationState.mcpBridge.status,
        backendServer: this.coordinationState.backendServer.status,
        orchestrator: workflowOrchestrator ? 'CONNECTED' : 'DISCONNECTED',
        multiAgentCoordinator: multiAgentCoordinator ?
          (this.coordinationState.multiAgentCoordinator?.status || 'AVAILABLE') : 'NOT_AVAILABLE'
      },
      multiAgentInfo: this.coordinationState.multiAgentCoordinator || null
    };
  }

  async sendToMCP(message) {
    if (this.mcpWebSocket && this.mcpWebSocket.readyState === WebSocket.OPEN) {
      this.mcpWebSocket.send(JSON.stringify({
        ...message,
        source: 'COORDINATION_BRIDGE',
        timestamp: new Date().toISOString()
      }));
      return true;
    }
    return false;
  }

  async sendToBackend(path, method = 'GET', data = null) {
    if (this.backendClient) {
      return await this.backendClient.sendRequest(path, method, data);
    }
    throw new Error('Backend client not available');
  }

  // ============================================================================
  // ERROR HANDLING & RECOVERY
  // ============================================================================
  async attemptMCPReconnection() {
    logger.info('[COORDINATION BRIDGE] Attempting MCP reconnection');

    setTimeout(async () => {
      try {
        await this.setupMCPWebSocketChannel();
        logger.info('[COORDINATION BRIDGE] ✅ MCP reconnection successful');
      } catch (error) {
        logger.error('[COORDINATION BRIDGE] MCP reconnection failed:', error);
        this.attemptMCPReconnection(); // Retry recursively
      }
    }, 5000); // Wait 5 seconds before retry
  }

  async restartCoordination() {
    logger.warn('[COORDINATION BRIDGE] Restarting coordination system');

    try {
      // Limpiar intervalos existentes
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
      }

      // Cerrar conexiones
      if (this.mcpWebSocket) {
        this.mcpWebSocket.close();
      }

      // Reinicializar
      await this.initialize();

      logger.info('[COORDINATION BRIDGE] ✅ Coordination system restarted');
    } catch (error) {
      logger.error('[COORDINATION BRIDGE] Failed to restart coordination:', error);
    }
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const coordinationBridge = new CoordinationBridge();

module.exports = {
  CoordinationBridge,
  coordinationBridge
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[COORDINATION BRIDGE] Testing Galaxy Enterprise coordination...');

  coordinationBridge.on('coordination:ready', (data) => {
    console.log('[COORDINATION BRIDGE] ✅ Ready:', data);

    // Test de estado
    const status = coordinationBridge.getCoordinationStatus();
    console.log('[COORDINATION BRIDGE] Status:', JSON.stringify(status, null, 2));
  });

  coordinationBridge.on('health:status', (health) => {
    console.log('[COORDINATION BRIDGE] Health check:', health);
  });
}