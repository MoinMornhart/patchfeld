'use strict';

// Auto-update through GitHub Releases (electron-updater). Only active in the installed app.
function setupUpdater({ enabled, send }) {
  if (!enabled) {
    return { check: async () => ({ status: 'dev' }), install: () => {} };
  }

  const { autoUpdater } = require('electron-updater');
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => send('update:status', { status: 'checking' }));
  autoUpdater.on('update-available', (info) => send('update:status', { status: 'available', version: info.version }));
  autoUpdater.on('update-not-available', () => send('update:status', { status: 'none' }));
  autoUpdater.on('download-progress', (progress) => send('update:status', { status: 'downloading', percent: progress.percent }));
  autoUpdater.on('update-downloaded', (info) => send('update:status', { status: 'ready', version: info.version }));
  autoUpdater.on('error', (err) => send('update:status', { status: 'error', message: err ? err.message : 'unknown' }));

  const check = async () => {
    try {
      await autoUpdater.checkForUpdates();
      return { status: 'checking' };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  };

  setTimeout(check, 5000);
  setInterval(check, 4 * 60 * 60 * 1000);

  return { check, install: () => autoUpdater.quitAndInstall() };
}

module.exports = setupUpdater;
