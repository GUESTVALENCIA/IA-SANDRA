const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

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

        // Cargar el HTML mejorado
        this.mainWindow.loadFile('sandra-desktop-v2.html');
    }

    setupHandlers() {
        // File operations
        ipcMain.handle('create-file', async (event, filePath, content) => {