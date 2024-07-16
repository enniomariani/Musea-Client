import {BrowserWindow} from "electron";

export class CreateWindow{

    _win = null;

    //eventlistener-functions
    _onShowWindowFunc = this._onShowWindow.bind(this);
    _onDOMReadyFunc = this._onDOMReady.bind(this);
    _onBlurFunc = this._onBlur.bind(this);

    constructor() {}

    async create(windowWidth:number, windowHeight:number, setFullscreen:boolean, disableMouseCursor:boolean, pathToIndexHtml:string, pathToPreload:string, openDevTools:boolean):Promise<BrowserWindow> {
        console.log("create window with path to index.html: ", pathToIndexHtml)
        console.log("create window with path to preload.js: ", pathToPreload)

        this._win = new BrowserWindow({
            width: windowWidth, height: windowHeight, kiosk: setFullscreen, //hides the menubar when fullscreen is set to true in the settings-file
            autoHideMenuBar: setFullscreen, fullscreen: setFullscreen, webPreferences: {
                nodeIntegration: false, contextIsolation: true,
                preload: pathToPreload
            }
        });

        // Make the window always on top, if fullscreen is chosen
        if (setFullscreen) {
            this._win.on('blur', this._onBlurFunc);
            this._win.setAlwaysOnTop(true, "screen-saver");
        }

        //if the mouse-pointer is disabled in the settings-file, hide it in every css-object
        if (disableMouseCursor)
            this._win.webContents.on('dom-ready', this._onDOMReadyFunc);

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

    _onDOMReady(){
        let css = '* { cursor: none !important; }';
        this._win.webContents.insertCSS(css);
    }

    _onShowWindow(){
        this._win.focus();
    }

    close(){
        this._win.off('dom-ready', this._onDOMReadyFunc);
        this._win.off('blur', this._onBlurFunc);
        this._win.off('show', this._onShowWindowFunc);
    }
}