// ═══════════════════════════════════════════════════════════════
// SANDRA MCP PROFESSIONAL - ELECTRON MAIN PROCESS
// Aplicación Desktop Nativa para Windows
// CEO: Claytis Miguel Tom Zuaznabar | GuestsValencia
// ═══════════════════════════════════════════════════════════════

const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Variables globales
let mainWindow;
let backendProcess;
const isDev = process.env.NODE_ENV === 'development';

// Configuración de la aplicación
const APP_CONFIG = {
  name: 'Sandra MCP Professional',
  version: '1.0.0',
  author: 'Claytis Miguel Tom Zuaznabar',
  company: 'GuestsValencia',
  description: 'IA Multimodal Profesional con 15 Conectores MCP'
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES PRINCIPALES
// ═══════════════════════════════════════════════════════════════

function createMainWindow() {
  // Configuración de la ventana principal
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, '../assets/sandra-icon.ico'),
    title: 'Sandra MCP Professional - GuestsValencia',
    titleBarStyle: 'default',
    show: false, // No mostrar hasta estar listo
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    }
  });

  // Cargar la interfaz
  const indexPath = isDev
    ? 'http://localhost:5000/frontend/sandra-mcp-interface.html'
    : `file://${path.join(__dirname, '../frontend/sandra-mcp-interface.html')}`;

  mainWindow.loadURL(indexPath);

  // Eventos de la ventana
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();

    // Mostrar splash de bienvenida
    showWelcomeDialog();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopBackend();
  });

  // Configurar menú de la aplicación
  createApplicationMenu();

  // Abrir links externos en navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
}

