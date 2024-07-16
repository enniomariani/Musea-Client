import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";


export class MediaStationDataService{

    private _mediaStationRepository:MediaStationRepository;

    constructor(mediaStationRepo:MediaStationRepository) {
        this._mediaStationRepository = mediaStationRepo;
    }

    loadMediaStations():void {
        this._mediaStationRepository.loadMediaStations();
    }

    createMediaStation(name:string):number{
        return this._mediaStationRepository.addMediaStation(name);
    }

    deleteMediaStation(id:number):void{
        this._mediaStationRepository.deleteMediaStation(id);
    }

    renameMediaStation(id:number, newName:string):void{
        let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(id);

        mediaStation.name = newName;

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    getNameOfMediaStation(id:number):string{
        return this._mediaStationRepository.findMediaStation(id).name;
    }
}