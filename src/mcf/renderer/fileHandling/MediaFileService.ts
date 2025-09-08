import {ICachedMedia} from "src/mcf/renderer/fileHandling/MediaFileCacheHandler";

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
    async saveFile(mediaStationId:number, contentId:number, mediaAppId:number, fileExtension:string, payload:Uint8Array):Promise<void>{
        let pathToFile:string = this._createFilePath(mediaStationId, contentId, mediaAppId, fileExtension);

        console.log("Save Media-File: ", this._pathToFolder + pathToFile);
        await this._backendFileService.saveFile(this._pathToFolder + pathToFile, payload);
    }

    /**
     * creates a file-name out of content-id and mediaAppId and the fileExtension and saves it in the folder with mediaStationId as
     * folder-name
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaAppId
     * @param {string} fileExtension
     * @param {File} fileInstance
     */
    async saveFileByPath(mediaStationId:number, contentId:number, mediaAppId:number, fileExtension:string, fileInstance:File):Promise<void>{
        let pathToFile:string = this._createFilePath(mediaStationId, contentId, mediaAppId, fileExtension);

        console.log("Save Media-File: ", this._pathToFolder + pathToFile);
        await this._backendFileService.saveFileByPath(this._pathToFolder + pathToFile, fileInstance);

        fileInstance = null;
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

    async getAllCachedMedia(mediaStationId:number):Promise<ICachedMedia[]>{
        const fileNames:string[] = await this._backendFileService.getAllFileNamesInFolder(this._pathToFolder + mediaStationId.toString() + "\\cachedMedia\\");
        let fileName:string;
        let splittedName:string[];
        let allCachedMedia:ICachedMedia[] = [];

        for(fileName of fileNames){
            console.log("FILENAME: ", fileName)
            splittedName = fileName.split(".");

            if(splittedName.length !== 3)
                throw new Error("Not-valid file found in the cache-folder: " + fileName);

            allCachedMedia.push({
                contentId: Number(splittedName[0]),
                mediaAppId: Number(splittedName[1]),
                fileExtension: splittedName[2]
            });
        }

        return allCachedMedia;
    }

    private _createFilePath(mediaStationId:number, contentId:number, mediaAppId:number, fileExtension:string):string{
        return mediaStationId.toString() + "\\cachedMedia\\" + contentId.toString()+ "." + mediaAppId.toString() + "." + fileExtension;
    }
}