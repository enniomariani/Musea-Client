import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";
import {ICachedMedia} from "src/mcf/renderer/fileHandling/MediaFileCacheHandler";
import {Content} from "src/mcf/renderer/dataStructure/Content";
import {IMedia} from "src/mcf/renderer/dataStructure/Media";
import {NetworkService} from "src/mcf/renderer/network/NetworkService";
import {MediaStationRepository} from "src/mcf/renderer/dataStructure/MediaStationRepository";

export enum MediaAppSyncEventType {
    LoadMediaStart = "LoadMediaStart",
    MediaSendStart = "MediaSendStart",
    MediaSending = "MediaSending",
    MediaSendSuccess = "MediaSendSuccess",
    MediaSendFailed = "MediaSendFailed",
    DeleteStart = "DeleteStart"
}

export interface IMediaAppSyncEvent {
    type: MediaAppSyncEventType;
    data?: Record<string, unknown>;
}
export interface IMediaAppProgress {
    (event: IMediaAppSyncEvent): void;
}

export class MediaAppSyncService {
    private _networkService: NetworkService;
    private _mediaStationRepo: MediaStationRepository;

    constructor(networkService: NetworkService, mediaStationRepo: MediaStationRepository) {
        this._networkService = networkService;
        this._mediaStationRepo = mediaStationRepo;
    }

    async sendMediaFilesToMediaApp(mediaStation: MediaStation, allCachedMedia: ICachedMedia[], ipMediaApp: string, reporter: IMediaAppProgress): Promise<boolean> {
        let fileData: Uint8Array | null;
        let idOnMediaApp: number | null;
        let content: Content;
        let media: IMedia;
        let areAllMediaSentSuccesfully: boolean = true;

        if (!allCachedMedia)
            return true;

        for (const cachedMedia of allCachedMedia) {
            reporter({ type: MediaAppSyncEventType.LoadMediaStart, data: { fileExt: cachedMedia.fileExtension } });

            fileData = await this._mediaStationRepo.mediaCacheHandler.getCachedMediaFile(mediaStation.id, cachedMedia.contentId, cachedMedia.mediaAppId, cachedMedia.fileExtension);

            if(!fileData)
                continue;

            reporter({ type: MediaAppSyncEventType.MediaSendStart });
            idOnMediaApp = await this._networkService.sendMediaFileToIp(ipMediaApp, cachedMedia.fileExtension, fileData,240000,
                (msg:string) => {console.log("send progress: ", msg); reporter({type:MediaAppSyncEventType.MediaSending, data: {progress: msg}});});

            fileData = null;    //to free memory as fast as possible when transferring large files

            if(idOnMediaApp === null || idOnMediaApp < 0){
                areAllMediaSentSuccesfully = false;
                reporter({ type: MediaAppSyncEventType.MediaSendFailed });
            }else{
                reporter({ type: MediaAppSyncEventType.MediaSendSuccess });

                content = mediaStation.rootFolder.requireContent(cachedMedia.contentId);
                media = content.requireMedia(cachedMedia.mediaAppId);

                media.idOnMediaApp = idOnMediaApp;

                this._mediaStationRepo.mediaCacheHandler.deleteCachedMedia(mediaStation.id, cachedMedia.contentId, cachedMedia.mediaAppId);
            }
        }
        return areAllMediaSentSuccesfully;
    }

    async sendCommandDeleteMediaToMediaApps(mediaStationId: number, mediaAppId: number, allMediaIdsToDelete: number[], ipMediaApp: string, reporter: IMediaAppProgress): Promise<void> {
        for (const id of allMediaIdsToDelete) {
            reporter({ type: MediaAppSyncEventType.DeleteStart, data: { id: id, mediaAppId: mediaAppId.toString() } });

            await this._networkService.sendDeleteMediaTo(ipMediaApp, id);
            await this._mediaStationRepo.deleteStoredMediaID(mediaStationId, mediaAppId, id);
        }
    }
}