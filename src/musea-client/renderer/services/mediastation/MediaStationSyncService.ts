import {NetworkService} from "renderer/network/NetworkService.js";
import {MediaStationRepository} from "renderer/dataStructure/MediaStationRepository.js";
import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {MediaPlayer} from "renderer/dataStructure/MediaPlayer.js";
import {ICachedMedia} from "renderer/fileHandling/MediaFileCacheHandler.js";
import {MediaPlayerConnectionService} from "renderer/services/MediaPlayerConnectionService.js";
import {MediaPlayerConnectionStatus} from "renderer/network/MediaPlayerConnectionSteps.js";
import {
    IMediaPlayerSyncEvent,
    MediaPlayerSyncEventType,
    MediaPlayerSyncService
} from "renderer/network/MediaPlayerSyncService.js";
import {
    ConnectionStatus,
    ProgressReporter,
    SyncEvent,
    SyncScope
} from "renderer/services/mediastation/SyncEvents.js";

export class MediaStationSyncService {

    private _networkService: NetworkService;
    private _mediaStationRepo: MediaStationRepository;
    private _mediaPlayerConnectionService: MediaPlayerConnectionService;
    private _mediaPlayerSyncService: MediaPlayerSyncService;

    constructor(networkService: NetworkService, mediaStationRepo: MediaStationRepository, mediaPlayerConnectionService: MediaPlayerConnectionService, mediaPlayerSyncService: MediaPlayerSyncService) {
        this._networkService = networkService;
        this._mediaStationRepo = mediaStationRepo;
        this._mediaPlayerConnectionService = mediaPlayerConnectionService;
        this._mediaPlayerSyncService = mediaPlayerSyncService;
    }

    /**
     * sends all cached media-files to the media-players of a mediaStation.
     * If it receives an ID back from the media-player, it sets the idOnMediaPlayer
     * property of the media to this ID and deletes the cached file.
     *
     * After that it sends the contents-json with the actualized IDs to the controller-app
     *
     * Attention: always registers as admin-app, never as user-app!
     *
     * @param {number} mediaStationId
     * @param {ProgressReporter} progressReporter  Is called after every new network-operation an event with info about what is going on
     * @returns {Promise<boolean>}
     */
    async sync(mediaStationId: number, progressReporter: ProgressReporter): Promise<boolean> {
        const mediaStation: MediaStation = this._mediaStationRepo.requireMediaStation(mediaStationId);
        let json: string;
        let mediaPlayer: MediaPlayer;
        let allMediaPlayersWereSynced: boolean = true;
        let allMediaWereSentSuccesfully: boolean = true;

        let controller: MediaPlayer | null;
        let cachedMediaOfAllMediaStations: Map<number, ICachedMedia[]>;
        let allCachedMedia: ICachedMedia[];
        let allMediaIdsToDelete: Map<number, number[]>
        let allMediaToAdd: Map<MediaPlayer, ICachedMedia[]> = new Map();
        let allMediaToDelete: Map<MediaPlayer, number[]> = new Map();

        let allMediaPlayersWithChanges: MediaPlayer[] = [];

        //send all media to the media-players
        cachedMediaOfAllMediaStations = this._mediaStationRepo.mediaCacheHandler.getAllCachedMedia();
        allCachedMedia = cachedMediaOfAllMediaStations.get(mediaStationId) as ICachedMedia[];
        allMediaIdsToDelete = await this._mediaStationRepo.getAllMediaIDsToDelete(mediaStationId);

        //save all cachedMedia by their mediaPlayer, because all media-operations are executed per media-player (all actions for media-player 1 first,
        //then for media app 2, etc.
        if (allCachedMedia) {
            for (const cachedMedia of allCachedMedia) {
                mediaPlayer = mediaStation.mediaPlayerRegistry.require(cachedMedia.mediaPlayerId);

                if (!allMediaToAdd.has(mediaPlayer)) {
                    allMediaToAdd.set(mediaPlayer, []);
                    allMediaPlayersWithChanges.push(mediaPlayer);
                }

                allMediaToAdd.get(mediaPlayer)?.push(cachedMedia);
            }
        }

        for (const [mediaPlayerId, idsToDelete] of allMediaIdsToDelete) {
            mediaPlayer = mediaStation.mediaPlayerRegistry.require(mediaPlayerId);
            allMediaToDelete.set(mediaPlayer, idsToDelete);

            if (allMediaPlayersWithChanges.indexOf(mediaPlayer) === -1)
                allMediaPlayersWithChanges.push(mediaPlayer);
        }

        //loop through all existing media apps in the mediastation and try to connect to them and register
        for (const mediaPlayer of allMediaPlayersWithChanges) {
            progressReporter({scope: SyncScope.MediaPlayer, type: "Connecting", appName: mediaPlayer.name, ip: mediaPlayer.ip})

            const answer: MediaPlayerConnectionStatus = await this._mediaPlayerConnectionService.checkConnection(mediaPlayer.ip, {role: "admin"});

            if (answer !== MediaPlayerConnectionStatus.Online) {
                allMediaPlayersWereSynced = false;
                progressReporter({
                    scope: SyncScope.MediaPlayer,
                    type: "ConnectionStatus",
                    status: this._mapConnectionStatusToProgress(answer)
                });
                continue;
            }

            const registrationSuccess: boolean = await this._mediaPlayerConnectionService.connectAndRegisterToMediaPlayer(mediaStationId, mediaPlayer.id, "admin");

            if (!registrationSuccess) {
                allMediaPlayersWereSynced = false;
                progressReporter({
                    scope: SyncScope.MediaPlayer,
                    type: "ConnectionStatus",
                    status: ConnectionStatus.RegistrationFailed
                });
                continue;
            }

            progressReporter({scope: SyncScope.MediaPlayer, type: "ConnectionStatus", status: ConnectionStatus.Online});

            //if the connection could be established to a media-player, send all cached media-files
            if (!await this._mediaPlayerSyncService.sendMediaFilesToMediaPlayer(mediaStation, allMediaToAdd.get(mediaPlayer) as ICachedMedia[]
                , mediaPlayer.ip, (event: IMediaPlayerSyncEvent) => progressReporter(this._mapMediaPlayerSyncToProgress(event))))
                allMediaWereSentSuccesfully = false;

            if (allMediaIdsToDelete.has(mediaPlayer.id))
                await this._mediaPlayerSyncService.sendCommandDeleteMediaToMediaPlayers(mediaStationId, mediaPlayer.id, allMediaIdsToDelete.get(mediaPlayer.id) as number[], mediaPlayer.ip, (event: IMediaPlayerSyncEvent) => progressReporter(this._mapMediaPlayerSyncToProgress(event)));

            this._mediaStationRepo.cacheMediaStation(mediaStationId);
        }

        if (allMediaPlayersWereSynced && allMediaWereSentSuccesfully) {
            // send content-file (last step in synchronisation)
            controller = mediaStation.mediaPlayerRegistry.getController();

            if (!controller) {
                progressReporter({scope: SyncScope.Controller, type: "NoControllerDefined"});
                progressReporter({scope: SyncScope.MediaStation, type: "Done"});
                return false;
            }

            progressReporter({scope: SyncScope.Controller, type: "Connecting", ip: controller.ip, appName: controller.name});

            const answer: MediaPlayerConnectionStatus = await this._mediaPlayerConnectionService.checkConnection(controller.ip, {role: "admin"});

            if (answer !== MediaPlayerConnectionStatus.Online) {
                progressReporter({
                    scope: SyncScope.MediaPlayer,
                    type: "ConnectionStatus",
                    status: this._mapConnectionStatusToProgress(answer)
                });
                progressReporter({scope: SyncScope.MediaStation, type: "Done"});
                return false;
            }

            const answerControllerReg: boolean = await this._mediaPlayerConnectionService.connectAndRegisterToMediaPlayer(mediaStationId, controller.id, "admin");

            if (answerControllerReg) {
                progressReporter({
                    scope: SyncScope.MediaPlayer,
                    type: "ConnectionStatus",
                    status: ConnectionStatus.Online
                });

                progressReporter({scope: SyncScope.Controller, type: "SendingContents"});
                json = mediaStation.exportToJSON(new Date());

                await this._networkService.sendContentFileTo(controller.ip, json);
                this._mediaStationRepo.removeCachedMediaStation(mediaStationId);

                progressReporter({scope: SyncScope.Controller, type: "Sent"});
                progressReporter({scope: SyncScope.MediaStation, type: "Done"});

                return true;
            } else
                progressReporter({
                    scope: SyncScope.MediaPlayer,
                    type: "ConnectionStatus",
                    status: ConnectionStatus.RegistrationFailed
                });
        }

        progressReporter({scope: SyncScope.MediaStation, type: "Done"});
        return false;
    }

