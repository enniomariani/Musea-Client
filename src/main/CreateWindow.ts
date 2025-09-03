import {BrowserWindow} from "electron";

export class CreateWindow{

    _win = null;

    //eventlistener-functions
    _onShowWindowFunc = this._onShowWindow.bind(this);
    _onBlurFunc = this._onBlur.bind(this);

    constructor() {}

    async create(windowWidth:number, windowHeight:number, pathToIndexHtml:string, pathToPreload:string, openDevTools:boolean):Promise<BrowserWindow> {
        console.log("create window with path to index.html: ", pathToIndexHtml)
        console.log("create window with path to preload.js: ", pathToPreload)

        this._win = new BrowserWindow({
            width: windowWidth, height: windowHeight, kiosk: false, //hides the menubar when fullscreen is set to true in the settings-file
            autoHideMenuBar: false, fullscreen: false, webPreferences: {
                nodeIntegration: false, contextIsolation: true,
                preload: pathToPreload
            }
        });

        await this._win.loadFile(pathToIndexHtml);

        if (openDevTools) this._win.webContents.openDevTools();

        //initially sets the focus to the created electron-window
        this._win.on('show', this._onShowWindowFunc);
        this._win.show();

        return this._win;
    }

    _onBlur(){
        this._win.focus();
    }

    _onShowWindow(){
        this._win.focus();
    }

    close(){
        this._win.off('blur', this._onBlurFunc);
        this._win.off('show', this._onShowWindowFunc);
    }
}