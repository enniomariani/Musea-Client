import {MediaFileService} from "src/mcf/renderer/fileHandling/MediaFileService";

export interface ICachedMedia{
    contentId:number
    mediaAppId:number
    fileExtension:string
}

export class MediaFileCacheHandler {

    private _cachedMedia: Map<number, ICachedMedia[]> = new Map();
    private _mediaFileService: MediaFileService;

    constructor(pathToMainFolder: string, mediaFileService: MediaFileService = new MediaFileService()) {
        this._mediaFileService = mediaFileService;

        this._mediaFileService.init(pathToMainFolder);
    }

    async hydrate(mediaStationId: number): Promise<void> {
        const list: ICachedMedia[] = await this._mediaFileService.getAllCachedMedia(mediaStationId);
        this._cachedMedia.set(mediaStationId, list ?? []);
    }

    async cacheMedia(mediaStationId: number, contentId: number, mediaAppId: number, fileExtension: string, fileInstance: File): Promise<void> {
        let cachedMediaArr: ICachedMedia[];
        await this._mediaFileService.saveFileByPath(mediaStationId, contentId, mediaAppId, fileExtension, fileInstance);

        if (!this._cachedMedia.has(mediaStationId))
            this._cachedMedia.set(mediaStationId, []);

        cachedMediaArr = this._cachedMedia.get(mediaStationId);

        cachedMediaArr.push({contentId: contentId, mediaAppId: mediaAppId, fileExtension: fileExtension});
    }


    /**
     * returns false if the mediastation-ID does not exist or if there is no cached media for the passed contentId and
     * mediaApp-ID.
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaAppId
     * @returns {boolean}
     */
    isMediaCached(mediaStationId: number, contentId: number, mediaAppId: number): boolean {
        let cachedArr: ICachedMedia[] = this._cachedMedia.get(mediaStationId);

        if (!cachedArr)
            return false;

        let cachedMediaIndex: number = cachedArr.findIndex((cachedMedia: ICachedMedia) => {
            return cachedMedia.contentId === contentId && cachedMedia.mediaAppId === mediaAppId;
        });

        return cachedMediaIndex !== -1;
    }

    /**
     * throws an error if the mediastation-ID does not exist or if there is no cached media for the passed contentId and
     * mediaApp-ID.
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaAppId
     * @returns {boolean}
     */
    deleteCachedMedia(mediaStationId: number, contentId: number, mediaAppId: number): void {
        let cachedArr: ICachedMedia[] = this._cachedMedia.get(mediaStationId);

        if (!cachedArr)
            throw new Error("No media cached for mediastation with ID: " + mediaStationId);

        let indexToDelete: number = cachedArr.findIndex((cachedMedia: ICachedMedia) => {
            return cachedMedia.contentId === contentId && cachedMedia.mediaAppId === mediaAppId;
        });

        if (indexToDelete === -1)
            throw new Error("No media cached for media-App-ID " + mediaAppId + " in content-ID " + contentId + " of mediastation with ID: " + mediaStationId);

        this._mediaFileService.deleteFile(mediaStationId, contentId, mediaAppId, cachedArr[indexToDelete].fileExtension);

        cachedArr.splice(indexToDelete, 1);

        if (cachedArr.length <= 0)
            this._cachedMedia.delete(mediaStationId);
    }

    deleteAllCachedMedia(mediaStationId: number): void {
        let mediaArr: ICachedMedia[];

        if(!this._cachedMedia.has(mediaStationId))
            throw new Error("No media cached for mediastation with ID: " + mediaStationId);

        mediaArr = this._cachedMedia.get(mediaStationId);

        for (let i: number = 0; i < mediaArr.length; i++)
            this._mediaFileService.deleteFile(mediaStationId, mediaArr[i].contentId, mediaArr[i].mediaAppId, mediaArr[i].fileExtension);

        this._cachedMedia.delete(mediaStationId);
    }

    async getCachedMediaFile(mediaStationId: number, contentId: number, mediaAppId: number, fileExtension: string): Promise<Uint8Array | null> {
        return await this._mediaFileService.loadFile(mediaStationId, contentId, mediaAppId, fileExtension);
    }

    /**
     * returns a copy of the actual cached media
     * @returns {Map<number, ICachedMedia[]>}
     */
    getAllCachedMedia(): Map<number, ICachedMedia[]> {
        return new Map(this._cachedMedia);
    }
}