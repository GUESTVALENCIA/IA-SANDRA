/**
 * SANDRA IA GALAXY ENTERPRISE - WORKFLOW ORCHESTRATOR v7.0
 * Sistema de Orquestación Empresarial Avanzado con State Machine, BPMN y Saga Patterns
 * Integración completa con Multi-Agent Coordinator y Task Distributor Galaxy Enterprise
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

// Importar sistemas Galaxy Enterprise existentes
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');
const { performanceMonitorGalaxyEnterprise } = require('./performance-monitor-galaxy-enterprise');
const { TaskDistributorGalaxyEnterprise } = require('./task-distributor-galaxy-enterprise');
const { distributedTracingGalaxyEnterprise } = require('./distributed-tracing-galaxy-enterprise');

class WorkflowOrchestratorGalaxyEnterprise extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_WORKFLOW_ORCHESTRATOR_GALAXY";
    this.version = "7.0_GALAXY_ENTERPRISE";
    this.mode = "ADVANCED_PROCESS_ORCHESTRATION";
    this.status = "INITIALIZING";

    // ========================================================================
    // ADVANCED STATE MACHINE ENGINE
    // ========================================================================
    this.stateMachine = {
      // Estado actual de cada workflow
      workflowStates: new Map(),

      // Definiciones de estados permitidos
      stateDefinitions: {
        INITIALIZED: { transitions: ['VALIDATING', 'CANCELLED'] },
        VALIDATING: { transitions: ['PLANNING', 'FAILED', 'CANCELLED'] },
        PLANNING: { transitions: ['EXECUTING', 'FAILED', 'CANCELLED'] },
        EXECUTING: { transitions: ['COMPENSATING', 'COMPLETING', 'FAILED', 'PAUSED'] },
        PAUSED: { transitions: ['EXECUTING', 'CANCELLED', 'FAILED'] },
        COMPENSATING: { transitions: ['FAILED', 'CANCELLED'] },
        COMPLETING: { transitions: ['COMPLETED', 'FAILED'] },
        COMPLETED: { transitions: [] },
        FAILED: { transitions: ['COMPENSATING', 'CANCELLED'] },
        CANCELLED: { transitions: [] }
      },

      // Transición de estado con validación
      transition: async (workflowId, fromState, toState, context = {}) => {
        const currentState = this.stateMachine.workflowStates.get(workflowId);

        if (currentState !== fromState) {
          throw new Error(`Invalid state transition: workflow ${workflowId} is in ${currentState}, not ${fromState}`);
        }

        const allowedTransitions = this.stateMachine.stateDefinitions[fromState]?.transitions || [];
        if (!allowedTransitions.includes(toState)) {
          throw new Error(`Transition from ${fromState} to ${toState} not allowed for workflow ${workflowId}`);
        }

        // Ejecutar hooks de transición
        await this.executeTransitionHooks(workflowId, fromState, toState, context);

        // Actualizar estado
        this.stateMachine.workflowStates.set(workflowId, toState);

        // Registrar transición para auditoría
        await this.recordStateTransition(workflowId, fromState, toState, context);

        logger.info(`[STATE MACHINE] Workflow ${workflowId} transitioned: ${fromState} → ${toState}`);
        this.emit('state:transition', { workflowId, fromState, toState, context });

        return toState;
      },

      // Obtener estado actual
      getState: (workflowId) => {
        return this.stateMachine.workflowStates.get(workflowId) || 'UNKNOWN';
      },

      // Validar si una transición es posible
      canTransition: (workflowId, toState) => {
        const currentState = this.stateMachine.workflowStates.get(workflowId);
        if (!currentState) return false;

        const allowedTransitions = this.stateMachine.stateDefinitions[currentState]?.transitions || [];
        return allowedTransitions.includes(toState);
      }
    };

    // ========================================================================
    // BPMN WORKFLOW ENGINE
    // ========================================================================
    this.bpmnEngine = {
      // Procesos BPMN cargados
      processes: new Map(),

      // Instancias de proceso en ejecución
      instances: new Map(),

      // Elementos BPMN soportados
      elementTypes: {
        START_EVENT: 'startEvent',
        END_EVENT: 'endEvent',
        TASK: 'task',
        USER_TASK: 'userTask',
        SERVICE_TASK: 'serviceTask',
        GATEWAY_EXCLUSIVE: 'exclusiveGateway',
        GATEWAY_PARALLEL: 'parallelGateway',
        GATEWAY_INCLUSIVE: 'inclusiveGateway',
        GATEWAY_EVENT: 'eventBasedGateway',
        TIMER_EVENT: 'timerEvent',
        MESSAGE_EVENT: 'messageEvent',
        SIGNAL_EVENT: 'signalEvent',
        SUB_PROCESS: 'subProcess'
      },

      // Ejecutor de procesos BPMN
      executeProcess: async (processDefinition, input = {}) => {
        const instanceId = `proc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const processInstance = {
          id: instanceId,
          processId: processDefinition.id,
          status: 'RUNNING',
          variables: { ...input },
          tokens: new Map(),
          completedActivities: new Set(),
          startTime: Date.now(),
          currentActivities: new Set()
        };

        this.bpmnEngine.instances.set(instanceId, processInstance);

        try {
          // Inicializar con estado de máquina
          this.stateMachine.workflowStates.set(instanceId, 'INITIALIZED');
          await this.stateMachine.transition(instanceId, 'INITIALIZED', 'EXECUTING');

          // Encontrar start events y crear tokens iniciales
          const startEvents = processDefinition.elements.filter(e => e.type === 'startEvent');

          for (const startEvent of startEvents) {
            await this.createToken(instanceId, startEvent.id, processInstance.variables);
          }

          // Ejecutar el proceso
          await this.executeTokens(instanceId);

          return {
            instanceId,
            status: processInstance.status,
            variables: processInstance.variables,
            executionTime: Date.now() - processInstance.startTime
          };

        } catch (error) {
          logger.error(`[BPMN ENGINE] Process execution failed: ${instanceId}`, error);
          processInstance.status = 'FAILED';
          processInstance.error = error.message;

          await this.stateMachine.transition(instanceId, this.stateMachine.getState(instanceId), 'FAILED');
          throw error;
        }
      },

      // Crear token en una actividad
      createToken: async (instanceId, activityId, variables) => {
        const instance = this.bpmnEngine.instances.get(instanceId);
        if (!instance) throw new Error(`Process instance not found: ${instanceId}`);

        const tokenId = `token-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const token = {
          id: tokenId,
          instanceId,
          activityId,
          variables: { ...variables },
          createdAt: Date.now(),
          status: 'ACTIVE'
        };

        instance.tokens.set(tokenId, token);
        instance.currentActivities.add(activityId);

        logger.debug(`[BPMN ENGINE] Token created: ${tokenId} at ${activityId}`);
        return token;
      },

      // Ejecutar tokens activos
      executeTokens: async (instanceId) => {
        const instance = this.bpmnEngine.instances.get(instanceId);
        if (!instance) return;

        const activeTokens = Array.from(instance.tokens.values())
          .filter(token => token.status === 'ACTIVE');

        if (activeTokens.length === 0) {
          // No hay tokens activos, el proceso ha terminado
          instance.status = 'COMPLETED';
          await this.stateMachine.transition(instanceId, this.stateMachine.getState(instanceId), 'COMPLETED');
          this.emit('process:completed', { instanceId, instance });
          return;
        }

        // Ejecutar cada token activo
        for (const token of activeTokens) {
          await this.executeToken(token);
        }

        // Recursivamente ejecutar tokens hasta completar
        if (instance.status === 'RUNNING') {
          await this.executeTokens(instanceId);
        }
      },

      // Ejecutar un token específico
      executeToken: async (token) => {
        const instance = this.bpmnEngine.instances.get(token.instanceId);
        const process = this.bpmnEngine.processes.get(instance.processId);
        const activity = process.elements.find(e => e.id === token.activityId);

        if (!activity) {
          throw new Error(`Activity not found: ${token.activityId}`);
        }

        logger.debug(`[BPMN ENGINE] Executing ${activity.type}: ${activity.id}`);

        try {
          switch (activity.type) {
            case 'startEvent':
              await this.executeStartEvent(token, activity);
              break;
            case 'endEvent':
              await this.executeEndEvent(token, activity);
              break;
            case 'task':
            case 'serviceTask':
              await this.executeServiceTask(token, activity);
              break;
            case 'userTask':
              await this.executeUserTask(token, activity);
              break;
            case 'exclusiveGateway':
              await this.executeExclusiveGateway(token, activity);
              break;
            case 'parallelGateway':
              await this.executeParallelGateway(token, activity);
              break;
            case 'timerEvent':
              await this.executeTimerEvent(token, activity);
              break;
            case 'subProcess':
              await this.executeSubProcess(token, activity);
              break;
            default:
              logger.warn(`[BPMN ENGINE] Unsupported activity type: ${activity.type}`);
              await this.completeToken(token);
          }
        } catch (error) {
          logger.error(`[BPMN ENGINE] Token execution failed: ${token.id}`, error);
          token.status = 'FAILED';
          token.error = error.message;
          throw error;
        }
      },

      // Completar un token y crear tokens de salida
      completeToken: async (token, outputVariables = {}) => {
        const instance = this.bpmnEngine.instances.get(token.instanceId);
        const process = this.bpmnEngine.processes.get(instance.processId);
        const activity = process.elements.find(e => e.id === token.activityId);

        // Marcar token como completado
        token.status = 'COMPLETED';
        token.completedAt = Date.now();

        // Actualizar variables de instancia
        Object.assign(instance.variables, outputVariables);

        // Marcar actividad como completada
        instance.completedActivities.add(token.activityId);
        instance.currentActivities.delete(token.activityId);

        // Crear tokens en actividades de salida
        const outgoingFlows = process.flows.filter(f => f.from === token.activityId);

        for (const flow of outgoingFlows) {
          // Evaluar condición del flujo si existe
          if (flow.condition) {
            const conditionResult = await this.evaluateCondition(flow.condition, instance.variables);
            if (!conditionResult) continue;
          }

          await this.bpmnEngine.createToken(token.instanceId, flow.to, instance.variables);
        }

        logger.debug(`[BPMN ENGINE] Token completed: ${token.id}`);
      }
    };

    // ========================================================================
    // SAGA PATTERN IMPLEMENTATION
    // ========================================================================
    this.sagaEngine = {
      // Sagas activas
      activeSagas: new Map(),

      // Definiciones de saga
      sagaDefinitions: new Map(),

      // Ejecutar saga
      executeSaga: async (sagaDefinition, input = {}) => {
        const sagaId = `saga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const saga = {
          id: sagaId,
          definition: sagaDefinition,
          status: 'EXECUTING',
          steps: [],
          compensations: [],
          variables: { ...input },
          startTime: Date.now(),
          currentStep: 0
        };

        this.sagaEngine.activeSagas.set(sagaId, saga);

        try {
          // Inicializar con estado de máquina
          this.stateMachine.workflowStates.set(sagaId, 'INITIALIZED');
          await this.stateMachine.transition(sagaId, 'INITIALIZED', 'EXECUTING');

          // Ejecutar pasos secuencialmente
          for (let i = 0; i < sagaDefinition.steps.length; i++) {
            saga.currentStep = i;
            const step = sagaDefinition.steps[i];

            try {
              const stepResult = await this.executeSagaStep(sagaId, step, saga.variables);

              saga.steps.push({
                stepId: step.id,
                status: 'COMPLETED',
                result: stepResult,
                timestamp: Date.now()
              });

              // Actualizar variables
              if (stepResult && typeof stepResult === 'object') {
                Object.assign(saga.variables, stepResult);
              }

            } catch (stepError) {
              logger.error(`[SAGA ENGINE] Step failed: ${step.id}`, stepError);

              saga.steps.push({
                stepId: step.id,
                status: 'FAILED',
                error: stepError.message,
                timestamp: Date.now()
              });

              // Iniciar compensación
              await this.compensateSaga(sagaId);
              throw stepError;
            }
          }

          // Saga completada exitosamente
          saga.status = 'COMPLETED';
          await this.stateMachine.transition(sagaId, 'EXECUTING', 'COMPLETED');

          logger.info(`[SAGA ENGINE] Saga completed: ${sagaId}`);
          this.emit('saga:completed', { sagaId, saga });

          return {
            sagaId,
            status: saga.status,
            variables: saga.variables,
            executionTime: Date.now() - saga.startTime,
            stepsCompleted: saga.steps.length
          };

        } catch (error) {
          saga.status = 'FAILED';
          await this.stateMachine.transition(sagaId, this.stateMachine.getState(sagaId), 'FAILED');
          throw error;
        }
      },

      // Ejecutar paso individual de saga
      executeSagaStep: async (sagaId, step, variables) => {
        logger.debug(`[SAGA ENGINE] Executing step: ${step.id}`);

        const span = distributedTracingGalaxyEnterprise.startSpan(`saga-step-${step.id}`, {
          tags: { sagaId, stepId: step.id, stepType: step.type }
        });

        try {
          let result;

          switch (step.type) {
            case 'SERVICE_CALL':
              result = await this.executeServiceCall(step, variables);
              break;
            case 'AGENT_TASK':
              result = await this.executeAgentTask(step, variables);
              break;
            case 'DATABASE_OPERATION':
              result = await this.executeDatabaseOperation(step, variables);
              break;
            case 'HTTP_REQUEST':
              result = await this.executeHttpRequest(step, variables);
              break;
            case 'SCRIPT':
              result = await this.executeScript(step, variables);
              break;
            default:
              throw new Error(`Unsupported saga step type: ${step.type}`);
          }

          span.setTag('result', 'success');
          span.finish();

          return result;

        } catch (error) {
          span.setTag('result', 'error');
          span.setTag('error', error.message);
          span.finish();
          throw error;
        }
      },

      // Compensar saga (rollback)
      compensateSaga: async (sagaId) => {
        const saga = this.sagaEngine.activeSagas.get(sagaId);
        if (!saga) return;

        logger.info(`[SAGA ENGINE] Starting compensation for saga: ${sagaId}`);
        await this.stateMachine.transition(sagaId, this.stateMachine.getState(sagaId), 'COMPENSATING');

        // Ejecutar compensaciones en orden inverso
        const completedSteps = saga.steps.filter(s => s.status === 'COMPLETED').reverse();

        for (const completedStep of completedSteps) {
          const stepDefinition = saga.definition.steps.find(s => s.id === completedStep.stepId);

          if (stepDefinition.compensation) {
            try {
              const compensationResult = await this.executeCompensation(
                sagaId,
                stepDefinition.compensation,
                saga.variables
              );

              saga.compensations.push({
                stepId: completedStep.stepId,
                status: 'COMPENSATED',
                result: compensationResult,
                timestamp: Date.now()
              });

              logger.debug(`[SAGA ENGINE] Compensated step: ${completedStep.stepId}`);

            } catch (compensationError) {
              logger.error(`[SAGA ENGINE] Compensation failed for step: ${completedStep.stepId}`, compensationError);

              saga.compensations.push({
                stepId: completedStep.stepId,
                status: 'COMPENSATION_FAILED',
                error: compensationError.message,
                timestamp: Date.now()
              });
            }
          }
        }

        saga.status = 'COMPENSATED';
        logger.info(`[SAGA ENGINE] Saga compensated: ${sagaId}`);
        this.emit('saga:compensated', { sagaId, saga });
      }
    };

    // ========================================================================
    // EVENT CORRELATION ENGINE
    // ========================================================================
    this.eventCorrelation = {
      // Correlaciones activas
      activeCorrelations: new Map(),

      // Definiciones de correlación
      correlationDefinitions: new Map(),

      // Eventos pendientes de correlación
      pendingEvents: new Map(),

      // Registrar correlación
      registerCorrelation: (correlationId, definition) => {
        this.eventCorrelation.correlationDefinitions.set(correlationId, {
          id: correlationId,
          ...definition,
          registeredAt: Date.now()
        });

        logger.debug(`[EVENT CORRELATION] Registered correlation: ${correlationId}`);
      },

      // Procesar evento entrante
      processEvent: async (event) => {
        const eventId = event.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

        logger.debug(`[EVENT CORRELATION] Processing event: ${eventId} (${event.type})`);

        // Buscar correlaciones aplicables
        const applicableCorrelations = Array.from(this.eventCorrelation.correlationDefinitions.values())
          .filter(corr => this.matchesCorrelation(event, corr));

        for (const correlation of applicableCorrelations) {
          await this.eventCorrelation.processEventCorrelation(event, correlation);
        }

        // Si no se encontró correlación, almacenar evento
        if (applicableCorrelations.length === 0) {
          this.eventCorrelation.pendingEvents.set(eventId, {
            ...event,
            id: eventId,
            receivedAt: Date.now()
          });
        }
      },

      // Procesar correlación específica
      processEventCorrelation: async (event, correlation) => {
        const correlationKey = this.eventCorrelation.extractCorrelationKey(event, correlation.keyExtractor);

        let correlationInstance = this.eventCorrelation.activeCorrelations.get(correlationKey);

        if (!correlationInstance) {
          // Crear nueva instancia de correlación
          correlationInstance = {
            correlationKey,
            correlationId: correlation.id,
            events: [],
            status: 'ACTIVE',
            startTime: Date.now(),
            timeoutHandle: null
          };

          // Configurar timeout si está definido
          if (correlation.timeout) {
            correlationInstance.timeoutHandle = setTimeout(() => {
              this.eventCorrelation.handleCorrelationTimeout(correlationKey);
            }, correlation.timeout);
          }

          this.eventCorrelation.activeCorrelations.set(correlationKey, correlationInstance);
        }

        // Añadir evento a la correlación
        correlationInstance.events.push({
          ...event,
          receivedAt: Date.now()
        });

        // Verificar si la correlación está completa
        if (this.eventCorrelation.isCorrelationComplete(correlationInstance, correlation)) {
          await this.eventCorrelation.completeCorrelation(correlationInstance, correlation);
        }
      },

      // Completar correlación
      completeCorrelation: async (correlationInstance, correlation) => {
        logger.info(`[EVENT CORRELATION] Correlation completed: ${correlationInstance.correlationKey}`);

        // Cancelar timeout
        if (correlationInstance.timeoutHandle) {
          clearTimeout(correlationInstance.timeoutHandle);
        }

        correlationInstance.status = 'COMPLETED';
        correlationInstance.completedAt = Date.now();

        // Ejecutar acción de correlación
        if (correlation.action) {
          try {
            await this.executeCorrelationAction(correlationInstance, correlation.action);
          } catch (error) {
            logger.error(`[EVENT CORRELATION] Action execution failed: ${correlationInstance.correlationKey}`, error);
          }
        }

        // Emitir evento de correlación completada
        this.emit('correlation:completed', {
          correlationKey: correlationInstance.correlationKey,
          events: correlationInstance.events,
          duration: correlationInstance.completedAt - correlationInstance.startTime
        });

        // Limpiar correlación activa
        this.eventCorrelation.activeCorrelations.delete(correlationInstance.correlationKey);
      },

      // Métodos helper para correlaciones
      extractCorrelationKey: (event, keyExtractor) => {
        if (typeof keyExtractor === 'function') {
          return keyExtractor(event);
        }

        if (typeof keyExtractor === 'string') {
          return event[keyExtractor];
        }

        return event.id || event.correlationId || 'default';
      },

      isCorrelationComplete: (correlationInstance, correlation) => {
        if (correlation.completionCondition) {
          return correlation.completionCondition(correlationInstance.events);
        }

        // Default: correlation is complete when all expected event types are received
        if (correlation.eventTypes && correlation.eventTypes.length > 0) {
          const receivedTypes = new Set(correlationInstance.events.map(e => e.type));
          return correlation.eventTypes.every(type => receivedTypes.has(type));
        }

        return false;
      },

      handleCorrelationTimeout: (correlationKey) => {
        const correlationInstance = this.eventCorrelation.activeCorrelations.get(correlationKey);
        if (!correlationInstance) return;

        logger.warn(`[EVENT CORRELATION] Correlation timeout: ${correlationKey}`);

        correlationInstance.status = 'TIMEOUT';
        correlationInstance.timeoutAt = Date.now();

        this.emit('correlation:timeout', {
          correlationKey,
          events: correlationInstance.events,
          duration: correlationInstance.timeoutAt - correlationInstance.startTime
        });

        // Clean up
        this.eventCorrelation.activeCorrelations.delete(correlationKey);
      }
    };

    // ========================================================================
    // TIMER EVENTS ENGINE
    // ========================================================================
    this.timerEngine = {
      // Timers activos
      activeTimers: new Map(),

      // Scheduled jobs
      scheduledJobs: new Map(),

      // Crear timer
      createTimer: (timerId, timerConfig) => {
        const timer = {
          id: timerId,
          type: timerConfig.type, // 'timeout', 'interval', 'cron'
          config: timerConfig,
          status: 'ACTIVE',
          createdAt: Date.now(),
          triggerCount: 0,
          handle: null
        };

        switch (timerConfig.type) {
          case 'timeout':
            timer.handle = setTimeout(() => {
              this.triggerTimer(timerId);
            }, timerConfig.delay);
            break;

          case 'interval':
            timer.handle = setInterval(() => {
              this.triggerTimer(timerId);
            }, timerConfig.interval);
            break;

          case 'cron':
            // Implementación básica de cron (para casos simples)
            timer.handle = this.scheduleCronJob(timerId, timerConfig.expression);
            break;

          default:
            throw new Error(`Unsupported timer type: ${timerConfig.type}`);
        }

        this.timerEngine.activeTimers.set(timerId, timer);
        logger.debug(`[TIMER ENGINE] Timer created: ${timerId} (${timerConfig.type})`);

        return timer;
      },

      // Disparar timer
      triggerTimer: async (timerId) => {
        const timer = this.timerEngine.activeTimers.get(timerId);
        if (!timer) return;

        timer.triggerCount++;
        timer.lastTriggered = Date.now();

        logger.debug(`[TIMER ENGINE] Timer triggered: ${timerId} (${timer.triggerCount} times)`);

        // Ejecutar callback si está definido
        if (timer.config.callback) {
          try {
            await timer.config.callback(timer);
          } catch (error) {
            logger.error(`[TIMER ENGINE] Timer callback failed: ${timerId}`, error);
          }
        }

        // Emitir evento
        this.emit('timer:triggered', {
          timerId,
          triggerCount: timer.triggerCount,
          config: timer.config
        });

        // Limpiar timer si es de tipo timeout
        if (timer.type === 'timeout') {
          this.cancelTimer(timerId);
        }
      },

      // Cancelar timer
      cancelTimer: (timerId) => {
        const timer = this.timerEngine.activeTimers.get(timerId);
        if (!timer) return;

        if (timer.handle) {
          if (timer.type === 'timeout') {
            clearTimeout(timer.handle);
          } else if (timer.type === 'interval') {
            clearInterval(timer.handle);
          }
        }

        timer.status = 'CANCELLED';
        this.timerEngine.activeTimers.delete(timerId);

        logger.debug(`[TIMER ENGINE] Timer cancelled: ${timerId}`);
      }
    };

    // ========================================================================
    // HUMAN TASK MANAGEMENT
    // ========================================================================
    this.humanTaskManager = {
      // Tareas pendientes
      pendingTasks: new Map(),

      // Asignaciones de usuario
      userAssignments: new Map(),

      // Crear tarea humana
      createHumanTask: async (taskDefinition) => {
        const taskId = `ht-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const humanTask = {
          id: taskId,
          ...taskDefinition,
          status: 'PENDING',
          createdAt: Date.now(),
          assignedTo: null,
          completedAt: null,
          result: null
        };

        this.humanTaskManager.pendingTasks.set(taskId, humanTask);

        // Auto-asignar si hay usuario especificado
        if (taskDefinition.assignedUser) {
          await this.assignTask(taskId, taskDefinition.assignedUser);
        } else if (taskDefinition.candidateUsers && taskDefinition.candidateUsers.length > 0) {
          // Asignar al primer usuario disponible
          await this.assignTask(taskId, taskDefinition.candidateUsers[0]);
        }

        // Configurar SLA si está definido
        if (taskDefinition.sla) {
          this.timerEngine.createTimer(`task-sla-${taskId}`, {
            type: 'timeout',
            delay: taskDefinition.sla,
            callback: () => this.handleTaskSLAExpired(taskId)
          });
        }

        logger.info(`[HUMAN TASK] Task created: ${taskId}`);
        this.emit('human-task:created', { taskId, task: humanTask });

        return humanTask;
      },

      // Asignar tarea a usuario
      assignTask: async (taskId, userId) => {
        const task = this.humanTaskManager.pendingTasks.get(taskId);
        if (!task) throw new Error(`Task not found: ${taskId}`);

        if (task.status !== 'PENDING') {
          throw new Error(`Task ${taskId} cannot be assigned (status: ${task.status})`);
        }

        task.assignedTo = userId;
        task.status = 'ASSIGNED';
        task.assignedAt = Date.now();

        // Actualizar asignaciones de usuario
        if (!this.humanTaskManager.userAssignments.has(userId)) {
          this.humanTaskManager.userAssignments.set(userId, new Set());
        }
        this.humanTaskManager.userAssignments.get(userId).add(taskId);

        logger.info(`[HUMAN TASK] Task assigned: ${taskId} → ${userId}`);
        this.emit('human-task:assigned', { taskId, userId, task });
      },

      // Completar tarea
      completeTask: async (taskId, result, userId) => {
        const task = this.humanTaskManager.pendingTasks.get(taskId);
        if (!task) throw new Error(`Task not found: ${taskId}`);

        if (task.assignedTo !== userId) {
          throw new Error(`Task ${taskId} is not assigned to user ${userId}`);
        }

        task.status = 'COMPLETED';
        task.result = result;
        task.completedAt = Date.now();
        task.completedBy = userId;

        // Cancelar SLA timer si existe
        this.timerEngine.cancelTimer(`task-sla-${taskId}`);

        // Limpiar asignaciones
        const userTasks = this.humanTaskManager.userAssignments.get(userId);
        if (userTasks) {
          userTasks.delete(taskId);
        }

        logger.info(`[HUMAN TASK] Task completed: ${taskId} by ${userId}`);
        this.emit('human-task:completed', { taskId, result, userId, task });

        return task;
      }
    };

    this.initialize();
  }

  async initialize() {
    logger.info('[WORKFLOW ORCHESTRATOR GALAXY] Initializing Galaxy Enterprise Workflow System');

    try {
      // 1. Configurar integraciones Galaxy Enterprise
      await this.setupGalaxyEnterpriseIntegrations();

      // 2. Cargar definiciones de procesos
      await this.loadProcessDefinitions();

      // 3. Configurar correlaciones de eventos
      await this.setupEventCorrelations();

      // 4. Inicializar monitoring
      await this.initializeMonitoring();

      this.status = 'GALAXY_ENTERPRISE_ACTIVE';
      logger.info('[WORKFLOW ORCHESTRATOR GALAXY] ✅ Galaxy Enterprise Workflow System OPERATIONAL');

      this.emit('orchestrator:ready', {
        name: this.name,
        version: this.version,
        mode: this.mode,
        status: this.status
      });

    } catch (error) {
      logger.error('[WORKFLOW ORCHESTRATOR GALAXY] Initialization failed:', error);
      this.status = 'ERROR';
      throw error;
    }
  }

  async setupGalaxyEnterpriseIntegrations() {
    // Integración con Performance Monitor
    this.performanceMonitor = performanceMonitorGalaxyEnterprise;

    // Integración con Task Distributor
    this.taskDistributor = new TaskDistributorGalaxyEnterprise();
    await this.taskDistributor.initialize();

    // Configurar distributed tracing
    this.distributedTracing = distributedTracingGalaxyEnterprise;

    logger.info('[WORKFLOW ORCHESTRATOR GALAXY] ✅ Galaxy Enterprise integrations configured');
  }

  // ============================================================================
  // BPMN ELEMENT EXECUTORS
  // ============================================================================
  async executeStartEvent(token, activity) {
    logger.debug(`[BPMN] Executing start event: ${activity.id}`);

    // Los start events se completan inmediatamente
    await this.bpmnEngine.completeToken(token);
  }

  async executeEndEvent(token, activity) {
    logger.debug(`[BPMN] Executing end event: ${activity.id}`);

    const instance = this.bpmnEngine.instances.get(token.instanceId);

    // Marcar token como completado sin crear tokens de salida
    token.status = 'COMPLETED';
    token.completedAt = Date.now();

    instance.completedActivities.add(token.activityId);
    instance.currentActivities.delete(token.activityId);

    // Verificar si todos los tokens han llegado a end events
    const activeTokens = Array.from(instance.tokens.values())
      .filter(t => t.status === 'ACTIVE');

    if (activeTokens.length === 0) {
      instance.status = 'COMPLETED';
      await this.stateMachine.transition(token.instanceId, 'EXECUTING', 'COMPLETED');
    }
  }

  async executeServiceTask(token, activity) {
    logger.debug(`[BPMN] Executing service task: ${activity.id}`);

    const span = this.distributedTracing.startSpan(`service-task-${activity.id}`, {
      tags: {
        processInstance: token.instanceId,
        activityId: activity.id,
        activityType: activity.type
      }
    });

    try {
      let result = {};

      // Ejecutar según configuración de la tarea
      if (activity.implementation) {
        switch (activity.implementation.type) {
          case 'agent':
            result = await this.executeAgentServiceTask(activity, token.variables);
            break;
          case 'script':
            result = await this.executeScriptServiceTask(activity, token.variables);
            break;
          case 'http':
            result = await this.executeHttpServiceTask(activity, token.variables);
            break;
          case 'saga':
            result = await this.executeSagaServiceTask(activity, token.variables);
            break;
          default:
            throw new Error(`Unsupported service task implementation: ${activity.implementation.type}`);
        }
      }

      span.setTag('result', 'success');
      span.finish();

      await this.bpmnEngine.completeToken(token, result);

    } catch (error) {
      span.setTag('result', 'error');
      span.setTag('error', error.message);
      span.finish();
      throw error;
    }
  }

  async executeUserTask(token, activity) {
    logger.debug(`[BPMN] Executing user task: ${activity.id}`);

    // Crear tarea humana
    const humanTask = await this.humanTaskManager.createHumanTask({
      processInstanceId: token.instanceId,
      activityId: activity.id,
      name: activity.name || activity.id,
      description: activity.description,
      assignedUser: activity.assignedUser,
      candidateUsers: activity.candidateUsers,
      candidateGroups: activity.candidateGroups,
      sla: activity.sla,
      formData: activity.formData,
      variables: token.variables
    });

    // Pausar token hasta que se complete la tarea humana
    token.status = 'WAITING';

    // Escuchar completación de tarea humana
    const taskCompletionHandler = (data) => {
      if (data.task.processInstanceId === token.instanceId &&
          data.task.activityId === activity.id) {

        // Reactivar token
        token.status = 'ACTIVE';

        // Completar token con resultado de tarea humana
        this.bpmnEngine.completeToken(token, data.result);

        // Remover listener
        this.off('human-task:completed', taskCompletionHandler);
      }
    };

    this.on('human-task:completed', taskCompletionHandler);
  }

  async executeExclusiveGateway(token, activity) {
    logger.debug(`[BPMN] Executing exclusive gateway: ${activity.id}`);

    const instance = this.bpmnEngine.instances.get(token.instanceId);
    const process = this.bpmnEngine.processes.get(instance.processId);

    // Obtener flujos de salida
    const outgoingFlows = process.flows.filter(f => f.from === activity.id);

    // Evaluar condiciones y tomar el primer flujo que cumple
    for (const flow of outgoingFlows) {
      if (flow.condition) {
        const conditionResult = await this.evaluateCondition(flow.condition, instance.variables);
        if (conditionResult) {
          // Crear token solo en este flujo
          await this.bpmnEngine.createToken(token.instanceId, flow.to, instance.variables);
          break;
        }
      } else if (flow.default) {
        // Flujo por defecto
        await this.bpmnEngine.createToken(token.instanceId, flow.to, instance.variables);
        break;
      }
    }

    // Completar token actual sin crear tokens (ya se crearon específicamente)
    token.status = 'COMPLETED';
    token.completedAt = Date.now();
    instance.completedActivities.add(token.activityId);
    instance.currentActivities.delete(token.activityId);
  }

  async executeParallelGateway(token, activity) {
    logger.debug(`[BPMN] Executing parallel gateway: ${activity.id}`);

    const instance = this.bpmnEngine.instances.get(token.instanceId);
    const process = this.bpmnEngine.processes.get(instance.processId);

    // Verificar si es split o join
    const incomingFlows = process.flows.filter(f => f.to === activity.id);
    const outgoingFlows = process.flows.filter(f => f.from === activity.id);

    if (outgoingFlows.length > 1) {
      // Parallel split: crear tokens en todas las salidas
      for (const flow of outgoingFlows) {
        await this.bpmnEngine.createToken(token.instanceId, flow.to, instance.variables);
      }
    } else if (incomingFlows.length > 1) {
      // Parallel join: esperar a que lleguen todos los tokens
      const tokensAtGateway = Array.from(instance.tokens.values())
        .filter(t => t.activityId === activity.id && t.status === 'ACTIVE');

      if (tokensAtGateway.length === incomingFlows.length) {
        // Todos los tokens han llegado, crear token de salida
        if (outgoingFlows.length > 0) {
          await this.bpmnEngine.createToken(token.instanceId, outgoingFlows[0].to, instance.variables);
        }

        // Completar todos los tokens en el gateway
        for (const gatewayToken of tokensAtGateway) {
          gatewayToken.status = 'COMPLETED';
          gatewayToken.completedAt = Date.now();
        }
      } else {
        // Marcar token como esperando
        token.status = 'WAITING';
        return; // No completar aún
      }
    }

    // Completar token
    await this.bpmnEngine.completeToken(token);
  }

  async executeTimerEvent(token, activity) {
    logger.debug(`[BPMN] Executing timer event: ${activity.id}`);

    const timerId = `timer-${token.instanceId}-${activity.id}`;

    // Crear timer según configuración
    this.timerEngine.createTimer(timerId, {
      type: activity.timerType || 'timeout',
      delay: activity.delay || 5000,
      interval: activity.interval,
      expression: activity.cronExpression,
      callback: async () => {
        // Completar token cuando se dispare el timer
        await this.bpmnEngine.completeToken(token);
      }
    });

    // Marcar token como esperando
    token.status = 'WAITING';
  }

  async executeSubProcess(token, activity) {
    logger.debug(`[BPMN] Executing sub-process: ${activity.id}`);

    // Obtener definición del sub-proceso
    const subProcessDef = this.bpmnEngine.processes.get(activity.processRef);
    if (!subProcessDef) {
      throw new Error(`Sub-process definition not found: ${activity.processRef}`);
    }

    // Ejecutar sub-proceso
    const subProcessResult = await this.bpmnEngine.executeProcess(subProcessDef, token.variables);

    // Completar token con resultado del sub-proceso
    await this.bpmnEngine.completeToken(token, subProcessResult.variables);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  async evaluateCondition(condition, variables) {
    try {
      // Implementación básica de evaluación de condiciones
      // En producción, usar un parser de expresiones más robusto
      const func = new Function('variables', `with(variables) { return ${condition}; }`);
      return func(variables);
    } catch (error) {
      logger.warn(`[WORKFLOW ORCHESTRATOR] Condition evaluation failed: ${condition}`, error);
      return false;
    }
  }

  async recordStateTransition(workflowId, fromState, toState, context) {
    // Registrar transición para auditoría
    const transition = {
      workflowId,
      fromState,
      toState,
      context,
      timestamp: Date.now(),
      user: context.user || 'system'
    };

    // Enviar a sistema de auditoría
    this.emit('audit:state-transition', transition);

    // Registrar métricas
    if (this.performanceMonitor) {
      this.performanceMonitor.recordWorkflowStateTransition(workflowId, fromState, toState);
    }
  }

  async executeTransitionHooks(workflowId, fromState, toState, context) {
    // Ejecutar hooks de transición si están definidos
    const hookName = `transition_${fromState}_to_${toState}`;

    this.emit(`hook:${hookName}`, { workflowId, fromState, toState, context });
  }

  async loadProcessDefinitions() {
    // Cargar definiciones de procesos desde archivos o base de datos
    logger.info('[WORKFLOW ORCHESTRATOR GALAXY] Loading process definitions');

    // Proceso ejemplo para Sandra IA
    const sandraProcessDef = {
      id: 'sandra-user-request-process',
      name: 'Sandra IA User Request Process',
      version: '1.0',
      elements: [
        {
          id: 'start',
          type: 'startEvent',
          name: 'User Request Received'
        },
        {
          id: 'analyze-request',
          type: 'serviceTask',
          name: 'Analyze Request',
          implementation: {
            type: 'agent',
            agentType: 'business-analyst',
            timeout: 30000
          }
        },
        {
          id: 'gateway-complexity',
          type: 'exclusiveGateway',
          name: 'Complexity Check'
        },
        {
          id: 'simple-response',
          type: 'serviceTask',
          name: 'Generate Simple Response',
          implementation: {
            type: 'agent',
            agentType: 'response-generator'
          }
        },
        {
          id: 'complex-processing',
          type: 'serviceTask',
          name: 'Complex Processing',
          implementation: {
            type: 'saga',
            sagaRef: 'complex-request-saga'
          }
        },
        {
          id: 'end',
          type: 'endEvent',
          name: 'Response Delivered'
        }
      ],
      flows: [
        { from: 'start', to: 'analyze-request' },
        { from: 'analyze-request', to: 'gateway-complexity' },
        { from: 'gateway-complexity', to: 'simple-response', condition: 'complexity === "SIMPLE"' },
        { from: 'gateway-complexity', to: 'complex-processing', condition: 'complexity === "COMPLEX"' },
        { from: 'simple-response', to: 'end' },
        { from: 'complex-processing', to: 'end' }
      ]
    };

    this.bpmnEngine.processes.set(sandraProcessDef.id, sandraProcessDef);

    logger.info(`[WORKFLOW ORCHESTRATOR GALAXY] ✅ Loaded ${this.bpmnEngine.processes.size} process definitions`);
  }

  async setupEventCorrelations() {
    // Configurar correlaciones de eventos estándar
    this.eventCorrelation.registerCorrelation('user-session', {
      eventTypes: ['user-login', 'user-request', 'user-logout'],
      keyExtractor: (event) => event.userId,
      timeout: 3600000, // 1 hora
      completionCondition: (events) => {
        return events.some(e => e.type === 'user-logout') ||
               events.filter(e => e.type === 'user-request').length >= 10;
      },
      action: {
        type: 'process',
        processId: 'user-session-analysis'
      }
    });

    logger.info('[WORKFLOW ORCHESTRATOR GALAXY] ✅ Event correlations configured');
  }

  async initializeMonitoring() {
    // Configurar métricas de monitoreo
    setInterval(() => {
      const metrics = this.getSystemMetrics();
      this.emit('metrics:update', metrics);

      if (this.performanceMonitor) {
        this.performanceMonitor.recordWorkflowMetrics(metrics);
      }
    }, 5000);

    logger.info('[WORKFLOW ORCHESTRATOR GALAXY] ✅ Monitoring initialized');
  }

  getSystemMetrics() {
    return {
      timestamp: Date.now(),
      workflows: {
        active: this.bpmnEngine.instances.size,
        running: Array.from(this.bpmnEngine.instances.values()).filter(i => i.status === 'RUNNING').length,
        completed: Array.from(this.bpmnEngine.instances.values()).filter(i => i.status === 'COMPLETED').length,
        failed: Array.from(this.bpmnEngine.instances.values()).filter(i => i.status === 'FAILED').length
      },
      sagas: {
        active: this.sagaEngine.activeSagas.size,
        executing: Array.from(this.sagaEngine.activeSagas.values()).filter(s => s.status === 'EXECUTING').length,
        compensating: Array.from(this.sagaEngine.activeSagas.values()).filter(s => s.status === 'COMPENSATING').length
      },
      timers: {
        active: this.timerEngine.activeTimers.size
      },
      humanTasks: {
        pending: Array.from(this.humanTaskManager.pendingTasks.values()).filter(t => t.status === 'PENDING').length,
        assigned: Array.from(this.humanTaskManager.pendingTasks.values()).filter(t => t.status === 'ASSIGNED').length
      },
      events: {
        correlations: this.eventCorrelation.activeCorrelations.size,
        pending: this.eventCorrelation.pendingEvents.size
      }
    };
  }

  // ============================================================================
  // API METHODS
  // ============================================================================
  async executeWorkflow(processId, input = {}) {
    const processDef = this.bpmnEngine.processes.get(processId);
    if (!processDef) {
      throw new Error(`Process definition not found: ${processId}`);
    }

    return await this.bpmnEngine.executeProcess(processDef, input);
  }

  async executeSaga(sagaId, input = {}) {
    const sagaDef = this.sagaEngine.sagaDefinitions.get(sagaId);
    if (!sagaDef) {
      throw new Error(`Saga definition not found: ${sagaId}`);
    }

    return await this.sagaEngine.executeSaga(sagaDef, input);
  }

  getWorkflowStatus(instanceId) {
    const instance = this.bpmnEngine.instances.get(instanceId);
    if (!instance) return null;

    return {
      instanceId,
      processId: instance.processId,
      status: instance.status,
      state: this.stateMachine.getState(instanceId),
      variables: instance.variables,
      currentActivities: Array.from(instance.currentActivities),
      completedActivities: Array.from(instance.completedActivities),
      startTime: instance.startTime,
      duration: instance.endTime ? (instance.endTime - instance.startTime) : (Date.now() - instance.startTime)
    };
  }

  async cancelWorkflow(instanceId, reason = 'User cancellation') {
    const instance = this.bpmnEngine.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance not found: ${instanceId}`);
    }

    // Cancelar todos los timers asociados
    Array.from(this.timerEngine.activeTimers.keys())
      .filter(timerId => timerId.includes(instanceId))
      .forEach(timerId => this.timerEngine.cancelTimer(timerId));

    // Transicionar a estado cancelado
    await this.stateMachine.transition(instanceId, this.stateMachine.getState(instanceId), 'CANCELLED');

    instance.status = 'CANCELLED';
    instance.cancellationReason = reason;
    instance.endTime = Date.now();

    logger.info(`[WORKFLOW ORCHESTRATOR GALAXY] Workflow cancelled: ${instanceId} - ${reason}`);
    this.emit('workflow:cancelled', { instanceId, reason });

    return instance;
  }

  // ============================================================================
  // UTILITY METHODS FOR EVENT CORRELATION
  // ============================================================================
  matchesCorrelation(event, correlation) {
    if (!correlation.eventTypes || !correlation.eventTypes.includes(event.type)) {
      return false;
    }

    // Additional matching criteria can be added here
    return true;
  }

  extractCorrelationKey(event, keyExtractor) {
    if (typeof keyExtractor === 'function') {
      return keyExtractor(event);
    }

    if (typeof keyExtractor === 'string') {
      return event[keyExtractor];
    }

    return event.id || event.correlationId || 'default';
  }

  isCorrelationComplete(correlationInstance, correlation) {
    if (correlation.completionCondition) {
      return correlation.completionCondition(correlationInstance.events);
    }

    // Default: correlation is complete when all expected event types are received
    if (correlation.eventTypes && correlation.eventTypes.length > 0) {
      const receivedTypes = new Set(correlationInstance.events.map(e => e.type));
      return correlation.eventTypes.every(type => receivedTypes.has(type));
    }

    return false;
  }

  async executeCorrelationAction(correlationInstance, action) {
    logger.debug(`[EVENT CORRELATION] Executing action for correlation: ${correlationInstance.correlationKey}`);

    switch (action.type) {
      case 'process':
        // Start a new workflow process
        if (action.processId) {
          await this.executeWorkflow(action.processId, {
            correlationKey: correlationInstance.correlationKey,
            events: correlationInstance.events
          });
        }
        break;

      case 'saga':
        // Start a saga
        if (action.sagaId) {
          await this.executeSaga(action.sagaId, {
            correlationKey: correlationInstance.correlationKey,
            events: correlationInstance.events
          });
        }
        break;

      case 'callback':
        // Execute callback function
        if (action.callback && typeof action.callback === 'function') {
          await action.callback(correlationInstance);
        }
        break;

      default:
        logger.warn(`[EVENT CORRELATION] Unsupported action type: ${action.type}`);
    }
  }

  handleCorrelationTimeout(correlationKey) {
    const correlationInstance = this.eventCorrelation.activeCorrelations.get(correlationKey);
    if (!correlationInstance) return;

    logger.warn(`[EVENT CORRELATION] Correlation timeout: ${correlationKey}`);

    correlationInstance.status = 'TIMEOUT';
    correlationInstance.timeoutAt = Date.now();

    this.emit('correlation:timeout', {
      correlationKey,
      events: correlationInstance.events,
      duration: correlationInstance.timeoutAt - correlationInstance.startTime
    });

    // Clean up
    this.eventCorrelation.activeCorrelations.delete(correlationKey);
  }

  scheduleCronJob(timerId, cronExpression) {
    // Basic cron implementation - in production, use a proper cron library
    logger.warn(`[TIMER ENGINE] Basic cron implementation for: ${cronExpression}`);

    // For now, simulate with a simple interval
    return setInterval(() => {
      this.timerEngine.triggerTimer(timerId);
    }, 60000); // 1 minute interval
  }

  handleTaskSLAExpired(taskId) {
    const task = this.humanTaskManager.pendingTasks.get(taskId);
    if (!task) return;

    logger.warn(`[HUMAN TASK] SLA expired for task: ${taskId}`);

    task.status = 'SLA_EXPIRED';
    task.slaExpiredAt = Date.now();

    this.emit('human-task:sla-expired', { taskId, task });

    // Trigger escalation if configured
    if (task.escalation) {
      this.handleTaskEscalation(taskId, 'SLA_EXPIRED');
    }
  }

  handleTaskEscalation(taskId, reason) {
    logger.info(`[HUMAN TASK] Escalating task: ${taskId} - ${reason}`);

    const task = this.humanTaskManager.pendingTasks.get(taskId);
    if (!task) return;

    // Basic escalation logic
    task.escalated = true;
    task.escalationReason = reason;
    task.escalatedAt = Date.now();

    this.emit('human-task:escalated', { taskId, reason, task });
  }

  // ============================================================================
  // SERVICE TASK EXECUTORS
  // ============================================================================
  async executeAgentServiceTask(activity, variables) {
    logger.debug(`[SERVICE TASK] Executing agent task: ${activity.implementation.agentType}`);

    if (this.taskDistributor) {
      const task = {
        id: `agent-task-${Date.now()}`,
        category: activity.implementation.agentType,
        type: activity.implementation.action || 'execute',
        parameters: variables,
        timeout: activity.implementation.timeout || 30000
      };

      return await this.taskDistributor.distributeTask(task);
    } else {
      // Fallback: simulate agent execution
      return {
        success: true,
        result: `Agent ${activity.implementation.agentType} executed successfully`,
        timestamp: Date.now()
      };
    }
  }

  async executeScriptServiceTask(activity, variables) {
    logger.debug(`[SERVICE TASK] Executing script: ${activity.implementation.script}`);

    try {
      // Basic script execution - in production, use a sandboxed environment
      const func = new Function('variables', activity.implementation.script);
      const result = func(variables);

      return {
        success: true,
        result,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Script execution failed: ${error.message}`);
    }
  }

  async executeHttpServiceTask(activity, variables) {
    logger.debug(`[SERVICE TASK] Executing HTTP request: ${activity.implementation.url}`);

    // Simulate HTTP request - in production, use actual HTTP client
    return {
      success: true,
      statusCode: 200,
      response: `HTTP request to ${activity.implementation.url} completed`,
      timestamp: Date.now()
    };
  }

  async executeSagaServiceTask(activity, variables) {
    logger.debug(`[SERVICE TASK] Executing saga: ${activity.implementation.sagaRef}`);

    const sagaDef = this.sagaEngine.sagaDefinitions.get(activity.implementation.sagaRef);
    if (!sagaDef) {
      throw new Error(`Saga definition not found: ${activity.implementation.sagaRef}`);
    }

    return await this.sagaEngine.executeSaga(sagaDef, variables);
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const workflowOrchestratorGalaxyEnterprise = new WorkflowOrchestratorGalaxyEnterprise();

module.exports = {
  WorkflowOrchestratorGalaxyEnterprise,
  workflowOrchestratorGalaxyEnterprise
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[WORKFLOW ORCHESTRATOR GALAXY] Testing Galaxy Enterprise Workflow System...');

  workflowOrchestratorGalaxyEnterprise.on('orchestrator:ready', async (data) => {
    console.log('[WORKFLOW ORCHESTRATOR GALAXY] ✅ Ready:', data);

    // Test BPMN workflow
    try {
      const result = await workflowOrchestratorGalaxyEnterprise.executeWorkflow('sandra-user-request-process', {
        userId: 'test-user',
        request: 'Test user request',
        complexity: 'SIMPLE'
      });

      console.log('[WORKFLOW ORCHESTRATOR GALAXY] ✅ Test workflow completed:', result);
    } catch (error) {
      console.error('[WORKFLOW ORCHESTRATOR GALAXY] ❌ Test workflow failed:', error);
    }
  });
}