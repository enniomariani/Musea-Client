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

    async createMediaStation(name:string):Promise<number>{
        const id:number =  await this._mediaStationRepository.addMediaStation(name);
        this._mediaStationRepository.requireMediaStation(id);
        return id;
    }

    async deleteMediaStation(id:number):Promise<void>{
        this._mediaStationRepository.requireMediaStation(id);
        await this._mediaStationRepository.deleteMediaStation(id);
    }

    async changeName(id:number, newName:string):Promise<void>{
        const ms:MediaStation = this._mediaStationRepository.requireMediaStation(id);
        ms.name = newName;
        await this._mediaStationRepository.saveMediaStations();
    }

    getControllerIp(id:number):string|null{
        const ms:MediaStation = this._mediaStationRepository.requireMediaStation(id);
        return ms.mediaAppRegistry.getControllerIp();
    }

    getName(id:number):string{
        const ms:MediaStation = this._mediaStationRepository.requireMediaStation(id);
        return ms.name;
    }
}