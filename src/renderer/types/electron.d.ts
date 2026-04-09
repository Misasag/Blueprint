export interface FileResult {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
}

export interface ElectronAPI {
  openFile: () => Promise<FileResult | null>;
  saveFile: (filePath: string, content: string) => Promise<FileResult>;
  saveFileAs: (content: string) => Promise<FileResult | null>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
