import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  listDirectory: (dirPath: string) => ipcRenderer.invoke('list-directory', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  readImage: (imagePath: string) => ipcRenderer.invoke('read-image', imagePath),
  getFileType: (filePath: string) => ipcRenderer.invoke('get-file-type', filePath),
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data')
});