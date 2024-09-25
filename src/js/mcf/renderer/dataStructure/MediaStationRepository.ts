import {MediaStation} from "./MediaStation";
import {MediaStationLocalMetaData} from "../fileHandling/MediaStationLocalMetaData";
import {MediaFileService} from "../fileHandling/MediaFileService";
import {MediaApp} from "./MediaApp";
import {ContentFileService} from "../fileHandling/ContentFileService";
import {MediaFilesMarkedToDeleteService} from "../fileHandling/MediaFilesMarkedToDeleteService";

export interface ICachedMedia{
    contentId:number
    mediaAppId:number
    fileExtension:string
}

export class MediaStationRepository{

    private _allMediaStations: Map<number, MediaStation> = new Map();
    private _mediaStationIdCounter:number = 0;

    private _mediaStationMetaData:MediaStationLocalMetaData;
    private _mediaFileService:MediaFileService;
    private _contentFileService:ContentFileService;
    private _mediaFilesMarkedToDeleteService:MediaFilesMarkedToDeleteService;
    private _mediaStationFactory: (id: number) => MediaStation;

    private _pathToMainFolder:string;
    private _cachedMedia:Map<number, ICachedMedia[]> = new Map();

    constructor(mediaStationMetaData:MediaStationLocalMetaData, pathToMainFolder:string, mediaFileService:MediaFileService = new MediaFileService(), mediaFilesMarkedToDeleteService = new MediaFilesMarkedToDeleteService(), contentFileService:ContentFileService = new ContentFileService(), mediaStationFactory: (id: number) => MediaStation = (id) => new MediaStation(id)) {
        this._mediaStationMetaData = mediaStationMetaData;
        this._pathToMainFolder = pathToMainFolder;
        this._mediaFileService = mediaFileService;
        this._contentFileService = contentFileService;
        this._mediaFilesMarkedToDeleteService = mediaFilesMarkedToDeleteService;
        this._mediaStationFactory = mediaStationFactory;

        this._mediaFileService.init(this._pathToMainFolder)
        this._contentFileService.init(this._pathToMainFolder)
        this._mediaFilesMarkedToDeleteService.init(this._pathToMainFolder)
        this._mediaStationMetaData.init(this._pathToMainFolder + "savedMediaStations.json")
    }

    async loadMediaStations():Promise<Map<string, string>>{
        let loadedMetaData:Map<string, string>;
        let mediaStation:MediaStation;
        let id:number;

        loadedMetaData = await this._mediaStationMetaData.load();

        if(loadedMetaData){
            for (let [key, controllerIp] of loadedMetaData) {
                id = this.addMediaStation(key, false);
                mediaStation = this.findMediaStation(id);

                this._cachedMedia.set(id, await this._mediaFileService.getAllCachedMedia(id));

                console.log("CHECK: ", id, key, controllerIp)

                if(await this.isMediaStationCached(id))
                    mediaStation.importFromJSON(await this._contentFileService.loadFile(id), false);
                else if(controllerIp)
                    mediaStation.addMediaApp(mediaStation.getNextMediaAppId(), "Controller-App nicht erreichbar", controllerIp, MediaApp.ROLE_CONTROLLER);
            }
        }

        return new Promise((resolve) =>{resolve(loadedMetaData)});
    }

    addMediaStation(name:string, save:boolean = true):number{
        let newMediaStation:MediaStation = this._mediaStationFactory(this._mediaStationIdCounter);

        newMediaStation.name = name;

        this._allMediaStations.set(this._mediaStationIdCounter, newMediaStation);

        this._mediaStationIdCounter++;

        if(save)
            this._mediaStationMetaData.save(this.getNameControllerMap());

        return newMediaStation.id;
    }

    findMediaStation(id:number):MediaStation | null{
        let mediaStation:MediaStation = this._allMediaStations.get(id);

        if(!mediaStation)
            return null;

        return mediaStation;
    }

    /**
     * deletes the media Station and removes all cached media files if there are any
     *
     * @param {number} id
     */
    async deleteMediaStation(id:number):Promise<void> {
        let mediaArr:ICachedMedia[];

        if(await this.isMediaStationCached(id))
            this.removeCachedMediaStation(id);

        this._allMediaStations.delete(id);
        this._mediaStationMetaData.save(this.getNameControllerMap());

        if(this._cachedMedia.has(id)){

            mediaArr = this._cachedMedia.get(id);

            for(let i:number = 0; i < mediaArr.length; i++)
                this._mediaFileService.deleteFile(id, mediaArr[i].contentId, mediaArr[i].mediaAppId, mediaArr[i].fileExtension);

            this._cachedMedia.delete(id);
        }
    }

    updateMediaStation(mediaStation:MediaStation):void {
        if(!this._allMediaStations.get(mediaStation.id))
            throw new Error(String("MediaStationRepository: update MediaStation not possible, because ID does not exist in the repo: "+ mediaStation.id));

        this._allMediaStations.set(mediaStation.id, mediaStation);
    }

    /**
     * updates the mediastation and saves the name of it and the ip of the controller in a json-file
     *
     * @param {MediaStation} mediaStation
     */
    updateAndSaveMediaStation(mediaStation:MediaStation):void {
        this.updateMediaStation(mediaStation);

        this._mediaStationMetaData.save(this.getNameControllerMap());
    }

