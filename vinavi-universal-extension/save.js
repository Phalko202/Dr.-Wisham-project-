const DB_NAME = 'vinavi-universal-helper';
const DB_STORE = 'handles';
const DB_KEY = 'saveDir';

const QUICKTEXT_KEYS = ['customTemplates', 'vinaviTheme'];

// Lab uses a mix of chrome.storage + localStorage keys.
// For file export we capture:
// - chrome.storage.local keys prefixed with 'hmh_' and a few known extras
// - plus we DO NOT export auth tokens.
const LAB_CHROME_PREFIXES = ['hmh_'];
const LAB_CHROME_EXTRA_KEYS = ['HMH_CLINICAL_SETS_V1', 'HMH_ROUTINE_SERVICE_DETAILS_V1'];
const EXCLUDE_KEYS = ['vinavi_auth_token', 'auth_token', 'access_token'];

const FILES_DIR_NAME = 'save file';
const QUICKTEXT_FILE = 'vinavi-quicktext.json';
const LAB_FILE = 'vinavi-lab.json';

const els = {
  chooseFolder: document.getElementById('chooseFolder'),
  exportQT: document.getElementById('exportQT'),
  importQT: document.getElementById('importQT'),
  clearQT: document.getElementById('clearQT'),
  exportLab: document.getElementById('exportLab'),
  importLab: document.getElementById('importLab'),
  clearLab: document.getElementById('clearLab'),
  deleteFiles: document.getElementById('deleteFiles'),
  refresh: document.getElementById('refresh'),
  status: document.getElementById('status'),
  qtPill: document.getElementById('qtPill'),
  labPill: document.getElementById('labPill')
};

function logStatus(msg) {
  els.status.textContent = msg;
}

function setPill(pillEl, text, ok) {
  pillEl.textContent = text;
  pillEl.style.color = ok ? 'rgba(34,197,94,0.95)' : 'rgba(229,231,235,0.70)';
  pillEl.style.borderColor = ok ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.12)';
}

async function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const store = tx.objectStore(DB_STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function getSavedDirHandle() {
  try {
    const handle = await idbGet(DB_KEY);
    return handle || null;
  } catch (_) {
    return null;
  }
}

async function setSavedDirHandle(handle) {
  await idbSet(DB_KEY, handle);
}

async function ensurePermissions(dirHandle) {
  // Chromium: queryPermission/requestPermission exist
  if (!dirHandle?.queryPermission || !dirHandle?.requestPermission) return true;
  const q = await dirHandle.queryPermission({ mode: 'readwrite' });
  if (q === 'granted') return true;
  const r = await dirHandle.requestPermission({ mode: 'readwrite' });
  return r === 'granted';
}

async function pickFolder() {
  if (!window.showDirectoryPicker) {
    throw new Error('This browser does not support folder picking (File System Access API).');
  }
  const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
  const ok = await ensurePermissions(dir);
  if (!ok) throw new Error('Folder permission not granted.');
  await setSavedDirHandle(dir);
  return dir;
}

async function getSaveFilesDir(dirHandle) {
  return dirHandle.getDirectoryHandle(FILES_DIR_NAME, { create: true });
}

async function writeJsonFile(dirHandle, filename, dataObj) {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(dataObj, null, 2));
  await writable.close();
}

async function readJsonFile(dirHandle, filename) {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: false });
  const file = await fileHandle.getFile();
  const text = await file.text();
  return JSON.parse(text);
}

async function removeFile(dirHandle, filename) {
  try {
    await dirHandle.removeEntry(filename);
  } catch (_) {
    // ignore
  }
}

function isLabChromeKey(key) {
  if (!key) return false;
  if (EXCLUDE_KEYS.includes(key)) return false;
  if (LAB_CHROME_EXTRA_KEYS.includes(key)) return true;
  return LAB_CHROME_PREFIXES.some((p) => key.startsWith(p));
}

async function exportQuickText(dir) {
  const all = await chrome.storage.local.get(QUICKTEXT_KEYS);
  const out = {
    exportedAt: new Date().toISOString(),
    type: 'vinavi-quicktext',
    version: 1,
    data: {}
  };
  for (const k of QUICKTEXT_KEYS) {
    if (typeof all[k] !== 'undefined') out.data[k] = all[k];
  }
  await writeJsonFile(dir, QUICKTEXT_FILE, out);
  return out;
}

async function importQuickText(dir) {
  const obj = await readJsonFile(dir, QUICKTEXT_FILE);
  if (!obj || obj.type !== 'vinavi-quicktext' || !obj.data) {
    throw new Error('Invalid quick text save file.');
  }
  await chrome.storage.local.set(obj.data);
  return obj;
}

async function clearQuickText() {
  await chrome.storage.local.remove(QUICKTEXT_KEYS);
}

async function exportLab(dir) {
  const all = await chrome.storage.local.get(null);
  const data = {};
  Object.keys(all || {}).forEach((k) => {
    if (isLabChromeKey(k)) data[k] = all[k];
  });

  const out = {
    exportedAt: new Date().toISOString(),
    type: 'vinavi-lab',
    version: 1,
    data
  };

  await writeJsonFile(dir, LAB_FILE, out);
  return out;
}

async function importLab(dir) {
  const obj = await readJsonFile(dir, LAB_FILE);
  if (!obj || obj.type !== 'vinavi-lab' || !obj.data) {
    throw new Error('Invalid lab save file.');
  }
  // Do not import excluded keys even if present
  for (const k of EXCLUDE_KEYS) {
    if (k in obj.data) delete obj.data[k];
  }
  await chrome.storage.local.set(obj.data);
  return obj;
}

