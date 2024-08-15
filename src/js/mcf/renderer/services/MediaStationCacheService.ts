import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";


export class MediaStationCacheService{

    private _mediaStationRepository:MediaStationRepository;

    constructor(mediaStationRepo:MediaStationRepository) {
        this._mediaStationRepository = mediaStationRepo;
    }

    cacheMediaStation(id:number){
        let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(id);

        if(!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);

        this._mediaStationRepository.cacheMediaStation(id);
    }

    async isMediaStationCached(id:number):Promise<boolean>{
        let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(id);

        if(!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);

        return await this._mediaStationRepository.isMediaStationCached(id);
    }
}