const electron = require('electron')
const app=electron.app;
const BrowserWindow=electron.BrowserWindow;
const ejs=require("ejs-electron");



function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // node availabe to electron
      nodeIntegration: true,
      enableRemoteModule:true
    }
   
  })

  win.loadFile('index.ejs').then(()=>{
   // win.webContents.openDevTools();
    win.maximize();
  })
}

app.whenReady().then(createWindow)

// for mac
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
