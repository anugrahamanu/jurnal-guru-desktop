const { app, BrowserWindow, Menu, Tray, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn, execSync } = require('child_process');

const LOCAL_PORT = 48201;
const MYSQL_PORT = 3308;

const LOCAL_BASE = `http://127.0.0.1:${LOCAL_PORT}`;
const LOCAL_URL = `${LOCAL_BASE}/app.html`;

let mainWindow = null;
let tray = null;
let isQuitting = false;

let mysqlProcess = null;
let phpProcess = null;

// Paths for embedded engine
const isPackaged = app.isPackaged;
const engineDir = isPackaged
  ? path.join(process.resourcesPath, 'engine')
  : path.join(__dirname, 'engine');

const userDataDir = app.getPath('userData');
const dbDataDir = path.join(userDataDir, 'db_data');
const templateDataDir = path.join(engineDir, 'data');
const mysqldExe = path.join(engineDir, 'mysql', 'bin', 'mysqld.exe');
const phpExe = path.join(engineDir, 'php', 'php.exe');
const phpIni = path.join(engineDir, 'php', 'php.ini');
const routerPhp = path.join(engineDir, 'router.php');
const htdocsDir = path.join(engineDir, 'htdocs');

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    // Start local database & server engine
    startEmbeddedEngine();

    createWindow();
    createTray();
    setupAppMenu();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

function startEmbeddedEngine() {
  try {
    // 1. Initialize user database directory if not existing yet
    if (!fs.existsSync(dbDataDir)) {
      fs.mkdirSync(dbDataDir, { recursive: true });
      if (fs.existsSync(templateDataDir)) {
        fs.cpSync(templateDataDir, dbDataDir, { recursive: true });
      }
    }

    // 2. Spawn portable MariaDB on port 3308
    if (fs.existsSync(mysqldExe)) {
      mysqlProcess = spawn(mysqldExe, [
        '--no-defaults',
        `--datadir=${dbDataDir.replace(/\\/g, '/')}`,
        `--port=${MYSQL_PORT}`,
        '--bind-address=127.0.0.1',
        '--console'
      ], {
        stdio: 'ignore',
        windowsHide: true,
        detached: false
      });

      mysqlProcess.on('error', (err) => {
        console.error('MySQL spawn error:', err);
      });
    }

    // 3. Spawn portable PHP built-in web server on port 48201
    if (fs.existsSync(phpExe)) {
      phpProcess = spawn(phpExe, [
        '-c', phpIni,
        '-S', `127.0.0.1:${LOCAL_PORT}`,
        '-t', htdocsDir,
        routerPhp
      ], {
        stdio: 'ignore',
        windowsHide: true,
        detached: false
      });

      phpProcess.on('error', (err) => {
        console.error('PHP spawn error:', err);
      });
    }
  } catch (err) {
    console.error('Failed to start embedded engine:', err);
  }
}

function stopEmbeddedEngine() {
  try {
    if (phpProcess && !phpProcess.killed) {
      try { process.kill(phpProcess.pid); } catch (e) {}
      phpProcess = null;
    }
    if (mysqlProcess && !mysqlProcess.killed) {
      try { process.kill(mysqlProcess.pid); } catch (e) {}
      mysqlProcess = null;
    }
    // Cleanup any lingering instances on Windows
    try {
      execSync(`taskkill /F /IM mysqld.exe /FI "MEMUSAGE gt 1000"`, { stdio: 'ignore' });
    } catch (e) {}
  } catch (e) {}
}

function getBaseUrl() {
  return LOCAL_BASE;
}

function getAppTitle() {
  return 'Jurnal Guru Digital (Aplikasi Desktop Standalone - 100% Offline)';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 960,
    minHeight: 640,
    title: getAppTitle(),
    icon: path.join(__dirname, 'icon.ico'),
    backgroundColor: '#09090b',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the offline application
  loadTargetUrl();

  // Handle external links opening in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function loadTargetUrl() {
  if (!mainWindow) return;

  // Check local embedded server readiness then load
  checkServerReady(LOCAL_PORT, 25, 200, (ready) => {
    if (ready && mainWindow) {
      mainWindow.loadURL(LOCAL_URL).catch(() => {
        mainWindow.loadFile(path.join(__dirname, 'offline.html'));
      });
    } else if (mainWindow) {
      mainWindow.loadFile(path.join(__dirname, 'offline.html'));
    }
  });
}

