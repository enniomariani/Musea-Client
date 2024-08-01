import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {MediaManager} from "../dataManagers/MediaManager";


export class MediaService {
    static FILE_EXTENSION_IMAGE_JPEG:string = "jpeg";
    static FILE_EXTENSION_IMAGE_PNG:string = "png";
    static FILE_EXTENSION_VIDEO_MP4:string = "mp4";

    private _mediaStationRepository: MediaStationRepository;
    private _mediaManager: MediaManager;

    constructor(mediaStationRepository: MediaStationRepository, mediaManager: MediaManager = new MediaManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._mediaManager = mediaManager;
    }

    /**
     * creates a new Image-object and adds it to the content
     *
     * also caches the image!
     *
     * throws an error if the mediastation, the content or the mediaApp do not exist
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaAppId
     * @param {string} fileExtension    must be one of the static FILE_EXTENSION_IMAGE variables of MediaService
     * @param {Uint8Array} payload
     */
    addImageAndCacheIt(mediaStationId: number, contentId: number, mediaAppId: number, fileExtension:string, payload:Uint8Array): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        if(!(fileExtension === MediaService.FILE_EXTENSION_IMAGE_PNG || fileExtension === MediaService.FILE_EXTENSION_IMAGE_JPEG))
            throw new Error("Non-valid file-extension passed: " +  fileExtension);

        this._mediaManager.createImage(mediaStation, contentId, mediaAppId);

        this._mediaStationRepository.updateMediaStation(mediaStation);

        this._mediaStationRepository.cacheMedia(mediaStationId, contentId, mediaAppId, fileExtension, payload);
    }

    /**
     * creates a new Video-object and adds it to the content
     *
     * also caches the image!
     *
     * throws an error if the mediastation, the content or the mediaApp do not exist
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaAppId
     * @param {number} duration
     * @param {string} fileExtension    must be one of the static FILE_EXTENSION_VIDEO variables of MediaService
     * @param {Uint8Array} payload
     */
    addVideoAndCacheIt(mediaStationId: number, contentId: number, mediaAppId: number, duration:number, fileExtension:string, payload:Uint8Array): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        if(fileExtension !== MediaService.FILE_EXTENSION_VIDEO_MP4)
            throw new Error("Non-valid file-extension passed: " +  fileExtension);

        this._mediaManager.createVideo(mediaStation, contentId, mediaAppId, duration);

        this._mediaStationRepository.updateMediaStation(mediaStation);

        this._mediaStationRepository.cacheMedia(mediaStationId, contentId, mediaAppId, fileExtension, payload);
    }

    /**
     * returns one of the types (static vars) in MediaManager or null if there was no media set
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaAppId
     * @returns {string}
     */
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