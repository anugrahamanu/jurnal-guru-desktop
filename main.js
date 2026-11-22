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
const isWin = process.platform === 'win32';
const isLinux = process.platform === 'linux';

const engineDir = isPackaged
  ? path.join(process.resourcesPath, 'engine')
  : path.join(__dirname, 'engine');

const userDataDir = app.getPath('userData');
const dbDataDir = path.join(userDataDir, 'db_data');
const templateDataDir = path.join(engineDir, 'data');

// Helper untuk menemukan executable di engine lokal atau system PATH (Windows / Linux)
function resolveExecutable(preferredPath, fallbackCommand) {
  if (preferredPath && fs.existsSync(preferredPath)) {
    return preferredPath;
  }
  if (fallbackCommand) {
    try {
      const cmd = isWin ? `where ${fallbackCommand}` : `which ${fallbackCommand}`;
      const output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().split('\n')[0].trim();
      if (output && fs.existsSync(output)) {
        return output;
      }
    } catch (e) {}
  }
  return null;
}

function getAppIcon() {
  if (isWin) {
    return path.join(__dirname, 'icon.ico');
  }
  const pngIcon = path.join(__dirname, 'icon.png');
  if (fs.existsSync(pngIcon)) return pngIcon;
  return path.join(__dirname, 'icon.ico');
}

const mysqldExe = isWin
  ? resolveExecutable(path.join(engineDir, 'mysql', 'bin', 'mysqld.exe'), 'mysqld.exe')
  : resolveExecutable(path.join(engineDir, 'mysql', 'bin', 'mysqld'), 'mysqld') || resolveExecutable(null, 'mariadbd') || resolveExecutable(null, 'mariadb');

const phpExe = isWin
  ? resolveExecutable(path.join(engineDir, 'php', 'php.exe'), 'php.exe')
  : resolveExecutable(path.join(engineDir, 'php', 'bin', 'php'), 'php') || resolveExecutable(null, 'php8.3') || resolveExecutable(null, 'php8.2') || resolveExecutable(null, 'php8.1') || resolveExecutable(null, 'php');

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
    if (mysqldExe && fs.existsSync(mysqldExe)) {
      const mysqlArgs = [
        '--no-defaults',
        `--datadir=${dbDataDir.replace(/\\/g, '/')}`,
        `--port=${MYSQL_PORT}`,
        '--bind-address=127.0.0.1'
      ];
      if (isWin) {
        mysqlArgs.push('--console');
      }

      mysqlProcess = spawn(mysqldExe, mysqlArgs, {
        stdio: 'ignore',
        windowsHide: isWin,
        detached: false
      });

      mysqlProcess.on('error', (err) => {
        console.error('MySQL spawn error:', err);
      });
    }

    // 3. Spawn portable / system PHP built-in web server on port 48201
    if (phpExe && fs.existsSync(phpExe)) {
      const phpArgs = [];
      if (fs.existsSync(phpIni)) {
        phpArgs.push('-c', phpIni);
      }
      phpArgs.push(
        '-S', `127.0.0.1:${LOCAL_PORT}`,
        '-t', htdocsDir,
        routerPhp
      );

      phpProcess = spawn(phpExe, phpArgs, {
        stdio: 'ignore',
        windowsHide: isWin,
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
      try { process.kill(phpProcess.pid, isWin ? undefined : 'SIGTERM'); } catch (e) {}
      phpProcess = null;
    }
    if (mysqlProcess && !mysqlProcess.killed) {
      try { process.kill(mysqlProcess.pid, isWin ? undefined : 'SIGTERM'); } catch (e) {}
      mysqlProcess = null;
    }
    // Cleanup any lingering instances on Windows / Linux
    if (isWin) {
      try {
        execSync(`taskkill /F /IM mysqld.exe /FI "MEMUSAGE gt 1000"`, { stdio: 'ignore' });
      } catch (e) {}
    } else {
      try {
        execSync(`pkill -f "mysqld.*--port=${MYSQL_PORT}"`, { stdio: 'ignore' });
      } catch (e) {}
    }
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
    icon: getAppIcon(),
    backgroundColor: '#09090b',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true,
      devTools: false // PROTEKSI EKSTRA: Nonaktifkan DevTools Chromium
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // PROTEKSI EKSTRA: Blokir Shortcut DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // F12
    if (input.key === 'F12') {
      event.preventDefault();
      return;
    }
    // Ctrl+Shift+I / J / C
    if (input.control && input.shift && ['I', 'i', 'J', 'j', 'C', 'c'].includes(input.key)) {
      event.preventDefault();
      return;
    }
    // Ctrl+U (View Source)
    if (input.control && ['u', 'U'].includes(input.key)) {
      event.preventDefault();
      return;
    }
  });

  // PROTEKSI EKSTRA: Nonaktifkan Klik Kanan / Context Menu untuk mencegah Inspect Element
  mainWindow.webContents.on('context-menu', (event) => {
    event.preventDefault();
  });

  // PROTEKSI EKSTRA: Tutup otomatis jika DevTools sempat terbuka secara tak terduga
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });

  // Load the offline application
  loadTargetUrl();

  // Handle external links opening in default browser & prevent unauthorized navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.includes('index.html')) {
      event.preventDefault();
      mainWindow.loadURL(LOCAL_URL);
      return;
    }
    // Mencegah navigasi ke luar localhost di dalam jendela utama
    if (!url.startsWith(LOCAL_BASE)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            devTools: false
          }
        }
      };
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
  const iconPath = getAppIcon();
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
          label: 'ℹ️ Status Database Mandiri Terproteksi',
          click: () => {
            const info = `Mode: DATABASE KOMPUTER LOKAL (100% OFFLINE)\n\nStatus: Terlindungi & Terisolasi.\nSemua data tersimpan privat di laptop Anda.\n\nAplikasi berjalan mandiri tanpa memerlukan internet dan tanpa XAMPP!`;
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Informasi Database Jurnal Guru',
              message: 'Penyimpanan Database Mandiri Terproteksi',
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
          label: 'Tentang Jurnal Guru Digital',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Tentang Jurnal Guru Digital',
              message: 'Jurnal Guru Digital - Kurikulum Merdeka',
              detail: 'Versi 1.0.0 (Windows Desktop Standalone Edition - Proteksi Ekstra)\n\nAplikasi desktop mandiri dengan engine database lokal tertanam (Zero Configuration).\n100% Offline: Data tersimpan aman di laptop Anda tanpa memerlukan XAMPP dan tanpa memerlukan koneksi internet.',
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