    cacheMediaStation(id:number):void{
        let mediaStation:MediaStation = this._allMediaStations.get(id);
        if(!mediaStation)
            throw new Error(String("Caching MediaStation not possible, because ID does not exist in the repo: "+ id));

        this._contentFileService.saveFile(id,mediaStation.exportToJSON() );
    }

    removeCachedMediaStation(id:number):void{
        let mediaStation:MediaStation = this._allMediaStations.get(id);
        if(!mediaStation)
            throw new Error(String("Deleting MediaStation-Cache not possible, because ID does not exist in the repo: "+ id));

        this._contentFileService.deleteFile(id);
    }

    async isMediaStationCached(id:number):Promise<boolean>{
        let mediaStation:MediaStation = this._allMediaStations.get(id);
        if(!mediaStation)
            throw new Error(String("Checking MediaStation-Cache not possible, because ID does not exist in the repo: "+ id));

        return await this._contentFileService.fileExists(id);
    }

    async cacheMedia(mediaStationId: number, contentId:number, mediaAppId:number,fileExtension:string, payload:Uint8Array):Promise<void>{
        let cachedMediaArr:ICachedMedia[];
        await this._mediaFileService.saveFile(mediaStationId, contentId, mediaAppId, fileExtension, payload);

        if(!this._cachedMedia.has(mediaStationId))
            this._cachedMedia.set(mediaStationId, []);

        cachedMediaArr = this._cachedMedia.get(mediaStationId);

        cachedMediaArr.push( {contentId: contentId, mediaAppId:mediaAppId, fileExtension:fileExtension});
    }

    /**
     * returns false if the mediastation-ID does not exist or if there is no cached media for the passed contentId and
     * mediaApp-ID.
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaAppId
     * @returns {boolean}
     */
    isMediaCached(mediaStationId: number, contentId:number, mediaAppId:number): boolean{
        let cachedArr:ICachedMedia[] = this._cachedMedia.get(mediaStationId);

        if(!cachedArr)
            return false;

        let cachedMediaIndex:number = cachedArr.findIndex((cachedMedia:ICachedMedia  )=>{
            return cachedMedia.contentId === contentId && cachedMedia.mediaAppId === mediaAppId;
        });

        return cachedMediaIndex !== -1;
    }

    /**
     * throws an error if the mediastation-ID does not exist or if there is no cached media for the passed contentId and
     * mediaApp-ID.
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaAppId
     * @returns {boolean}
     */
    deleteCachedMedia(mediaStationId: number, contentId:number, mediaAppId:number):void{
        let cachedArr:ICachedMedia[] = this._cachedMedia.get(mediaStationId);

        if(!cachedArr)
            throw new Error("No media cached for mediastation with ID: " + mediaStationId);

        let indexToDelete:number = cachedArr.findIndex((cachedMedia:ICachedMedia  )=>{
            return cachedMedia.contentId === contentId && cachedMedia.mediaAppId === mediaAppId;
        });

        if(indexToDelete === -1)
            throw new Error("No media cached for media-App-ID " + mediaAppId + " in content-ID "+ contentId + " of mediastation with ID: " + mediaStationId);

        this._mediaFileService.deleteFile(mediaStationId, contentId, mediaAppId, cachedArr[indexToDelete].fileExtension);

        cachedArr.splice(indexToDelete, 1);

        if(cachedArr.length <= 0)
            this._cachedMedia.delete(mediaStationId);
    }

    async getCachedMediaFile(mediaStationId: number, contentId:number, mediaAppId:number, fileExtension:string):Promise<Uint8Array|null>{
        return await this._mediaFileService.loadFile(mediaStationId, contentId, mediaAppId, fileExtension);
    }

    getAllCachedMedia():Map<number, ICachedMedia[]>{
        return this._cachedMedia;
    }

    async markMediaIDtoDelete(mediaStationId:number,mediaAppId:number, id:number):Promise<void>{

        if(!this.findMediaStation(mediaStationId))
            throw new Error("Adding media-id to ids which should be deleted not possible, because the mediaStation does not exist: " + mediaStationId);

        await this._mediaFilesMarkedToDeleteService.addID(mediaStationId,mediaAppId, id);
    }

    async deleteStoredMediaID(mediaStationId:number, mediaAppId:number, id:number):Promise<void>{
        if(!this.findMediaStation(mediaStationId))
            throw new Error("Deleting a media-id is not possible, because the mediaStation does not exist: "+ mediaStationId);

        await this._mediaFilesMarkedToDeleteService.removeID(mediaStationId, mediaAppId, id);
    }

    async getAllMediaIDsToDelete(mediaStationId:number):Promise<Map<number, number[]>>{
        if(!this.findMediaStation(mediaStationId))
            throw new Error("Getting the media-IDs marked for deletion for mediastation does not work, because the mediastation does not exist: "+ mediaStationId);

        return await this._mediaFilesMarkedToDeleteService.getAllIDS(mediaStationId);
    }

    private getNameControllerMap():Map<string, string> {
        let map:Map<string, string> = new Map();
        let controllerIp:string;

        this._allMediaStations.forEach((mediaStation:MediaStation, key:number)=>{
            controllerIp = mediaStation.getControllerIp();
            map.set(mediaStation.name, controllerIp);
        });

        return map;
    }
}