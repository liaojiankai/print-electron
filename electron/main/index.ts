// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')

import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { release } from 'os'
import { join } from 'path'
import printer from './printer'

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: '打印过磅单',
    width: 1080,
    height: 800,
    icon: join(process.env.PUBLIC, 'favicon.svg'),
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  ipcMain.on('printData', async (event, data) => {
    console.log('>>>>printData:')
    // try {
    //   event.reply('printData', ['1']);
    //   event.reply('printData', ['filePath1', `${printer.basePath}/output.pdf`]);

    //   // console.log('xxxx');
    //   const list: any = await win?.webContents.getPrintersAsync();
    //   event.reply('printData', ['print ipp', list[0].options['device-uri']]);
    console.log('data: ', data)
    await printer.createPDF(data);
    //   event.reply('printData', ['2']);

    //   // console.log('xxxx');
    //   // console.log('xxxx', list[0].options['device-uri']);
    //   event.reply('printData', ['print', list]);
    //   const doc = await fs.readFileSync(`${printer.basePath}/output.pdf`);
    //   // printer.printPDF(list[0].options['device-uri'], doc);
    //   event.reply('printData', ['filePath', `${printer.basePath}/output.pdf`]);
    // } catch (error) {
    //   console.log(error)
    //   event.reply('printData', ['err', JSON.stringify(error)]);
    // }

    setTimeout(() => {
      console.log('process.env.PUBLIC:', process.env.PUBLIC)
      let winPrint = new BrowserWindow({width: 800, height: 600, show: false });
      winPrint.loadURL(`file://${process.env.PUBLIC}/output.pdf`);
      // if pdf is loaded start printing.
      winPrint.webContents.on('did-finish-load', () => {
        winPrint.webContents.print({silent: false});
        // console.log('xxxx')
        winPrint = null
      });
    }, 200)
  });
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg })
  } else {
    childWindow.loadURL(`${url}#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})
