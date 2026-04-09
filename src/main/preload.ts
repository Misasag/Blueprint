import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:save', filePath, content),
  saveFileAs: (content: string) => ipcRenderer.invoke('file:saveAs', content),
  onMenuAction: (callback: (action: string) => void) => {
    const channels = ['menu:open', 'menu:save', 'menu:saveAs', 'menu:undo', 'menu:redo', 'menu:delete'];
    const handlers = channels.map(ch => {
      const fn = () => callback(ch);
      ipcRenderer.on(ch, fn);
      return { ch, fn };
    });
    return () => handlers.forEach(({ ch, fn }) => ipcRenderer.removeListener(ch, fn));
  },
});
