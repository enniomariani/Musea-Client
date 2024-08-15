
import {app, BrowserWindow} from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join} from 'path';

import {CreateWindow} from "./CreateWindow";
import {GlobalSettingsFactory} from "./globalSettings/GlobalSettingsFactory";
import {MainMediaClientFramework} from "./mediaClientFramework/MainMediaClientFramework";
import {InitSettings} from "./globalSettings/InitSettings";

/**
 * the main.ts is loaded by electron and has access to file-system, etc.
 * if a BrowserWindow is created, HTML and js can be loaded in the window (for example the renderer.ts)
 *
 */

//size of main-window
const windowWidth:number = 1920;
const windowHeight:number = 1080;

const filename:string = fileURLToPath(import.meta.url);
const __dirname:string = dirname(filename);

//the NODE_ENV-variable is set before starting the app to "development", if the app is running on
//the development-system
const environment:string = process.env.NODE_ENV;

let allSettingsByName = null;

let initSettings:InitSettings = new InitSettings();

let mainWindow:BrowserWindow = null;
let mainMediaServerFramework:MainMediaClientFramework;

if (environment === 'development') {

//if it is not made like this, the import throws an error in the exported exe (I do not know why)
    import("electron-reloader").then(electronReloader=>{

        //temporary fix because in ESM6 context the "module" object does not exist anymore, but electron-reloader needs it
        const module:NodeModule =  {
            children: [],
            exports: null,
            filename: fileURLToPath(import.meta.url),
            id: "",
            parent: null,
            isPreloading: true,
            loaded: false,
            path: "",
            paths: [],
            require: null
        }
        // activate auto-reload on saved files (npm-package "electron-reloader")
        try {
            electronReloader.default(module, {
                debug: true, watchRenderer: true
            });
        } catch (error) {
            console.log('Error: ', error);
        }
    });
}

app.whenReady().then(async () => {
    let createWindow:CreateWindow = new CreateWindow();
    console.log("Main: load settings-file...");
    allSettingsByName = initSettings.init(environment);

    console.log("Main: create window...");
    mainWindow = await createWindow.create(windowWidth, windowHeight,allSettingsByName[GlobalSettingsFactory.IS_FULLSCREEN], !allSettingsByName[GlobalSettingsFactory.MOUSE_ENABLED],
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