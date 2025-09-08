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
        this._mediaStationRepository.requireMediaStation(id);
        await this._mediaStationRepository.deleteMediaStation(id);
    }

    changeName(id:number, newName:string):void{
        const ms:MediaStation = this._mediaStationRepository.requireMediaStation(id);

        ms.name = newName;

        this._mediaStationRepository.updateAndSaveMediaStation(ms);
    }

    //TO DO: extract into mediaAppService?
    getControllerIp(id:number):string|null{
        const ms:MediaStation = this._mediaStationRepository.requireMediaStation(id);

        return ms.mediaAppRegistry.getControllerIp();
    }

    getName(id:number):string{
        const ms:MediaStation = this._mediaStationRepository.requireMediaStation(id);

        return ms.name;
    }
}