const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  draftNote: (payload) => ipcRenderer.invoke('ai:draft', payload),
  answerQuestion: (payload) => ipcRenderer.invoke('ai:answer', payload),

  vinaviOpen: (payload) => ipcRenderer.invoke('vinavi:open', payload),
  vinaviFill: (payload) => ipcRenderer.invoke('vinavi:fill', payload),
  vinaviDiagnose: (payload) => ipcRenderer.invoke('vinavi:diagnose', payload),
  vinaviFetchEpisodes: (payload) => ipcRenderer.invoke('vinavi:fetchEpisodes', payload),
  vinaviClose: () => ipcRenderer.invoke('vinavi:close'),

  openConfigInfo: () => ipcRenderer.invoke('app:openConfig'),

  onVinaviStatus: (handler) => {
    ipcRenderer.removeAllListeners('vinavi:status');
    ipcRenderer.on('vinavi:status', (_event, status) => handler(status));
  }
});
