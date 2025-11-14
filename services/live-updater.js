const { autoUpdater } = require('electron-updater');
const { Octokit } = require('@octokit/rest');
const semver = require('semver');
const { app } = require('electron');

class LiveUpdater {
  constructor(mainWindow, db) {
    this.mainWindow = mainWindow;
    this.db = db;
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    this.checkInterval = null;
    
    this.setupAutoUpdater();
    console.log('✅ Live Updater inicializado');
  }

  setupAutoUpdater() {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    
    autoUpdater.on('checking-for-update', () => {
      console.log('🔍 Verificando actualizaciones...');
      this.notifyUI('checking');
    });

    autoUpdater.on('update-available', async (info) => {
      console.log('✅ Actualización disponible:', info.version);
      
      const releaseNotes = await this.getReleaseNotes();
      
      if (this.db) {
        await this.db.logUpdateStatus('available', {
          version: info.version,
          releaseNotes,
          releaseDate: info.releaseDate
        });
      }
      
      this.notifyUI('update-available', {
        version: info.version,
        releaseNotes
      });
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('✓ Sistema actualizado:', info.version);
      this.notifyUI('up-to-date', { version: info.version });
    });

    autoUpdater.on('download-progress', (progress) => {
      console.log(`📥 Descargando: ${Math.round(progress.percent)}%`);
      this.notifyUI('download-progress', {
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total
      });
    });

    autoUpdater.on('update-downloaded', async (info) => {
      console.log('✅ Actualización descargada:', info.version);
      
      if (this.db) {
        await this.db.logUpdateStatus('downloaded', {
          version: info.version,
          downloadTime: new Date().toISOString()
        });
      }
      
      this.notifyUI('update-downloaded', {
        version: info.version,
        canInstall: true
      });
    });

    autoUpdater.on('error', async (error) => {
      console.error('❌ Error en actualización:', error);
      
      if (this.db) {
        await this.db.logUpdateStatus('error', {
          error: error.message,
          time: new Date().toISOString()
        });
      }
      
      this.notifyUI('error', {
        message: error.message
      });
    });
  }

  async checkForUpdates() {
    try {
      // Verificar última versión en GitHub
      const latest = await this.getLatestRelease();
      const current = app.getVersion();
      
      console.log(`📦 Versión actual: ${current}`);
      console.log(`📦 Última versión: ${latest.tag_name}`);
      
      if (this.isNewerVersion(latest.tag_name, current)) {
        console.log('🔄 Nueva versión disponible, iniciando actualización...');
        autoUpdater.checkForUpdates();
        return true;
      } else {
        console.log('✓ Sistema actualizado');
        return false;
      }
    } catch (error) {
      console.error('Error verificando actualizaciones:', error);
      return false;
    }
  }

  async getLatestRelease() {
    const [owner, repo] = process.env.GITHUB_REPO.split('/');
    
    const response = await this.octokit.repos.getLatestRelease({
      owner,
      repo
    });
    
    return response.data;
  }

  async getReleaseNotes() {
    try {
      const [owner, repo] = process.env.GITHUB_REPO.split('/');
      
      const { data: releases } = await this.octokit.repos.listReleases({
        owner,
        repo,
        per_page: 1
      });
      
      return releases[0]?.body || 'Sin notas de versión';
    } catch (error) {
      console.error('Error obteniendo release notes:', error);
      return 'Error obteniendo notas de versión';
    }
  }

  isNewerVersion(newVersion, currentVersion) {
    // Limpiar versiones (remover 'v' si existe)
    const cleanNew = newVersion.replace(/^v/, '');
    const cleanCurrent = currentVersion.replace(/^v/, '');
    
    try {
      return semver.gt(cleanNew, cleanCurrent);
    } catch (error) {
      // Fallback a comparación simple si semver falla
      return cleanNew > cleanCurrent;
    }
  }

  notifyUI(event, data = {}) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('updater-event', {
        event,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  startAutoCheck(intervalMinutes = 60) {
    // Verificar cada X minutos
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMinutes * 60 * 1000);
    
    console.log(`⏰ Auto-check activado: cada ${intervalMinutes} minutos`);
  }

  stopAutoCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('⏰ Auto-check desactivado');
    }
  }

  async installUpdate() {
    console.log('🔄 Instalando actualización...');
    autoUpdater.quitAndInstall(false, true);
  }
}

module.exports = LiveUpdater;

