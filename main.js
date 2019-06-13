//'use strict'

 const { app, BrowserWindow , Menu, MenuItem} = require('electron')
 require("./mainIPCResponser")

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  //global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  global.__static = require('path').join(__dirname, '').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
  //: `file://${__dirname}/test/smalltalk/test.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    //width: 800,
    //height: 600,
    useContentSize: true,
    frame:false,
    show:false,
    webPreferences: {
      webSecurity: false
    }
 
  })
  mainWindow.maximize()
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  //mainWindow.webContents.openDevTools()

  //initMenu()

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})








//menu not used
let template = [ 
{
      label: 'Help ( 帮助 ) ',
      role: 'help',
      submenu: [{
          label: 'FeedBack ( 意见反馈 )',
          click: function () {
              electron.shell.openExternal('https://forum.iptchain.net')
          }
      }]
  }
]

function initMenu()
{


    var menubar = new Menu()
 		// File
    const fileMenu = new Menu();
    const menuitem1 = new MenuItem({label:"alalal"})
    fileMenu.append(menuitem1)

		const fileMenuItem = new MenuItem({ label: "file", submenu: fileMenu });

		menubar.append(fileMenuItem);
    Menu.setApplicationMenu(menubar) 

}

