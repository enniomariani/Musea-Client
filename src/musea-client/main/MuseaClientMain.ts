import {ipcMain} from 'electron';
import {MainFileService} from "main/MainFileService.js";
import ping from "ping";
import * as fs from 'fs';
import * as net from "node:net";

export interface IMainFileService {
    saveFile(path:string, data:Uint8Array):Promise<string>;
    saveFileByPath(path:string, fileInstance:File):Promise<string>;
    deleteFile(path:string):string;
    loadFile(path:string):Promise<Uint8Array|null>;
    fileExists(path:string):Promise<boolean>;
    getAllFileNamesInFolder(path:string):Promise<string[]>;
}

export interface IMainNetworkService {
    ping(ip:string):Promise<boolean>;
}

export class MuseaClientMain {
    private _mainFileService: MainFileService;

    constructor(pathToDataFolder:string) {
        this._mainFileService = new MainFileService(pathToDataFolder);
    }

    init(): void {
        //load/save/delete files
        ipcMain.handle('museaClient:saveFile', async (event:Electron.IpcMainInvokeEvent, path: string, data: Uint8Array) => {
            const dataAsNodeBuffer:Buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
            return await   this._mainFileService.saveFile(path, dataAsNodeBuffer);
        });

        ipcMain.handle('museaClient:saveFileByPath', async (event:Electron.IpcMainInvokeEvent, path: string, pathToLoad: string) => {
                        try {
                let dataAsNodeBuffer:Buffer = await fs.promises.readFile(pathToLoad);
                return await this._mainFileService.saveFile(path, dataAsNodeBuffer);
            } catch (err:any) {
                return "Error: " + err.message;
            }
        });

        ipcMain.handle('museaClient:deleteFile', (event:Electron.IpcMainInvokeEvent, path: string) => {
            return this._mainFileService.delete(path);
        });

        ipcMain.handle('museaClient:fileExists', (event:Electron.IpcMainInvokeEvent, path: string) => {
            return this._mainFileService.fileExists(path);
        });

        ipcMain.handle('museaClient:getAllFileNamesInFolder', (event:Electron.IpcMainInvokeEvent, path: string) => {
            return this._mainFileService.getAllFileNamesInFolder(path);
        });

        ipcMain.handle('museaClient:loadFile', async (event:Electron.IpcMainInvokeEvent, path: string) => {
            return await this._mainFileService.loadFile(path);
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