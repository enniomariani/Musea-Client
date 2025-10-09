import {BrowserWindow} from "electron";

export class CreateWindow{

    private _win:BrowserWindow | null = null;

    constructor() {}

    async create(windowWidth:number, windowHeight:number, pathToIndexHtml:string, pathToPreload:string, openDevTools:boolean):Promise<BrowserWindow> {
        console.log("create window with path to index.html: ", pathToIndexHtml)
        console.log("create window with path to preload.js: ", pathToPreload)

        this._win = new BrowserWindow({
            width: windowWidth, height: windowHeight, kiosk: false, //hides the menubar when fullscreen is set to true in the settings-file
            autoHideMenuBar: false, fullscreen: false, webPreferences: {
                nodeIntegration: false, contextIsolation: true,
                preload: pathToPreload,sandbox: true
            },
        });

        await this._win.loadFile(pathToIndexHtml);

        if (openDevTools) this._win.webContents.openDevTools();

        //initially sets the focus to the created electron-window
        this._win.show();

        return this._win;
    }

    close(){

    }
}