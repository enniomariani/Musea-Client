import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {ICachedMedia} from "renderer/fileHandling/MediaFileCacheHandler.js";
import {Content} from "renderer/dataStructure/Content.js";
import {IMedia} from "renderer/dataStructure/Media.js";
import {NetworkService} from "renderer/network/NetworkService.js";
import {MediaStationRepository} from "renderer/dataStructure/MediaStationRepository.js";

export enum MediaPlayerSyncEventType {
    LoadMediaStart = "LoadMediaStart",
    MediaSendStart = "MediaSendStart",
    MediaSending = "MediaSending",
    MediaSendSuccess = "MediaSendSuccess",
    MediaSendFailed = "MediaSendFailed",
    DeleteStart = "DeleteStart"
}

export interface IMediaPlayerSyncEvent {
    type: MediaPlayerSyncEventType;
    data?: Record<string, unknown>;
}
export interface IMediaPlayerProgress {
    (event: IMediaPlayerSyncEvent): void;
}

export class MediaPlayerSyncService {
    private _networkService: NetworkService;
    private _mediaStationRepo: MediaStationRepository;

    constructor(networkService: NetworkService, mediaStationRepo: MediaStationRepository) {
        this._networkService = networkService;
        this._mediaStationRepo = mediaStationRepo;
    }

    async sendMediaFilesToMediaPlayer(mediaStation: MediaStation, allCachedMedia: ICachedMedia[], ipMediaPlayer: string, reporter: IMediaPlayerProgress): Promise<boolean> {
        let fileData: Uint8Array | null;
        let idOnMediaPlayer: number | null;
        let content: Content;
        let media: IMedia;
        let areAllMediaSentSuccesfully: boolean = true;

        if (!allCachedMedia)
            return true;

        for (const cachedMedia of allCachedMedia) {
            reporter({ type: MediaPlayerSyncEventType.LoadMediaStart, data: { fileExt: cachedMedia.fileExtension } });

            fileData = await this._mediaStationRepo.mediaCacheHandler.getCachedMediaFile(mediaStation.id, cachedMedia.contentId, cachedMedia.mediaPlayerId, cachedMedia.fileExtension);

            if(!fileData)
                continue;

            reporter({ type: MediaPlayerSyncEventType.MediaSendStart });
            idOnMediaPlayer = await this._networkService.sendMediaFileToIp(ipMediaPlayer, cachedMedia.fileExtension, fileData,240000,
                (msg:string) => {
                reporter({type:MediaPlayerSyncEventType.MediaSending, data: {progress: msg}});
            });

            fileData = null;    //to free memory as fast as possible when transferring large files

            if(idOnMediaPlayer === null || idOnMediaPlayer < 0){
                areAllMediaSentSuccesfully = false;
                reporter({ type: MediaPlayerSyncEventType.MediaSendFailed });
            }else{
                reporter({ type: MediaPlayerSyncEventType.MediaSendSuccess });

                content = mediaStation.rootFolder.requireContent(cachedMedia.contentId);
                media = content.requireMedia(cachedMedia.mediaPlayerId);

                media.idOnMediaPlayer = idOnMediaPlayer;

                this._mediaStationRepo.mediaCacheHandler.deleteCachedMedia(mediaStation.id, cachedMedia.contentId, cachedMedia.mediaPlayerId);
            }
        }
        return areAllMediaSentSuccesfully;
    }

    async sendCommandDeleteMediaToMediaPlayers(mediaStationId: number, mediaPlayerId: number, allMediaIdsToDelete: number[], ipMediaPlayer: string, reporter: IMediaPlayerProgress): Promise<void> {
        for (const id of allMediaIdsToDelete) {
            reporter({ type: MediaPlayerSyncEventType.DeleteStart, data: { id: id, mediaPlayerId: mediaPlayerId.toString() } });

            await this._networkService.sendDeleteMediaTo(ipMediaPlayer, id);
            await this._mediaStationRepo.deleteStoredMediaID(mediaStationId, mediaPlayerId, id);
        }
    }
}