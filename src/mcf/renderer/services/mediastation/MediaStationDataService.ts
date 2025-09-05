import {MediaStationRepository} from "src/mcf/renderer/dataStructure/MediaStationRepository";
import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";


export class MediaStationDataService{

    private _mediaStationRepository:MediaStationRepository;

    constructor(mediaStationRepo:MediaStationRepository) {
        this._mediaStationRepository = mediaStationRepo;
    }

    async loadMediaStations():Promise<Map<string, string>> {
        return this._mediaStationRepository.loadMediaStations();
    }

    createMediaStation(name:string):number{
        return this._mediaStationRepository.addMediaStation(name);
    }

    async deleteMediaStation(id:number):Promise<void>{
        this._findMediaStation(id);
        await this._mediaStationRepository.deleteMediaStation(id);
    }

    changeName(id:number, newName:string):void{
        let mediaStation:MediaStation = this._findMediaStation(id);

        mediaStation.name = newName;

        this._mediaStationRepository.updateAndSaveMediaStation(mediaStation);
    }

    getControllerIp(id:number):string|null{
        let mediaStation:MediaStation = this._findMediaStation(id);

        return mediaStation.getControllerIp();
    }

    getName(id:number):string{
        let mediaStation:MediaStation = this._findMediaStation(id);

        return mediaStation.name;
    }

    private _findMediaStation(id: number): MediaStation {
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(id);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);
        else
            return mediaStation;
    }
}