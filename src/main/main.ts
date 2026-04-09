import { app, BrowserWindow, ipcMain, dialog, session, Menu, shell } from 'electron';
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
    icon: app.isPackaged
      ? path.join(process.resourcesPath, 'assets/icon.png')
      : path.join(__dirname, '../../assets/icon.png'),
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
    return { success: false, error: '許可されていないファイルパスです' };
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

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: '開く',
          click: () => mainWindow?.webContents.send('menu:open'),
        },
        {
          label: '保存',
          click: () => mainWindow?.webContents.send('menu:save'),
        },
        {
          label: '名前を付けて保存',
          click: () => mainWindow?.webContents.send('menu:saveAs'),
        },
        { type: 'separator' },
        isMac ? { role: 'close', label: '閉じる' } : { role: 'quit', label: '終了' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: '元に戻す',
          click: () => mainWindow?.webContents.send('menu:undo'),
        },
        {
          label: 'やり直す',
          click: () => mainWindow?.webContents.send('menu:redo'),
        },
        { type: 'separator' },
        {
          label: '削除',
          click: () => mainWindow?.webContents.send('menu:delete'),
        },
        { type: 'separator' },
        { role: 'selectAll', label: 'すべて選択' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: '再読み込み' },
        { role: 'toggleDevTools', label: '開発者ツール' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'ズームリセット' },
        { role: 'zoomIn', label: 'ズームイン' },
        { role: 'zoomOut', label: 'ズームアウト' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'フルスクリーン' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Blueprint について',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'Blueprint',
              message: 'Blueprint - UI Editor',
              detail: [
                `Version: ${app.getVersion()}`,
                '',
                'エンジニア向けの .ui ビジュアルエディタ。',
                'AIが生成した .ui ファイルを視覚的に編集し、',
                '任意のフレームワークのコードに変換するワークフローを支援します。',
                '',
                `Electron: ${process.versions.electron}`,
                `Node.js: ${process.versions.node}`,
              ].join('\n'),
            });
          },
        },
        { type: 'separator' },
        {
          label: 'キーボードショートカット',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'キーボードショートカット',
              message: 'ショートカット一覧',
              detail: [
                'Ctrl+O          ファイルを開く',
                'Ctrl+S          保存',
                'Ctrl+Shift+S    名前を付けて保存',
                'Ctrl+Z          元に戻す',
                'Ctrl+Shift+Z    やり直す',
                'Delete           要素を削除',
                'Ctrl+ホイール    キャンバスズーム',
              ].join('\n'),
            });
          },
        },
        { type: 'separator' },
        {
          label: 'GitHub リポジトリ',
          click: () => {
            shell.openExternal('https://github.com/Misasag/Blueprint');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
});

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
