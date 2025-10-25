const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Sandra Desktop App (v2) with Offline Mode
class SandraDesktopApp {
    constructor() {
        this.mainWindow = null;
        this.setupHandlers();
    }

    createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            title: 'Sandra Dev Interface - Galaxy 7.0',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false
            },
            backgroundColor: '#0a0a0a',
            frame: true,
            autoHideMenuBar: true
        });

        // Load the improved HTML for v2
        this.mainWindow.loadFile('sandra-desktop-v2.html');

        // Inject offline overlay and listeners after page load
        this.mainWindow.webContents.on('did-finish-load', () => {
            this.mainWindow.webContents.executeJavaScript(`
                (function() {
                    if (!document.getElementById('offline-overlay')) {
                        const overlay = document.createElement('div');
                        overlay.id = 'offline-overlay';
                        overlay.style.position = 'fixed';
                        overlay.style.top = '0';
                        overlay.style.left = '0';
                        overlay.style.width = '100%';
                        overlay.style.height = '100%';
                        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                        overlay.style.color = '#fff';
                        overlay.style.display = 'none';
                        overlay.style.flexDirection = 'column';
                        overlay.style.justifyContent = 'center';
                        overlay.style.alignItems = 'center';
                        overlay.style.zIndex = '9999';
                        overlay.innerHTML = '<h2>Modo offline</h2><p>No hay conexión a Internet. Algunas funciones están deshabilitadas.</p>';
                        document.body.appendChild(overlay);
                    }
                    function updateNetworkStatus() {
                        const overlay = document.getElementById('offline-overlay');
                        if (navigator.onLine) {
                            overlay.style.display = 'none';
                        } else {
                            overlay.style.display = 'flex';
                        }
                    }
                    window.addEventListener('online', updateNetworkStatus);
                    window.addEventListener('offline', updateNetworkStatus);
                    updateNetworkStatus();
                })();
            `).catch((err) => {
                console.error('Failed to inject offline handler:', err);
            });
        });
    }

    setupHandlers() {
        // File operations
        ipcMain.handle('create-file', async (event, filePath, content) => {
            try {
                fs.writeFileSync(filePath, content);
                return { success: true, message: 'Archivo creado' };
            } catch (error) {
                return { success: false, message: error.message };
            }
        });
        // Terminal operations
        ipcMain.handle('execute-command', async (event, command) => {
            return new Promise((resolve) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        resolve({ success: false, output: error.message });
                    } else {
                        resolve({ success: true, output: stdout || stderr });
                    }
                });
            });
        });
        // Git operations
        ipcMain.handle('git-status', async (event) => {
            return new Promise((resolve) => {
                exec('git status', (error, stdout) => {
                    resolve({ success: !error, output: stdout });
                });
            });
        });
    }
}

// App initialization
app.whenReady().then(() => {
    const sandra = new SandraDesktopApp();
    sandra.createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        const sandra = new SandraDesktopApp();
        sandra.createWindow();
    }
});
