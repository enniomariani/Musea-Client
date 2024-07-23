import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {MediaManager} from "../dataManagers/MediaManager";


export class MediaService {
    private _mediaStationRepository: MediaStationRepository;
    private _mediaManager: MediaManager;

    constructor(mediaStationRepository: MediaStationRepository, mediaManager: MediaManager = new MediaManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._mediaManager = mediaManager;
    }

    addImage(mediaStationId: number, contentId: number, mediaAppId: number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        this._mediaManager.createImage(mediaStation, contentId, mediaAppId);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    addVideo(mediaStationId: number, contentId: number, mediaAppId: number, duration:number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        this._mediaManager.createVideo(mediaStation, contentId, mediaAppId, duration);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    getMediaType(mediaStationId:number, contentId:number, mediaAppId:number): string{
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        return this._mediaManager.getMediaType(mediaStation, contentId, mediaAppId);
    }

    private _findMediaStation(id: number): MediaStation {
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(id);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);
        else
            return mediaStation;
    }
}