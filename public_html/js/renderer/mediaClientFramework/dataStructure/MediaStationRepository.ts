import {MediaStation} from "./MediaStation";
import {MediaStationLocalMetaData} from "../fileHandling/MediaStationLocalMetaData";
import {MediaApp} from "./MediaApp";


export class MediaStationRepository{

    private _allMediaStations: Map<number, MediaStation> = new Map();
    private _mediaStationIdCounter:number = 0;

    private _mediaStationMetaData:MediaStationLocalMetaData;

    constructor(mediaStationMetaData:MediaStationLocalMetaData) {
        this._mediaStationMetaData = mediaStationMetaData;
    }

    loadMediaStations():void{
        let loadedMetaData:Map<string, string>;

        loadedMetaData = this._mediaStationMetaData.load();

        if(loadedMetaData){
            loadedMetaData.forEach((values, keys) => {
                this.addMediaStation(keys);
            });
        }
    }

    addMediaStation(name:string):number{
        let newMediaStation:MediaStation = new MediaStation(++this._mediaStationIdCounter);
        newMediaStation.name = name;

        this._allMediaStations.set(this._mediaStationIdCounter, newMediaStation);

        this._mediaStationMetaData.save(this.getNameControllerMap());
        return newMediaStation.id;
    }

    findMediaStation(id:number):MediaStation | null{
        let mediaStation:MediaStation = this._allMediaStations.get(id);

        if(!mediaStation)
            return null;

        return mediaStation;
    }

    deleteMediaStation(id:number):void {
        this._allMediaStations.delete(id);
        this._mediaStationMetaData.save(this.getNameControllerMap());
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

    private getNameControllerMap():Map<string, string> {
        let map:Map<string, string> = new Map();
        let controllerIp:string;

        this._allMediaStations.forEach((mediaStation:MediaStation, key:number)=>{
            controllerIp = "";
            mediaStation.mediaApps.forEach((mediaApp:MediaApp)=>{
                if(mediaApp.role === MediaApp.ROLE_CONTROLLER){
                    controllerIp = mediaApp.ip;
                    return;
                }
            });
            map.set(mediaStation.name, controllerIp);
        });

        return map;
    }
}