const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
require('dotenv').config({ path: '../.env.pro' });

const NeonDB = require('../neon-db-adapter/neon-db');
const AIGateway = require('../llm-orchestrator/ai-gateway');
const BrightDataService = require('../services/bright-data-service');
const NegotiationService = require('../services/negotiation-service');
const PracticalExecutionFramework = require('../core/practical-execution-framework');
const SandraPromptOptimizer = require('../core/sandra-prompt-optimizer');
const RoleValidator = require('../testing/role-validator');

let mainWindow;

class SandraApp {
  constructor() {
    this.db = new NeonDB();
    this.ai = new AIGateway();
    this.brightData = new BrightDataService();
    this.negotiation = new NegotiationService();
    this.pef = new PracticalExecutionFramework();
    this.promptOptimizer = new SandraPromptOptimizer();
    this.roleValidator = new RoleValidator();
    this.sessionId = `session_${Date.now()}`;
  }

  init() {
    app.whenReady().then(() => this.createWindow());

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) this.createWindow();
    });

    this.setupIPCHandlers();
  }

  createWindow() {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
        enableRemoteModule: false,
        webSecurity: true,
        allowRunningInsecureContent: false,
        contentSecurityPolicy: "default-src 'self' 'unsafe-inline' 'unsafe-eval'"
      }
    });

    // Bloquear Service Workers
    mainWindow.webContents.session.on('will-download', (event, item) => {
      // Prevent downloads
    });

    // Cargar HTML local
    const rendererPath = path.join(__dirname, 'renderer', 'index.html');
    mainWindow.loadFile(rendererPath);
    
    console.log('✅ Sandra IA 8.0 ventana creada');
  }

  setupIPCHandlers() {
    // Búsqueda de alojamientos
    ipcMain.handle('search-accommodation', async (_, platform, url) => {
      try {
        return await this.brightData.extractAccommodationData(url, platform);
      } catch (error) {
        throw error;
      }
    });

    // Procesamiento de venta
    ipcMain.handle('process-accommodation-sale', async (_, data, userInfo) => {
      try {
        return await this.brightData.processSale(data, userInfo);
      } catch (error) {
        throw error;
      }
    });

    // Negociación
    ipcMain.handle('start-negotiation', async (_, accommodation, userInfo) => {
      try {
        return await this.negotiation.initiateNegotiation(accommodation, userInfo);
      } catch (error) {
        throw error;
      }
    });

    ipcMain.handle('handle-counter-offer', async (_, negotiationId, counterOffer) => {
      try {
        return await this.negotiation.handleCounterOffer(negotiationId, counterOffer);
      } catch (error) {
        throw error;
      }
    });

    ipcMain.handle('initiate-phone-call', async (_, phoneNumber, message) => {
      try {
        return await this.negotiation.initiatePhoneCall(phoneNumber, message);
      } catch (error) {
        throw error;
      }
    });

    ipcMain.handle('finalize-negotiation', async (_, negotiationId, finalPrice) => {
      try {
        return await this.negotiation.finalizeNegotiation(negotiationId, finalPrice);
      } catch (error) {
        throw error;
      }
    });

    // Chat con Sandra
    ipcMain.handle('send-message', async (_, message) => {
      try {
        await this.db.logMessage(this.sessionId, message, 'user');
        const response = await this.ai.generateResponse(message, 'groq');
        await this.db.logMessage(this.sessionId, response, 'sandra');
        return response;
      } catch (error) {
        throw error;
      }
    });

    // Ejecutar tarea con framework práctico
    ipcMain.handle('execute-task-practical', async (_, task, role, context) => {
      try {
        return await this.pef.executeTask(task, role, context);
      } catch (error) {
        throw error;
      }
    });

    // Optimizar prompt para rol
    ipcMain.handle('optimize-prompt', async (_, prompt, role) => {
      try {
        return this.promptOptimizer.optimizePromptForRole(prompt, role);
      } catch (error) {
        throw error;
      }
    });

    // Validar rol específico
    ipcMain.handle('validate-role', async (_, role, testTask) => {
      try {
        return await this.roleValidator.testRolePracticalExecution(role, testTask);
      } catch (error) {
        throw error;
      }
    });

    // Ejecutar validación completa
    ipcMain.handle('validate-all-roles', async () => {
      try {
        return await this.roleValidator.validateAll18Roles();
      } catch (error) {
        throw error;
      }
    });

    // Validar para producción turística
    ipcMain.handle('validate-tourism-production', async () => {
      try {
        return await this.roleValidator.validateForTourismProduction();
      } catch (error) {
        throw error;
      }
    });

    // Obtener estadísticas de validación
    ipcMain.handle('get-validation-stats', async () => {
      try {
        return this.roleValidator.getValidationStats();
      } catch (error) {
        throw error;
      }
    });

    // Obtener estadísticas de ejecución
    ipcMain.handle('get-execution-stats', async () => {
      try {
        return this.pef.getExecutionStats();
      } catch (error) {
        throw error;
      }
    });
  }
}

new SandraApp().init();

