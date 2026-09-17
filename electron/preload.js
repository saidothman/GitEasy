const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkGit: () => ipcRenderer.invoke('git:check-installed'),
  selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
  startOAuth: () => ipcRenderer.invoke('auth:start-oauth'),
  saveToken: (token) => ipcRenderer.invoke('auth:save-token', token),
  getToken: () => ipcRenderer.invoke('auth:get-token'),
  clearToken: () => ipcRenderer.invoke('auth:clear-token'),
  executeGitPipeline: (params) => ipcRenderer.invoke('git:execute-pipeline', params),
  onGitProgress: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('git:progress', subscription);
    return () => ipcRenderer.removeListener('git:progress', subscription);
  },
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
});
