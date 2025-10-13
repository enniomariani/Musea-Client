import {MediaStation} from "./MediaStation";
import {MediaStationLocalMetaData} from "../fileHandling/MediaStationLocalMetaData";
import {MediaApp, MediaAppRole} from "./MediaApp";
import {ContentFileService} from "../fileHandling/ContentFileService";
import {MediaFilesMarkedToDeleteService} from "../fileHandling/MediaFilesMarkedToDeleteService";
import {TagRegistry} from "renderer/registries/TagRegistry";
import {MediaAppRegistry} from "renderer/registries/MediaAppRegistry";
import {MediaFileCacheHandler} from "renderer/fileHandling/MediaFileCacheHandler";

export class MediaStationRepository{

    private _allMediaStations: Map<number, MediaStation> = new Map();
    private _mediaStationIdCounter:number = 0;

    private _mediaStationMetaData:MediaStationLocalMetaData;
    private _contentFileService:ContentFileService;
    private _mediaFilesMarkedToDeleteService:MediaFilesMarkedToDeleteService;
    private _mediaStationFactory: (id: number) => MediaStation;

    private _mediaCacheHandler:MediaFileCacheHandler;

    private _pathToMainFolder:string;

    constructor(mediaStationMetaData:MediaStationLocalMetaData, pathToMainFolder:string, mediaCacheHandler:MediaFileCacheHandler = new MediaFileCacheHandler(pathToMainFolder), mediaFilesMarkedToDeleteService = new MediaFilesMarkedToDeleteService(), contentFileService:ContentFileService = new ContentFileService(), mediaStationFactory: (id: number) => MediaStation = (id) => new MediaStation(id, new TagRegistry(), new MediaAppRegistry())) {
        this._mediaStationMetaData = mediaStationMetaData;
        this._pathToMainFolder = pathToMainFolder;
        this._contentFileService = contentFileService;
        this._mediaFilesMarkedToDeleteService = mediaFilesMarkedToDeleteService;
        this._mediaStationFactory = mediaStationFactory;

        this._mediaCacheHandler = mediaCacheHandler;
        this._contentFileService.init(this._pathToMainFolder)
        this._mediaFilesMarkedToDeleteService.init(this._pathToMainFolder)
        this._mediaStationMetaData.init(this._pathToMainFolder + "savedMediaStations.json")
    }

    /**
     * Load all media-stations with corresponding controller-ips from the saved json.
     * Reset the mediaStationIdCounter and clears all mediastations added before calling this method.
     *
     * @returns {Promise<Map<string, string>>}  return "mediastation-Name" + "ip of controller" as key-value-pairs
     */
    async loadMediaStations():Promise<Map<string, string>>{
        let loadedMetaData:Map<string, string>;
        let mediaStation:MediaStation;
        let id:number;

        loadedMetaData = await this._mediaStationMetaData.load();

        this._allMediaStations.clear();
        this._mediaStationIdCounter = 0;

        if(loadedMetaData){
            for (let [key, controllerIp] of loadedMetaData) {
                id = await this.addMediaStation(key, false);
                mediaStation = this.requireMediaStation(id);

                await this._mediaCacheHandler.hydrate(id);

                if(await this.isMediaStationCached(id))
                    mediaStation.importFromJSON(await this._contentFileService.loadFile(id), false);
                else if(controllerIp)
                    mediaStation.mediaAppRegistry.add(mediaStation.getNextMediaAppId(), "Controller-App not reachable", controllerIp, MediaAppRole.CONTROLLER);
            }
        }

        return loadedMetaData;
    }

    async addMediaStation(name:string, save:boolean = true):Promise<number>{
        let newMediaStation:MediaStation = this._mediaStationFactory(this._mediaStationIdCounter);

        newMediaStation.name = name;

        this._allMediaStations.set(this._mediaStationIdCounter, newMediaStation);
        this._mediaStationIdCounter++;

        if(save)
            await this._mediaStationMetaData.save(this._getNameControllerMap());

        return newMediaStation.id;
    }

    findMediaStation(id:number):MediaStation | null{
        let mediaStation:MediaStation | undefined = this._allMediaStations.get(id);

        if(!mediaStation)
            return null;

        return mediaStation;
    }
    /**
     * Returns the MediaStation or throws if it does not exist.
     */
    requireMediaStation(id:number):MediaStation {
        const ms:MediaStation | undefined = this._allMediaStations.get(id);

        if (!ms)
            throw new Error("Mediastation with this ID does not exist: " + id);

        return ms;
    }

    /**
     * deletes the media Station and removes all cached media files if there are any
     *
     * @param {number} id
     */
    async deleteMediaStation(id:number):Promise<void> {
        if(await this.isMediaStationCached(id))
            this.removeCachedMediaStation(id);

        this._allMediaStations.delete(id);
        await this._mediaStationMetaData.save(this._getNameControllerMap());

        this._mediaCacheHandler.deleteAllCachedMedia(id);
    }

    /**
     * saves the name of all mediastations and the ip of the controllers in a json-file
     */
    async saveMediaStations():Promise<void> {
        await this._mediaStationMetaData.save(this._getNameControllerMap());
    }

    cacheMediaStation(id:number):void{
        const mediaStation:MediaStation = this.requireMediaStation(id);
        this._contentFileService.saveFile(id,mediaStation.exportToJSON(new Date()) );
    }

    removeCachedMediaStation(id:number):void{
        this.requireMediaStation(id);
        this._contentFileService.deleteFile(id);
    }

    async isMediaStationCached(id:number):Promise<boolean>{
        this.requireMediaStation(id);
        return await this._contentFileService.fileExists(id);
    }

    async markMediaIDtoDelete(mediaStationId:number,mediaAppId:number, id:number):Promise<void>{
        this.requireMediaStation(mediaStationId);
        await this._mediaFilesMarkedToDeleteService.addID(mediaStationId,mediaAppId, id);
    }

    async deleteStoredMediaID(mediaStationId:number, mediaAppId:number, id:number):Promise<void>{
        this.requireMediaStation(mediaStationId);
        await this._mediaFilesMarkedToDeleteService.removeID(mediaStationId, mediaAppId, id);
    }

    async getAllMediaIDsToDelete(mediaStationId:number):Promise<Map<number, number[]>>{
        this.requireMediaStation(mediaStationId);
        return await this._mediaFilesMarkedToDeleteService.getAllIDS(mediaStationId);
    }

    private _getNameControllerMap():Map<string, string> {
        let map:Map<string, string> = new Map();
        let controllerIp:string | null;

        this._allMediaStations.forEach((mediaStation:MediaStation, key:number)=>{
            controllerIp = mediaStation.mediaAppRegistry.getControllerIp();
            map.set(mediaStation.name, controllerIp?controllerIp:"");
        });

        return map;
    }

    get mediaCacheHandler(): MediaFileCacheHandler {
        return this._mediaCacheHandler;
    }
}