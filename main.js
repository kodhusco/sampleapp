
const {app, BrowserWindow, ipcMain} = require('electron');
const {autoUpdater} = require("electron-updater");
const url = require('url');
const path = require('path');


let win;
const createWindow = () => {
  win = new BrowserWindow({width: 800, height: 750});

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.openDevTools();

  win.on('closed', () => {
    win = null;
  });
};
app.on('ready', () => {
    createWindow();
    autoUpdater.checkForUpdates();
});

autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('updateReady')
});

// when receiving a quitAndInstall signal, quit and install the new version ;)
ipcMain.on("quitAndInstall", (event, arg) => {
    autoUpdater.quitAndInstall();
})

app.on('activate', () => {
  if (win == null) {
    createWindow();
  }
});