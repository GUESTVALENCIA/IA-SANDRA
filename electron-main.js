// ═══════════════════════════════════════════════════════
// SANDRA PROFESSIONAL - ELECTRON MAIN PROCESS
// Aplicación de escritorio profesional
// ═══════════════════════════════════════════════════════

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Crear ventana principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#1a1a1a',
    title: 'Sandra Professional - CEO Edition',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets/icon.ico')
  });

  // Cargar interfaz
  mainWindow.loadFile('frontend/index.html');

  // DevTools en desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Iniciar backend Express
function startBackend() {
  backendProcess = spawn('node', ['backend/server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  backendProcess.on('error', (error) => {
    console.error('Error iniciando backend:', error);
  });

  console.log('✅ Backend Express iniciado');
}

// Inicialización de la app
app.whenReady().then(() => {
  startBackend();
  
  // Dar tiempo al backend para iniciar
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Cerrar aplicación
app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Limpiar al salir
app.on('quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// IPC Handlers
ipcMain.handle('get-config', () => {
  return {
    apiUrl: 'http://localhost:5000',
    version: app.getVersion()
  };
});

console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     🧠 SANDRA PROFESSIONAL - ELECTRON APP            ║
║                                                       ║
║     Empresa: GuestsValencia                          ║
║     CEO: Claytis Miguel Tom Zuaznabar                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`);