    private _mapConnectionStatusToProgress(status: MediaPlayerConnectionStatus): ConnectionStatus {
        switch (status) {
            case MediaPlayerConnectionStatus.IcmpPingFailed:
                return ConnectionStatus.IcmpPingFailed;
            case MediaPlayerConnectionStatus.TcpConnectionFailed:
                return ConnectionStatus.TcpConnectionFailed;
            case MediaPlayerConnectionStatus.WebSocketPingFailed:
                return ConnectionStatus.WebSocketPingFailed;
            case MediaPlayerConnectionStatus.RegistrationFailed:
                return ConnectionStatus.RegistrationFailed;
            case MediaPlayerConnectionStatus.Online:
                return ConnectionStatus.Online;
            default:
                throw new Error("ConnectionStatus not valid: " + status);
        }
    }

    private _mapMediaPlayerSyncToProgress(event: IMediaPlayerSyncEvent): SyncEvent {
        console.log("sync event: ", event);
        switch (event.type) {
            case MediaPlayerSyncEventType.LoadMediaStart:
                return {scope: SyncScope.MediaPlayer, type: "LoadMediaStart", ext: event.data?.fileExt as string};
            case MediaPlayerSyncEventType.MediaSendStart:
                return {scope: SyncScope.MediaPlayer, type: "MediaSendStart"};
            case MediaPlayerSyncEventType.MediaSending:
                return {
                    scope: SyncScope.MediaPlayer,
                    type: "MediaSendingProgress",
                    progressPoint: event.data?.progress as string
                }
            case MediaPlayerSyncEventType.MediaSendSuccess:
                return {scope: SyncScope.MediaPlayer, type: "MediaSendSuccess"};
            case MediaPlayerSyncEventType.MediaSendFailed:
                return {scope: SyncScope.MediaPlayer, type: "MediaSendFailed"};
            case MediaPlayerSyncEventType.DeleteStart:
                return {
                    scope: SyncScope.MediaPlayer,
                    type: "DeleteStart",
                    mediaPlayerId: event.data?.mediaPlayerid as number,
                    id: event.data?.id as number
                };
            default:
                throw new Error("Event not valid: ", event.type);
        }
    }
}