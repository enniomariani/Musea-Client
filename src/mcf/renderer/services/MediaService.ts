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
     * @param {File} fileInstance
     * @param {string} fileName
     */
    async addImageAndCacheIt(mediaStationId: number, contentId: number, mediaAppId: number, fileExtension:string, fileInstance:File, fileName:string): Promise<void> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        if(!(fileExtension === MediaService.FILE_EXTENSION_IMAGE_PNG || fileExtension === MediaService.FILE_EXTENSION_IMAGE_JPEG))
            throw new Error("Non-valid file-extension passed: " +  fileExtension);

        this._mediaManager.createImage(mediaStation, contentId, mediaAppId, fileName);
        await this._mediaStationRepository.mediaCacheHandler.cacheMedia(mediaStationId, contentId, mediaAppId, fileExtension, fileInstance);
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
     * @param {File} fileInstance
     * @param {string} fileName
     */
    async addVideoAndCacheIt(mediaStationId: number, contentId: number, mediaAppId: number, duration:number, fileExtension:string, fileInstance:File, fileName:string): Promise<void> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        if(fileExtension !== MediaService.FILE_EXTENSION_VIDEO_MP4)
            throw new Error("Non-valid file-extension passed: " +  fileExtension);

        this._mediaManager.createVideo(mediaStation, contentId, mediaAppId, duration, fileName);
        await this._mediaStationRepository.mediaCacheHandler.cacheMedia(mediaStationId, contentId, mediaAppId, fileExtension, fileInstance);
    }

    /**
     * returns the fileName of the media or null if there was no media set
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaAppId
     * @returns {string}
     */
    getFileName(mediaStationId:number, contentId:number, mediaAppId:number): string{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        return this._mediaManager.getFileName(mediaStation, contentId, mediaAppId);
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
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        return this._mediaManager.getMediaType(mediaStation, contentId, mediaAppId);
    }

    /**
     * deletes the media from the data-structure
     *
     * If the media is cached it deletes the cached media, if it is not cached (means it was already sent to a media-app),
     * save the ID for the sync-process to send the delete-command to the media-App
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaAppId
     * @returns {Promise<void>}
     */
    async deleteMedia(mediaStationId:number, contentId:number, mediaAppId:number):Promise<void>{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let idOnMediaApp:number = this._mediaManager.getIdOnMediaApp(mediaStation, contentId, mediaAppId);

        if(this._mediaStationRepository.mediaCacheHandler.isMediaCached(mediaStationId, contentId, mediaAppId))
            this._mediaStationRepository.mediaCacheHandler.deleteCachedMedia(mediaStationId, contentId, mediaAppId);
        else
            await this._mediaStationRepository.markMediaIDtoDelete(mediaStationId,mediaAppId,  idOnMediaApp);

        this._mediaManager.deleteMedia(mediaStation, contentId, mediaAppId);
    }
}