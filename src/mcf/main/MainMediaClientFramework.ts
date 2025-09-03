import {BrowserWindow, ipcMain} from 'electron';
import {MainFileService} from "./MainFileService";
import ping from "ping";
import * as fs from 'fs';

export class MainMediaClientFramework {

    private mainFileService: MainFileService;
    private mainWindow: BrowserWindow;

    constructor(mainWindow:BrowserWindow, mainFileService: MainFileService = new MainFileService()) {
        this.mainWindow = mainWindow;
        this.mainFileService = mainFileService;
    }

    init(): void {
        //load/save/delete files
        ipcMain.handle('mediaClientFramework:saveFile', async (event:Electron.IpcMainEvent, path: string, data: Uint8Array) => {
            const dataAsNodeBuffer:Buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
            return await   this.mainFileService.saveFile(path, dataAsNodeBuffer);
        });

        ipcMain.handle('mediaClientFramework:saveFileByPath', async (event:Electron.IpcMainEvent, path: string, pathToLoad: string) => {

            console.log("load file from path: ", pathToLoad)

            try {
                // Read the file directly in the main process
                let dataAsNodeBuffer = await fs.promises.readFile(pathToLoad);
                return await this.mainFileService.saveFile(path, dataAsNodeBuffer);
            } catch (err) {
                console.error("Error saving file:", err);
                return "Error: " + err.message;
            }
        });

        ipcMain.handle('mediaClientFramework:deleteFile', (event:Electron.IpcMainEvent, path: string) => {
            return this.mainFileService.delete(path);
        });

        ipcMain.handle('mediaClientFramework:fileExists', (event:Electron.IpcMainEvent, path: string) => {
            return this.mainFileService.fileExists(path);
        });

        ipcMain.handle('mediaClientFramework:getAllFileNamesInFolder', (event:Electron.IpcMainEvent, path: string) => {
            return this.mainFileService.getAllFileNamesInFolder(path);
        });

        ipcMain.handle('mediaClientFramework:loadFile', async (event:Electron.IpcMainEvent, path: string) => {
            return await this.mainFileService.loadFile(path);
        });

        //ping
        ipcMain.handle('backendNetworkService:ping', async (event:Electron.IpcMainEvent, ip: string):Promise<boolean> => {
            let answer = await ping.promise.probe(ip);

            console.log("MainMediaClientFramework, ping-answer: ", ip, answer);

            return answer.alive;
        });
    }
}