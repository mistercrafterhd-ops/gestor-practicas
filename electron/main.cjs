const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Gestor de Prácticas",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173').then(() => {
      console.log("REACT_APP_LOADED_SUCCESSFULLY_IN_DEV");
    }).catch(e => {
      console.log("ERROR_LOADING_REACT_APP", e);
    });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html')).then(() => {
      console.log("REACT_APP_LOADED_SUCCESSFULLY_IN_PROD");
    }).catch(e => {
      console.log("ERROR_LOADING_REACT_APP", e);
    });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
