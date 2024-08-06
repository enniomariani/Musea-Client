import {ContentFileService} from "../fileHandling/ContentFileService";
import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";


export class MediaStationCacheService{

    private _contentFileService:ContentFileService;
    private _mediaStationRepository:MediaStationRepository;

    constructor(contentFileService:ContentFileService, mediaStationRepo:MediaStationRepository) {
        this._contentFileService = contentFileService;
        this._mediaStationRepository = mediaStationRepo;
    }

    cacheMediaStation(id:number){
        let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(id);

        if(!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);

        this._contentFileService.saveFile(id, mediaStation.exportToJSON());
    }

    isMediaStationCached(id:number):boolean{
        let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(id);

        if(!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);

        return this._contentFileService.fileExists(id);
    }
}