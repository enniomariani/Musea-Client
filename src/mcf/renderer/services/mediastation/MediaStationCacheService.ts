import {MediaStationRepository} from "renderer/dataStructure/MediaStationRepository.js";

export class MediaStationCacheService{

    private _mediaStationRepository:MediaStationRepository;

    constructor(mediaStationRepo:MediaStationRepository) {
        this._mediaStationRepository = mediaStationRepo;
    }

    cacheMediaStation(id:number){
        this._mediaStationRepository.requireMediaStation(id);
        this._mediaStationRepository.cacheMediaStation(id);
    }

    async isMediaStationCached(id:number):Promise<boolean>{
        this._mediaStationRepository.requireMediaStation(id);
        return await this._mediaStationRepository.isMediaStationCached(id);
    }
}