
const {app, BrowserWindow, dialog} = require('electron');
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
app.on('ready', createWindow);
app.on('activate', () => {
  if (win == null) {
    createWindow();
  }
});