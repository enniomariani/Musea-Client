import {MediaStationRepository} from "renderer/dataStructure/MediaStationRepository.js";
import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {MediaManager, MediaType, PlayerRef} from "renderer/dataManagers/MediaManager.js";
import {SubtitleInternal} from "../dataStructure/Media.js";
import {ISO6392} from "./iso6392.js";

export const FileExtension = {
    IMAGE: {
        JPEG: "jpeg",
        PNG: "png",
    },
    VIDEO: {
        MP4: "mp4"
    }
} as const;

export type Iso6392T = string & { readonly __brand: "Iso6392" };
const ISO_RE = /^[a-z]{3}$/;

export function iso6392T(input: string): Iso6392T {
    if (!ISO_RE.test(input)) {
        throw new Error(`Invalid ISO 639-2T code: "${input}"`);
    }

    const langObj = ISO6392.find(obj =>
        obj.iso6392T === input ||
        (obj.iso6392T === undefined && obj.iso6392B === input)
    );

    if (!langObj) {
        throw new Error(`Unknown ISO 639-2T code: "${input}"`);
    }

    return input as Iso6392T;
}

export interface Subtitle {
    readonly iso6392T: Iso6392T;   // uses ISO 639-2T e.g. "deu", or "eng" - see https://www.loc.gov/standards/iso639-2/php/code_list.php
    readonly title: string;    // custom language-title like "Deutsch"
}

export interface VideoOptions {
    subtitles?: Subtitle[];
}

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
    async addImageAndCacheIt(mediaStationId: number, contentId: number, mediaPlayerId: number, fileExtension: ImageFileExtension, fileInstance: File, fileName: string): Promise<void> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const playerRef:PlayerRef = {mediaStation:mediaStation, contentId: contentId, mediaPlayerId:mediaPlayerId};
        this._mediaManager.createImage(playerRef, fileName);
        await this._mediaStationRepository.mediaCacheHandler.cacheMedia(mediaStationId, contentId, mediaPlayerId, fileExtension, fileInstance);
    }

    /**
     * Create a new video-object and add it to the content.
     * Cache the video: video stays cached even if app is closed. Cache is removed when mediastation is  succesfully synced.
     */
    async addVideoAndCacheIt(mediaStationId: number, contentId: number, mediaPlayerId: number, duration: number,
                             fileExtension: VideoFileExtension, fileInstance: File, fileName: string, videoOptions:VideoOptions = {}): Promise<void> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const playerRef:PlayerRef = {mediaStation:mediaStation, contentId: contentId, mediaPlayerId:mediaPlayerId};
        let subsInternal:SubtitleInternal[] = [];

        if(videoOptions.subtitles){
            videoOptions.subtitles.forEach((sub) =>{
                subsInternal.push(new SubtitleInternal(sub.iso6392T, sub.title));
            });
        }

        this._mediaManager.createVideo(playerRef, duration, fileName, subsInternal);
        await this._mediaStationRepository.mediaCacheHandler.cacheMedia(mediaStationId, contentId, mediaPlayerId, fileExtension, fileInstance);
    }

    /**
     * Return the fileName of the media or null if there was no media set
     */
    getFileName(mediaStationId: number, contentId: number, mediaPlayerId: number): string | null {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const playerRef:PlayerRef = {mediaStation:mediaStation, contentId: contentId, mediaPlayerId:mediaPlayerId};
        return this._mediaManager.getFileName(playerRef);
    }

    /**
     * Return a media-type or null if there was no media set
     */
    getMediaType(mediaStationId: number, contentId: number, mediaPlayerId: number):  MediaType | null {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const playerRef:PlayerRef = {mediaStation:mediaStation, contentId: contentId, mediaPlayerId:mediaPlayerId};
        return this._mediaManager.getMediaType(playerRef);
    }

    /**
     * Delete the media from the data-structure
     *
     * If the media is cached it deletes the cached media, if it is not cached (means it was already sent to the mediastation),
     * save the ID for the sync-process to send the delete-command to the Media-Player
     */
    async deleteMedia(mediaStationId: number, contentId: number, mediaPlayerId: number): Promise<void> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const playerRef:PlayerRef = {mediaStation:mediaStation, contentId: contentId, mediaPlayerId:mediaPlayerId};

        let idOnMediaPlayer: number = this._mediaManager.getIdOnMediaPlayer(playerRef);

        if (this._mediaStationRepository.mediaCacheHandler.isMediaCached(mediaStationId, contentId, mediaPlayerId))
            this._mediaStationRepository.mediaCacheHandler.deleteCachedMedia(mediaStationId, contentId, mediaPlayerId);
        else
            await this._mediaStationRepository.markMediaIDtoDelete(mediaStationId, mediaPlayerId, idOnMediaPlayer);

        this._mediaManager.deleteMedia(playerRef);
    }
}