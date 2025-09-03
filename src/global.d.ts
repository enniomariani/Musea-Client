// global.d.ts
export {};

declare global {
    interface Window {
        backend:IBackend;
        backendFileService:IBackendFileService;
        backendNetworkService:IBackenNetworkService;
    }

    interface IBackend {
        loadSettings():BackendData;
    }

    interface BackendData{
        pathToDataFolder: string;
    }

    interface IBackendFileService{
        saveFile(path:string, data:Uint8Array):string;
        saveFileByPath(path:string, fileInstance:File):Promise<string>;
        deleteFile(path:string):string;
        loadFile(path:string):Promise<Uint8Array|null>;
        fileExists(path:string):Promise<boolean>;
        getAllFileNamesInFolder(path:string):Promise<string[]>;
    }

    interface IBackenNetworkService{
        ping(ip:string):boolean;
    }
}