async function clearLab() {
  const all = await chrome.storage.local.get(null);
  const toRemove = Object.keys(all || {}).filter((k) => isLabChromeKey(k));
  if (toRemove.length > 0) {
    await chrome.storage.local.remove(toRemove);
  }
}

async function refreshStatus() {
  const root = await getSavedDirHandle();
  if (!root) {
    setPill(els.qtPill, 'not connected', false);
    setPill(els.labPill, 'not connected', false);
    logStatus('No save folder selected yet. Click “Choose Save Folder”.');
    return;
  }

  const ok = await ensurePermissions(root);
  if (!ok) {
    setPill(els.qtPill, 'permission needed', false);
    setPill(els.labPill, 'permission needed', false);
    logStatus('Save folder selected but permission was not granted. Click “Choose Save Folder” again.');
    return;
  }

  const saveDir = await getSaveFilesDir(root);

  let qtExists = false;
  let labExists = false;
  try { await saveDir.getFileHandle(QUICKTEXT_FILE, { create: false }); qtExists = true; } catch (_) {}
  try { await saveDir.getFileHandle(LAB_FILE, { create: false }); labExists = true; } catch (_) {}

  setPill(els.qtPill, qtExists ? 'file ready' : 'no file yet', qtExists);
  setPill(els.labPill, labExists ? 'file ready' : 'no file yet', labExists);

  logStatus(
    `Save folder connected.\n` +
    `Folder: ${FILES_DIR_NAME} (inside your chosen directory)\n` +
    `Quick Text: ${qtExists ? 'vinavi-quicktext.json exists' : 'not exported yet'}\n` +
    `Lab: ${labExists ? 'vinavi-lab.json exists' : 'not exported yet'}`
  );
}

async function withSaveDir(fn) {
  let root = await getSavedDirHandle();
  if (!root) root = await pickFolder();

  const ok = await ensurePermissions(root);
  if (!ok) throw new Error('Folder permission not granted.');

  const saveDir = await getSaveFilesDir(root);
  return fn(saveDir);
}

els.chooseFolder?.addEventListener('click', async () => {
  try {
    await pickFolder();
    await refreshStatus();
  } catch (e) {
    logStatus(`Error: ${e.message || e}`);
  }
});

els.exportQT?.addEventListener('click', async () => {
  try {
    logStatus('Exporting Quick Text...');
    const out = await withSaveDir((d) => exportQuickText(d));
    const count = out?.data?.customTemplates ? Object.keys(out.data.customTemplates).length : 0;
    logStatus(`Quick Text exported. Templates: ${count}.`);
    await refreshStatus();
  } catch (e) {
    logStatus(`Export failed: ${e.message || e}`);
  }
});

els.importQT?.addEventListener('click', async () => {
  try {
    if (!confirm('Import Quick Text data from file and overwrite current Quick Text templates/theme?')) return;
    logStatus('Importing Quick Text...');
    const obj = await withSaveDir((d) => importQuickText(d));
    const count = obj?.data?.customTemplates ? Object.keys(obj.data.customTemplates).length : 0;
    logStatus(`Quick Text imported. Templates: ${count}.`);
    await refreshStatus();
  } catch (e) {
    logStatus(`Import failed: ${e.message || e}`);
  }
});

els.clearQT?.addEventListener('click', async () => {
  try {
    if (!confirm('Clear Quick Text templates/theme from this browser?')) return;
    await clearQuickText();
    logStatus('Quick Text data cleared from browser storage.');
  } catch (e) {
    logStatus(`Clear failed: ${e.message || e}`);
  }
});

els.exportLab?.addEventListener('click', async () => {
  try {
    logStatus('Exporting Lab Integration...');
    const out = await withSaveDir((d) => exportLab(d));
    const count = out?.data ? Object.keys(out.data).length : 0;
    logStatus(`Lab exported. Keys: ${count}.`);
    await refreshStatus();
  } catch (e) {
    logStatus(`Export failed: ${e.message || e}`);
  }
});

els.importLab?.addEventListener('click', async () => {
  try {
    if (!confirm('Import Lab data from file and overwrite current Lab saved data?')) return;
    logStatus('Importing Lab Integration...');
    const obj = await withSaveDir((d) => importLab(d));
    const count = obj?.data ? Object.keys(obj.data).length : 0;
    logStatus(`Lab imported. Keys: ${count}.`);
    await refreshStatus();
  } catch (e) {
    logStatus(`Import failed: ${e.message || e}`);
  }
});

els.clearLab?.addEventListener('click', async () => {
  try {
    if (!confirm('Clear Lab saved data from this browser?')) return;
    await clearLab();
    logStatus('Lab data cleared from browser storage.');
  } catch (e) {
    logStatus(`Clear failed: ${e.message || e}`);
  }
});

els.deleteFiles?.addEventListener('click', async () => {
  try {
    if (!confirm('Delete both save files from the selected folder?')) return;
    logStatus('Deleting save files...');
    await withSaveDir(async (d) => {
      await removeFile(d, QUICKTEXT_FILE);
      await removeFile(d, LAB_FILE);
    });
    logStatus('Save files deleted (if they existed).');
    await refreshStatus();
  } catch (e) {
    logStatus(`Delete failed: ${e.message || e}`);
  }
});

els.refresh?.addEventListener('click', async () => {
  try {
    await refreshStatus();
  } catch (e) {
    logStatus(`Error: ${e.message || e}`);
  }
});

refreshStatus();
