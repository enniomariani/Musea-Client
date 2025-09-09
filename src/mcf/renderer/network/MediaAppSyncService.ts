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
        let fileData: Uint8Array;
        let idOnMediaApp: number;
        let content: Content;
        let media: IMedia;
        let areAllMediaSentSuccesfully: boolean = true;

        if (!allCachedMedia)
            return true;

        for (const cachedMedia of allCachedMedia) {
            reporter({ type: MediaAppSyncEventType.LoadMediaStart, data: { fileExt: cachedMedia.fileExtension } });

            fileData = await this._mediaStationRepo.mediaCacheHandler.getCachedMediaFile(mediaStation.id, cachedMedia.contentId, cachedMedia.mediaAppId, cachedMedia.fileExtension);

            reporter({ type: MediaAppSyncEventType.MediaSendStart });
            idOnMediaApp = await this._networkService.sendMediaFileToIp(ipMediaApp, cachedMedia.fileExtension, fileData,240000,
                (msg:string) => {console.log("send progress: ", msg); reporter({type:MediaAppSyncEventType.MediaSending, data: {progress: msg}});});

            fileData = null;    //to avoid memory leaks

            if (idOnMediaApp !== null && idOnMediaApp !== undefined && idOnMediaApp >= 0) {
                reporter({ type: MediaAppSyncEventType.MediaSendSuccess });

                content = mediaStation.rootFolder.findContent(cachedMedia.contentId);
                media = content.media.get(cachedMedia.mediaAppId);

                media.idOnMediaApp = idOnMediaApp;

                console.log("SET NEW ID FOR MEDIA: ", content.id, media.idOnMediaApp, idOnMediaApp)

                this._mediaStationRepo.mediaCacheHandler.deleteCachedMedia(mediaStation.id, cachedMedia.contentId, cachedMedia.mediaAppId);
            } else {
                areAllMediaSentSuccesfully = false;
                console.log("MEDIUM KONNTE NICHT GESENDET ODER EMPFANGEN WERDEN!")
                reporter({ type: MediaAppSyncEventType.MediaSendFailed });
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