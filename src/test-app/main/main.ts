import {app, BrowserWindow, ipcMain} from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join} from 'path';
import {MediaClientFrameworkMain} from "main/MediaClientFrameworkMain.js";

//size of main-window
const windowWidth:number = 1920;
const windowHeight:number = 1080;

const filename:string = fileURLToPath(import.meta.url);
const __dirname:string = dirname(filename);

//the NODE_ENV-variable is set before starting the app to "development", if the app is running on
//the development-system
const environment:string | undefined = process.env.NODE_ENV;

let mainWindow:BrowserWindow;
let mainMediaServerFramework:MediaClientFrameworkMain;

//this is necessary because the path to the data-folder is in public_html/daten in the dev-environment but
//in the resources-folder in the production-environment. If in the production-env nothing is specified as path, it looks in the asar-package
const pathToDataFolder:string = environment === 'development' ? join(__dirname, '..', '..', '..','daten\\') : join(process.resourcesPath, '\\daten\\');

app.whenReady().then(async () => {
    mainWindow = new BrowserWindow({
        width: windowWidth, height: windowHeight, kiosk: false, //hides the menubar when fullscreen is set to true in the settings-file
        autoHideMenuBar: false, fullscreen: false, webPreferences: {
            nodeIntegration: false, contextIsolation: true,
            preload: join(__dirname, 'preload.js'),sandbox: true
        },
    });

    await mainWindow.loadFile(join(__dirname, '../index.html'));
    mainWindow.webContents.openDevTools();
    mainWindow.show(); //initially sets the focus to the created electron-window

    mainMediaServerFramework = new MediaClientFrameworkMain(environment === 'development');
    mainMediaServerFramework.init();

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    console.log("Main: start-process finished.");
});

ipcMain.handle('app:load-settings', (event, args) => {
    console.log("Main: send global-settings-json to renderer: ", pathToDataFolder);

    return {pathToDataFolder: pathToDataFolder};
});