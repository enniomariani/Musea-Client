
export class MediaFileService {

    private _backendFileService:IBackendFileService;
    private _pathToFolder:string;

    constructor( backendFileService:IBackendFileService = window.backendFileService) {
        this._backendFileService = backendFileService;
    }

    init(pathToFolder:string):void{
        this._pathToFolder = pathToFolder;
    }

    /**
     * creates a file-name out of content-id and mediaAppId and the fileExtension and saves it in the folder with mediaStationId as
     * folder-name
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaAppId
     * @param {string} fileExtension
     * @param {Uint8Array} payload
     */
    saveFile(mediaStationId:number, contentId:number, mediaAppId:number, fileExtension:string, payload:Uint8Array):void{
        let pathToFile:string = this._createFilePath(mediaStationId, contentId, mediaAppId, fileExtension);

        console.log("Save Media-File: ", this._pathToFolder + pathToFile, payload);
        this._backendFileService.saveFile(this._pathToFolder + pathToFile, payload);
    }

    deleteFile(mediaStationId:number, contentId:number, mediaAppId:number, fileExtension:string):void{
        let pathToFile:string = this._createFilePath(mediaStationId, contentId, mediaAppId, fileExtension);

        console.log("Delete Media-File: ",  this._pathToFolder + pathToFile);
        this._backendFileService.deleteFile(this._pathToFolder + pathToFile);
    }

    async fileExists(mediaStationId:number, contentId:number, mediaAppId:number, fileExtension:string):Promise<boolean>{
        let pathToFile:string = this._createFilePath(mediaStationId, contentId, mediaAppId, fileExtension);
        return await this._backendFileService.fileExists(this._pathToFolder + pathToFile);
    }

    async loadFile(mediaStationId:number, contentId:number, mediaAppId:number, fileExtension:string):Promise<Uint8Array | null>{
        let pathToFile:string = this._createFilePath(mediaStationId, contentId, mediaAppId, fileExtension);
        console.log("Load Media-File: ",  this._pathToFolder + pathToFile);
        return this._backendFileService.loadFile(this._pathToFolder + pathToFile);
    }

    private _createFilePath(mediaStationId:number, contentId:number, mediaAppId:number, fileExtension:string):string{
        return mediaStationId.toString() + "\\" + contentId.toString()+ "." + mediaAppId.toString() + "." + fileExtension;
    }
}