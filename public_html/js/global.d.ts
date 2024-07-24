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
        json: any;
        errorsInJson: string;
    }

    interface IBackendFileService{
        saveFile(path:string, data:Uint8Array):string;
        deleteFile(path:string):string;
        loadFile(path:string):Prowmise<Uint8Array|null>;
        fileExists(path:string):boolean;
    }

    interface IBackenNetworkService{
        ping(ip:string):boolean;
    }
}