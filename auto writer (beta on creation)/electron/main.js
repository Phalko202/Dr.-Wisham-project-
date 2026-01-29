const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { draftNote } = require('../src/ai/draft');
const { answerQuestion } = require('../src/ai/qa');
const { VinaviAutomation } = require('../src/automation/vinavi');

let mainWindow;
let automation;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    backgroundColor: '#0b1220',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  automation = new VinaviAutomation({
    userDataDir: path.join(app.getPath('userData'), 'playwright-profile')
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('ai:draft', async (_event, payload) => {
  return await draftNote(payload);
});

ipcMain.handle('ai:answer', async (_event, payload) => {
  return await answerQuestion(payload);
});

ipcMain.handle('vinavi:open', async (_event, payload) => {
  await automation.open(payload?.profile);
  return { ok: true };
});

ipcMain.handle('vinavi:fill', async (_event, payload) => {
  return await automation.fill(payload, (status) => {
    try {
      mainWindow?.webContents?.send('vinavi:status', status);
    } catch {
      // ignore
    }
  });
});

ipcMain.handle('vinavi:fetchEpisodes', async (_event, payload) => {
  return await automation.fetchEpisodes(payload, (status) => {
    try {
      mainWindow?.webContents?.send('vinavi:status', status);
    } catch {
      // ignore
    }
  });
});

ipcMain.handle('vinavi:diagnose', async (_event, payload) => {
  const data = await automation.diagnose(payload?.profile);
  return { ok: true, data };
});

ipcMain.handle('vinavi:close', async () => {
  await automation.close();
  return { ok: true };
});

ipcMain.handle('app:openConfig', async () => {
  const configPath = path.join(__dirname, '..', 'config', 'vinavi.mapping.json');
  await dialog.showMessageBox({
    type: 'info',
    title: 'Config file',
    message: 'Edit field mapping in:',
    detail: configPath
  });
  return { path: configPath };
});