function checkServerReady(port, maxTries, intervalMs, callback) {
  let tries = 0;
  function attempt() {
    tries++;
    const req = http.get(`http://127.0.0.1:${port}/app.html`, (res) => {
      res.resume();
      callback(true);
    });
    req.on('error', () => {
      if (tries < maxTries) {
        setTimeout(attempt, intervalMs);
      } else {
        callback(false);
      }
    });
    req.setTimeout(800, () => {
      req.abort();
    });
  }
  attempt();
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.ico');
  tray = new Tray(iconPath);
  tray.setToolTip('Jurnal Guru Digital (Database Komputer Lokal)');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Buka Jurnal Guru',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: '● Database: Komputer Lokal (100% Offline)',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Keluar',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function setupAppMenu() {
  const template = [
    {
      label: '💾 Database Lokal',
      submenu: [
        {
          label: '📂 Buka Folder Penyimpanan Database...',
          click: () => {
            if (!fs.existsSync(dbDataDir)) {
              fs.mkdirSync(dbDataDir, { recursive: true });
            }
            shell.openPath(dbDataDir);
          }
        },
        { type: 'separator' },
        {
          label: 'ℹ️ Informasi Database Mandiri',
          click: () => {
            const info = `Mode: DATABASE KOMPUTER LOKAL (100% OFFLINE)\n\nSemua data tersimpan privat di folder:\n${dbDataDir}\n\nAplikasi berjalan mandiri tanpa memerlukan internet dan tanpa XAMPP!`;
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Informasi Database Jurnal Guru',
              message: 'Penyimpanan Database Mandiri',
              detail: info,
              buttons: ['Tutup']
            });
          }
        }
      ]
    },
    {
      label: 'Fitur Utama',
      submenu: [
        {
          label: 'Dashboard Jurnal Guru',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow && mainWindow.loadURL(`${getBaseUrl()}/app.html`)
        },
        { type: 'separator' },
        {
          label: 'Muat Ulang Halaman (Reload)',
          accelerator: 'F5',
          click: () => mainWindow && mainWindow.webContents.reload()
        },
        {
          label: 'Keluar',
          accelerator: 'Alt+F4',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Navigasi',
      submenu: [
        {
          label: 'Kembali (Back)',
          accelerator: 'Alt+Left',
          click: () => {
            if (mainWindow && mainWindow.webContents.canGoBack()) {
              mainWindow.webContents.goBack();
            }
          }
        },
        {
          label: 'Maju (Forward)',
          accelerator: 'Alt+Right',
          click: () => {
            if (mainWindow && mainWindow.webContents.canGoForward()) {
              mainWindow.webContents.goForward();
            }
          }
        },
        {
          label: 'Beranda (Home)',
          accelerator: 'Alt+Home',
          click: () => mainWindow && mainWindow.loadURL(`${getBaseUrl()}/app.html`)
        }
      ]
    },
    {
      label: 'Tampilan',
      submenu: [
        {
          label: 'Perbesar Layar (Zoom In)',
          accelerator: 'CmdOrCtrl+Plus',
          role: 'zoomIn'
        },
        {
          label: 'Perkecil Layar (Zoom Out)',
          accelerator: 'CmdOrCtrl+-',
          role: 'zoomOut'
        },
        {
          label: 'Ukuran Normal (Reset Zoom)',
          accelerator: 'CmdOrCtrl+0',
          role: 'resetZoom'
        },
        { type: 'separator' },
        {
          label: 'Layar Penuh (Fullscreen)',
          accelerator: 'F11',
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: 'Bantuan',
      submenu: [
        {
          label: 'Buka di Browser Luar (Chrome/Edge)',
          click: () => {
            if (mainWindow) {
              shell.openExternal(mainWindow.webContents.getURL() || getBaseUrl());
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Tentang Jurnal Guru Digital',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Tentang Jurnal Guru Digital',
              message: 'Jurnal Guru Digital - Kurikulum Merdeka',
              detail: 'Versi 1.0.0 (Windows Desktop Standalone Edition)\n\nAplikasi desktop mandiri dengan engine database lokal tertanam (Zero Configuration).\n100% Offline: Data tersimpan di laptop Anda tanpa memerlukan XAMPP dan tanpa memerlukan koneksi internet.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('before-quit', () => {
  isQuitting = true;
  stopEmbeddedEngine();
});

app.on('will-quit', () => {
  stopEmbeddedEngine();
});

app.on('window-all-closed', () => {
  stopEmbeddedEngine();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
