import { app, BrowserWindow, ipcMain, dialog, session } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';

let mainWindow: BrowserWindow | null = null;

/** ダイアログで開いた/保存したパスを正規化して記録。IPC書き込みを制限する */
const allowedPaths = new Set<string>();

function normalizePath(filePath: string): string {
  return path.resolve(filePath).toLowerCase();
}

function addAllowedPath(filePath: string): void {
  allowedPaths.add(normalizePath(filePath));
}

function isPathAllowed(filePath: string): boolean {
  return allowedPaths.has(normalizePath(filePath));
}

/** 不要になったパスを削除 */
function removeAllowedPath(filePath: string): void {
  allowedPaths.delete(normalizePath(filePath));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    title: 'Blueprint - UI Editor',
  });

  // CSP設定（開発モードでは緩和）
  if (process.env.NODE_ENV !== 'development') {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
          ],
        },
      });
    });
  }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/** IPC結果の共通型 */
interface FileResult {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
}

// IPC: ファイルを開く
ipcMain.handle('file:open', async (): Promise<FileResult | null> => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'UI Files', extensions: ['ui'] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  addAllowedPath(filePath);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, filePath, content };
  } catch (err) {
    removeAllowedPath(filePath);
    return { success: false, error: String(err) };
  }
});

// IPC: ファイルを保存
ipcMain.handle('file:save', async (_event, filePath: string, content: string): Promise<FileResult> => {
  if (!isPathAllowed(filePath)) {
    return { success: false, error: '許可されていないファイ��パスです' };
  }
  if (!filePath.endsWith('.ui')) {
    return { success: false, error: '.ui ファイルのみ保存できます' };
  }

  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});

// IPC: 名前を付けて保存
ipcMain.handle('file:saveAs', async (_event, content: string): Promise<FileResult | null> => {
  const result = await dialog.showSaveDialog({
    filters: [{ name: 'UI Files', extensions: ['ui'] }],
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  // .ui 拡張子を保証（ダイアログで変更された場合に備える）
  if (!result.filePath.endsWith('.ui')) {
    result.filePath += '.ui';
  }

  addAllowedPath(result.filePath);

  try {
    await fs.writeFile(result.filePath, content, 'utf-8');
    return { success: true, filePath: result.filePath };
  } catch (err) {
    removeAllowedPath(result.filePath);
    return { success: false, error: String(err) };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
