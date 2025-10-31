/**
 * Auto-Update Module for Electron
 * Implementa actualización automática usando electron-updater
 */

const { autoUpdater } = require('electron-updater');
const { app } = require('electron');

class AutoUpdateManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.updateAvailable = false;
    this.updateDownloaded = false;
  }

  /**
   * Inicializar auto-updater
   */
  initialize() {
    // Solo en producción
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTO-UPDATE] Disabled in development mode');
      return;
    }

    // Configurar auto-updater
    autoUpdater.checkForUpdatesAndNotify();

    // Event listeners
    autoUpdater.on('checking-for-update', () => {
      console.log('[AUTO-UPDATE] Checking for updates...');
      this.sendStatusToWindow('checking-for-update');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('[AUTO-UPDATE] Update available:', info.version);
      this.updateAvailable = true;
      this.sendStatusToWindow('update-available', info);
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('[AUTO-UPDATE] Update not available');
      this.sendStatusToWindow('update-not-available', info);
    });

    autoUpdater.on('error', (err) => {
      console.error('[AUTO-UPDATE] Error:', err);
      this.sendStatusToWindow('update-error', err.message);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.sendStatusToWindow('download-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('[AUTO-UPDATE] Update downloaded:', info.version);
      this.updateDownloaded = true;
      this.sendStatusToWindow('update-downloaded', info);
    });

    // Verificar actualizaciones cada hora
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 3600000); // 1 hora
  }

  /**
   * Enviar estado al renderer
   */
  sendStatusToWindow(status, data = null) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('auto-update-status', { status, data });
    }
  }

  /**
   * Instalar actualización y reiniciar
   */
  quitAndInstall() {
    if (this.updateDownloaded) {
      autoUpdater.quitAndInstall();
    }
  }
}

module.exports = AutoUpdateManager;

