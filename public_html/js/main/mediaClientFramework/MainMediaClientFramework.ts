import {BrowserWindow, ipcMain} from 'electron';
import {MainFileService} from "./MainFileService";

export class MainMediaClientFramework {

    private mainFileService: MainFileService;
    private mainWindow: BrowserWindow;

    constructor(mainWindow:BrowserWindow, mainFileService: MainFileService = new MainFileService()) {
        this.mainWindow = mainWindow;
        this.mainFileService = mainFileService;
    }

    init(): void {
        //load/save/delete files
        ipcMain.handle('mediaClientFramework:saveFile', (event:Electron.IpcMainEvent, path: string, data: Uint8Array) => {
            let dataAsNodeBuffer:Buffer = Buffer.from(data);
            return this.mainFileService.saveFile(path, dataAsNodeBuffer);
        });

        ipcMain.handle('mediaClientFramework:deleteFile', (event:Electron.IpcMainEvent, path: string) => {
            return this.mainFileService.delete(path);
        });

        ipcMain.handle('mediaClientFramework:loadFile', (event:Electron.IpcMainEvent, path: string) => {
            let loadedFileData:Buffer|null = this.mainFileService.loadFile(path);
            let fileDataAsUint8Array:Uint8Array;

            console.log("MainMediaClientFramework: file-data loaded", loadedFileData);

            if(loadedFileData === null)
                return null;
            else{
                fileDataAsUint8Array = new Uint8Array(loadedFileData);
                return fileDataAsUint8Array;
            }
        });
    }
}