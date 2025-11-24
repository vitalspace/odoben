import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Disable web security to allow local file loading if needed, and avoid CORS in dev
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#242424',
      symbolColor: '#ffffff',
    },
    backgroundColor: '#1a1a1a', // Set background color to match app to avoid white flash
  });

  // Check if we are in development mode
  const isDev = !app.isPackaged;

  if (isDev) {
    // In development, load the Vite dev server
    win.loadURL('http://localhost:5175');
    // Open the DevTools.
    win.webContents.openDevTools();
  } else {
    // In production, load the index.html from the dist folder
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});