import {MediaStation} from "./MediaStation";
import {MediaStationLocalMetaData} from "../fileHandling/MediaStationLocalMetaData";
import {MediaFileService} from "../fileHandling/MediaFileService";
import {MediaApp} from "./MediaApp";

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
    private _mediaStationFactory: (id: number) => MediaStation;

    private _pathToMainFolder:string;
    private _cachedMedia:Map<number, ICachedMedia[]> = new Map();

    constructor(mediaStationMetaData:MediaStationLocalMetaData, pathToMainFolder:string, mediaFileService:MediaFileService = new MediaFileService(), mediaStationFactory: (id: number) => MediaStation = (id) => new MediaStation(id)) {
        this._mediaStationMetaData = mediaStationMetaData;
        this._pathToMainFolder = pathToMainFolder;
        this._mediaFileService = mediaFileService;
        this._mediaStationFactory = mediaStationFactory;

        this._mediaFileService.init(this._pathToMainFolder)
        this._mediaStationMetaData.init(this._pathToMainFolder + "savedMediaStations.json")
    }

    async loadMediaStations():Promise<Map<string, string>>{
        let loadedMetaData:Map<string, string>;
        let mediaStation:MediaStation;
        let id:number;

        loadedMetaData = await this._mediaStationMetaData.load();

        if(loadedMetaData){
            loadedMetaData.forEach((controllerIp, key) => {
                id = this.addMediaStation(key, false);
                mediaStation = this.findMediaStation(id);

                console.log("CHECK: ", key, controllerIp)

                if(controllerIp)
                    mediaStation.addMediaApp(0, "Controller-App nicht erreichbar", controllerIp, MediaApp.ROLE_CONTROLLER);
            });
        }

        return new Promise((resolve) =>{resolve(loadedMetaData)});
    }

    addMediaStation(name:string, save:boolean = true):number{
        let newMediaStation:MediaStation = this._mediaStationFactory(this._mediaStationIdCounter);

        newMediaStation.name = name;
        newMediaStation.rootFolder.name = "root";

        this._allMediaStations.set(this._mediaStationIdCounter, newMediaStation);

        this._mediaStationIdCounter++;

        this._cachedMedia.set(newMediaStation.id, []);

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
    deleteMediaStation(id:number):void {
        let mediaArr:ICachedMedia[];
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

    updateAndSaveMediaStation(mediaStation:MediaStation):void {
        this.updateMediaStation(mediaStation);

        this._mediaStationMetaData.save(this.getNameControllerMap());
    }

    cacheMedia(mediaStationId: number, contentId:number, mediaAppId:number,fileExtension:string, payload:Uint8Array):void{
        let cachedMediaArr:ICachedMedia[];
        this._mediaFileService.saveFile(mediaStationId, contentId, mediaAppId, fileExtension, payload);

        if(!this._cachedMedia.has(mediaStationId))
            this._cachedMedia.set(mediaStationId, []);

        cachedMediaArr = this._cachedMedia.get(mediaStationId);

        cachedMediaArr.push( {contentId: contentId, mediaAppId:mediaAppId, fileExtension:fileExtension});
    }

    isMediaCached(mediaStationId: number, contentId:number, mediaAppId:number, fileExtension:string): boolean{
        return this._mediaFileService.fileExists(mediaStationId, contentId, mediaAppId, fileExtension);
    }

    deleteCachedMedia(mediaStationId: number, contentId:number, mediaAppId:number):void{
        let cachedArr:ICachedMedia[] = this._cachedMedia.get(mediaStationId);
        let indexToDelete:number = cachedArr.findIndex((cachedMedia:ICachedMedia  )=>{
            return cachedMedia.contentId === contentId && cachedMedia.mediaAppId === mediaAppId;
        });

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