import {MediaStationRepository} from "../dataStructure/MediaStationRepository.js";
import {MediaStation} from "../dataStructure/MediaStation.js";
import {MediaManager, MediaType} from "../dataManagers/MediaManager.js";

export const FileExtension = {
    IMAGE: {
        JPEG: "jpeg",
        PNG: "png",
    },
    VIDEO: {
        MP4: "mp4"
    }
} as const;

export type FileExtension = typeof FileExtension[keyof typeof FileExtension];
export type ImageFileExtension = typeof FileExtension.IMAGE[keyof typeof FileExtension.IMAGE];
export type VideoFileExtension = typeof FileExtension.VIDEO[keyof typeof FileExtension.VIDEO];

export class MediaService {
    private _mediaStationRepository: MediaStationRepository;
    private _mediaManager: MediaManager;

    constructor(mediaStationRepository: MediaStationRepository, mediaManager: MediaManager = new MediaManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._mediaManager = mediaManager;
    }

    /**
     * Create a new Image-object and add it to the content.
     * Cache the image: image stays cached even if app is closed. Cache is removed when mediastation is  succesfully synced.
     */
    async addImageAndCacheIt(mediaStationId: number, contentId: number, mediaAppId: number, fileExtension: ImageFileExtension, fileInstance: File, fileName: string): Promise<void> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        this._mediaManager.createImage(mediaStation, contentId, mediaAppId, fileName);
        await this._mediaStationRepository.mediaCacheHandler.cacheMedia(mediaStationId, contentId, mediaAppId, fileExtension, fileInstance);
    }

    /**
     * Create a new video-object and add it to the content.
     * Cache the video: video stays cached even if app is closed. Cache is removed when mediastation is  succesfully synced.
     */
    async addVideoAndCacheIt(mediaStationId: number, contentId: number, mediaAppId: number, duration: number, fileExtension: VideoFileExtension, fileInstance: File, fileName: string): Promise<void> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        this._mediaManager.createVideo(mediaStation, contentId, mediaAppId, duration, fileName);
        await this._mediaStationRepository.mediaCacheHandler.cacheMedia(mediaStationId, contentId, mediaAppId, fileExtension, fileInstance);
    }

    /**
     * Return the fileName of the media or null if there was no media set
     */
    getFileName(mediaStationId: number, contentId: number, mediaAppId: number): string | null {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        return this._mediaManager.getFileName(mediaStation, contentId, mediaAppId);
    }

    /**
     * Return a media-type or null if there was no media set
     */
    getMediaType(mediaStationId: number, contentId: number, mediaAppId: number):  MediaType | null {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        return this._mediaManager.getMediaType(mediaStation, contentId, mediaAppId);
    }

    /**
     * Delete the media from the data-structure
     *
     * If the media is cached it deletes the cached media, if it is not cached (means it was already sent to the mediastation),
     * save the ID for the sync-process to send the delete-command to the media-App
     */
    async deleteMedia(mediaStationId: number, contentId: number, mediaAppId: number): Promise<void> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let idOnMediaApp: number = this._mediaManager.getIdOnMediaApp(mediaStation, contentId, mediaAppId);

        if (this._mediaStationRepository.mediaCacheHandler.isMediaCached(mediaStationId, contentId, mediaAppId))
            this._mediaStationRepository.mediaCacheHandler.deleteCachedMedia(mediaStationId, contentId, mediaAppId);
        else
            await this._mediaStationRepository.markMediaIDtoDelete(mediaStationId, mediaAppId, idOnMediaApp);

        this._mediaManager.deleteMedia(mediaStation, contentId, mediaAppId);
    }
}