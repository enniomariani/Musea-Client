import {app, BrowserWindow, ipcMain} from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join} from 'path';

import {CreateWindow} from "./CreateWindow";
import {MainMediaClientFramework} from "../mcf/main/MainMediaClientFramework";

//size of main-window
const windowWidth:number = 1920;
const windowHeight:number = 1080;

const filename:string = fileURLToPath(import.meta.url);
const __dirname:string = dirname(filename);

//the NODE_ENV-variable is set before starting the app to "development", if the app is running on
//the development-system
const environment:string = process.env.NODE_ENV;

let mainWindow:BrowserWindow = null;
let mainMediaServerFramework:MainMediaClientFramework;

app.whenReady().then(async () => {
    let createWindow:CreateWindow = new CreateWindow();

    console.log("Main: create window...");
    mainWindow = await createWindow.create(windowWidth, windowHeight,false, false,
        join(__dirname, '../../index.html'),join(__dirname, 'preload.js'),environment === 'development');

    console.log("MAIN WINDOW: ", mainWindow)

    mainMediaServerFramework = new MainMediaClientFramework(mainWindow);
    mainMediaServerFramework.init();

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            createWindow.close();
            app.quit();
        }
    });

    console.log("Main: start-process finished.");
});

ipcMain.handle('app:load-settings', (event, args) => {
    let pathToDataFolder: string;

    //this is necessary because the path to the data-folder is in public_html/daten in the dev-environment but
    //in the resources-folder in the production-environment. If in the production-env nothing is specified as path, it looks in the asar-package
    pathToDataFolder = environment === 'development' ? join(__dirname, '..', '..', 'daten\\') : join(process.resourcesPath, '\\daten\\');

    console.log("Main: send global-settings-json to renderer: ", pathToDataFolder);

    return {pathToDataFolder: pathToDataFolder};
});