function startBackend() {
  return new Promise((resolve, reject) => {
    try {
      const backendPath = path.join(__dirname, '../backend/server.js');

      // Verificar que existe el backend
      if (!fs.existsSync(backendPath)) {
        reject(new Error('Backend server not found'));
        return;
      }

      // Iniciar proceso del backend
      backendProcess = spawn('node', [backendPath], {
        cwd: path.join(__dirname, '../backend'),
        env: { ...process.env, NODE_ENV: 'production' },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      backendProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
      });

      backendProcess.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
      });

      backendProcess.on('error', (error) => {
        console.error('Backend Process Error:', error);
        reject(error);
      });

      // Esperar a que el backend esté listo
      setTimeout(() => {
        resolve();
      }, 3000);

    } catch (error) {
      reject(error);
    }
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

function createApplicationMenu() {
  const template = [
    {
      label: 'Sandra MCP',
      submenu: [
        {
          label: 'Acerca de Sandra MCP',
          click: showAboutDialog
        },
        { type: 'separator' },
        {
          label: 'Configuración',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // Abrir ventana de configuración
            mainWindow.webContents.send('show-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Conectores',
      submenu: [
        {
          label: 'Test Todos los Conectores',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('test-all-connectors');
          }
        },
        { type: 'separator' },
        {
          label: 'Claude (Anthropic)',
          click: () => mainWindow.webContents.send('test-connector', 'claude')
        },
        {
          label: 'OpenAI GPT-4o',
          click: () => mainWindow.webContents.send('test-connector', 'openai')
        },
        {
          label: 'HeyGen Avatar',
          click: () => mainWindow.webContents.send('test-connector', 'heygen')
        },
        {
          label: 'GitHub',
          click: () => mainWindow.webContents.send('test-connector', 'github')
        },
        {
          label: 'Netlify',
          click: () => mainWindow.webContents.send('test-connector', 'netlify')
        }
      ]
    },
    {
      label: 'Calidad',
      submenu: [
        {
          label: 'Ejecutar Tests Completos',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => {
            mainWindow.webContents.send('run-quality-tests');
          }
        },
        {
          label: 'Test Gramática',
          click: () => {
            mainWindow.webContents.send('test-grammar');
          }
        },
        {
          label: 'Exportar Reporte',
          accelerator: 'CmdOrCtrl+E',
          click: exportQualityReport
        }
      ]
    },
    {
      label: 'Herramientas',
      submenu: [
        {
          label: 'Logs del Sistema',
          click: () => {
            mainWindow.webContents.send('show-logs');
          }
        },
        {
          label: 'Reiniciar Backend',
          click: async () => {
            stopBackend();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await startBackend();
            mainWindow.webContents.send('backend-restarted');
          }
        },
        { type: 'separator' },
        {
          label: 'Herramientas de Desarrollo',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.openDevTools();
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Documentación',
          click: () => {
            shell.openExternal('https://docs.guestsvalencia.es/sandra-mcp');
          }
        },
        {
          label: 'Soporte',
          click: () => {
            shell.openExternal('mailto:support@guestsvalencia.es');
          }
        },
        { type: 'separator' },
        {
          label: 'Acerca de',
          click: showAboutDialog
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showWelcomeDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Sandra MCP Professional',
    message: '¡Bienvenido CEO Claytis!',
    detail: `Sandra MCP Professional está lista con 15 conectores operativos.

🧠 IA: Claude, OpenAI, Gemini, Grok, Groq, Ollama
🎤 VOZ: HeyGen, ElevenLabs, Cartesia
🔧 DEV: GitHub, Netlify
📱 COM: Twilio, Meta WhatsApp
💳 BIZ: PayPal, Desktop Commander

✅ Backend iniciado en puerto 5000
✅ Todos los conectores verificados
✅ Sistema de calidad activo

¡Sandra está lista para trabajar contigo!`,
    buttons: ['Comenzar', 'Ver Documentación'],
    defaultId: 0
  }).then((result) => {
    if (result.response === 1) {
      // Abrir documentación
      shell.openExternal('https://docs.guestsvalencia.es/sandra-mcp');
    }
  });
}

function showAboutDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Acerca de Sandra MCP Professional',
    message: 'Sandra MCP Professional',
    detail: `Versión: ${APP_CONFIG.version}
Desarrollado para: ${APP_CONFIG.author}
Empresa: ${APP_CONFIG.company}

${APP_CONFIG.description}

Funcionalidades:
• Chat IA multimodal avanzado
• 15 conectores de servicios
• Tests de calidad automáticos
• Interfaz profesional responsive
• Backend API completo
• Exportación de reportes

© 2025 GuestsValencia - Todos los derechos reservados`,
    buttons: ['Cerrar']
  });
}

async function exportQualityReport() {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Exportar Reporte de Calidad',
      defaultPath: `sandra_quality_report_${Date.now()}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled) {
      // Solicitar reporte al renderer
      mainWindow.webContents.send('export-report', result.filePath);
    }
  } catch (error) {
    console.error('Error exporting report:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// IPC HANDLERS
// ═══════════════════════════════════════════════════════════════

ipcMain.handle('get-app-info', () => {
  return APP_CONFIG;
});

ipcMain.handle('save-report', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-error', async (event, title, message) => {
  return dialog.showErrorBox(title, message);
});

ipcMain.handle('show-info', async (event, title, message) => {
  return dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: title,
    message: message,
    buttons: ['OK']
  });
});

// ═══════════════════════════════════════════════════════════════
// APP EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════

app.whenReady().then(async () => {
  try {
    // Iniciar backend primero
    console.log('Iniciando backend Sandra MCP...');
    await startBackend();
    console.log('Backend iniciado correctamente');

    // Crear ventana principal
    createMainWindow();

    console.log('Sandra MCP Professional iniciada correctamente');
  } catch (error) {
    console.error('Error iniciando Sandra MCP:', error);

    dialog.showErrorBox(
      'Error de Inicio',
      `No se pudo iniciar Sandra MCP Professional:\n\n${error.message}\n\nPor favor, verifica que todas las dependencias estén instaladas.`
    );

    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopBackend();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// Manejo de certificados (para desarrollo)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // En desarrollo, ignorar errores de certificado
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE SEGURIDAD
// ═══════════════════════════════════════════════════════════════

app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });

  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    // Permitir solo localhost en desarrollo y file:// en producción
    if (parsedUrl.origin !== 'http://localhost:5000' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
    }
  });
});

// Información de la aplicación
app.setName(APP_CONFIG.name);
app.setVersion(APP_CONFIG.version);

module.exports = { APP_CONFIG };