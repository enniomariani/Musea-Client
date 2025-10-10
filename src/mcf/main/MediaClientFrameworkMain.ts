import {ipcMain} from 'electron';
import {MainFileService} from "./MainFileService";
import ping from "ping";
import * as fs from 'fs';
import * as net from "node:net";

export class MediaClientFrameworkMain {

    private mainFileService: MainFileService;

    constructor(mainFileService: MainFileService = new MainFileService()) {
        this.mainFileService = mainFileService;
    }

    init(): void {
        //load/save/delete files
        ipcMain.handle('mediaClientFramework:saveFile', async (event:Electron.IpcMainInvokeEvent, path: string, data: Uint8Array) => {
            const dataAsNodeBuffer:Buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
            return await   this.mainFileService.saveFile(path, dataAsNodeBuffer);
        });

        ipcMain.handle('mediaClientFramework:saveFileByPath', async (event:Electron.IpcMainInvokeEvent, path: string, pathToLoad: string) => {
                        try {
                let dataAsNodeBuffer:Buffer = await fs.promises.readFile(pathToLoad);
                return await this.mainFileService.saveFile(path, dataAsNodeBuffer);
            } catch (err:any) {
                return "Error: " + err.message;
            }
        });

        ipcMain.handle('mediaClientFramework:deleteFile', (event:Electron.IpcMainInvokeEvent, path: string) => {
            return this.mainFileService.delete(path);
        });

        ipcMain.handle('mediaClientFramework:fileExists', (event:Electron.IpcMainInvokeEvent, path: string) => {
            return this.mainFileService.fileExists(path);
        });

        ipcMain.handle('mediaClientFramework:getAllFileNamesInFolder', (event:Electron.IpcMainInvokeEvent, path: string) => {
            return this.mainFileService.getAllFileNamesInFolder(path);
        });

        ipcMain.handle('mediaClientFramework:loadFile', async (event:Electron.IpcMainInvokeEvent, path: string) => {
            return await this.mainFileService.loadFile(path);
        });

        //ping
        ipcMain.handle('backendNetworkService:ping', async (event:Electron.IpcMainInvokeEvent, ip: string):Promise<boolean> => {
            const isValidIp:boolean = this._isValidIp(ip);

            if(!isValidIp)
                return false;

            const answer = await ping.promise.probe(ip);
            return answer.alive;
        });
    }

    private _isValidIp(ipAddress:string) {
        // For IPv4
        if (net.isIPv4(ipAddress) || ipAddress === "localhost") {
            return true;
        }

        // For IPv6
        if (net.isIPv6(ipAddress)) {
            return true;
        }

        return false;
    }
}