import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:save', filePath, content),
  saveFileAs: (content: string) => ipcRenderer.invoke('file:saveAs', content),
});
