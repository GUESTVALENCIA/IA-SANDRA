const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Sandra Desktop App - No server needed!
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
            icon: path.join(__dirname, 'icon.ico'),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false
            },
            backgroundColor: '#0a0a0a',
            frame: true,
            autoHideMenuBar: true
        });

        this.mainWindow.loadFile('sandra-desktop.html');
        
        // DevTools for debugging
        // this.mainWindow.webContents.openDevTools();
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
    }}

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