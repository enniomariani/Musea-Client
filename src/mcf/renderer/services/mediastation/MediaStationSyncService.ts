import {NetworkService} from "src/mcf/renderer/network/NetworkService";
import {MediaStationRepository} from "src/mcf/renderer/dataStructure/MediaStationRepository";
import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";
import {MediaApp} from "src/mcf/renderer/dataStructure/MediaApp";
import {ICachedMedia} from "src/mcf/renderer/fileHandling/MediaFileCacheHandler";
import {MediaAppConnectionService} from "src/mcf/renderer/services/MediaAppConnectionService";
import {MediaAppConnectionStatus} from "src/mcf/renderer/network/MediaAppConnectionSteps";
import {MediaAppSyncService} from "src/mcf/renderer/network/MediaAppSyncService";
import {ConnectionStatus, ProgressReporter, SyncScope} from "src/mcf/renderer/services/mediastation/SyncEvents";

export class MediaStationSyncService {

    private _networkService: NetworkService;
    private _mediaStationRepo: MediaStationRepository;
    private _mediaAppConnectionService: MediaAppConnectionService;
    private _mediaAppSyncService: MediaAppSyncService;

    constructor(networkService: NetworkService, mediaStationRepo: MediaStationRepository, mediaAppConnectionService: MediaAppConnectionService, mediaAppSyncService: MediaAppSyncService) {
        this._networkService = networkService;
        this._mediaStationRepo = mediaStationRepo;
        this._mediaAppConnectionService = mediaAppConnectionService;
        this._mediaAppSyncService = mediaAppSyncService;
    }

    /**
     * sends all cached media-files to the media-apps of a mediaStation.
     * If it receives an ID back from the media-app, it sets the idOnMediaApp
     * property of the media to this ID and deletes the cached file.
     *
     * After that it sends the contents-json with the actualized IDs to the controller-app
     *
     * Attention: always registers as admin-app, never as user-app!
     *
     * @param {number} mediaStationId
     * @param {ProgressReporter} progressReporter  Is called after every new network-operation an event with info about what is going on
     * @returns {Promise<void>}
     */
    async sync(mediaStationId: number, progressReporter: ProgressReporter): Promise<boolean> {
        const mediaStation: MediaStation = this._mediaStationRepo.requireMediaStation(mediaStationId);
        let json: string;
        let mediaApp: MediaApp;
        let allMediaAppsWereSynced: boolean = true;
        let areAllMediaSentSuccesfully: boolean = true;

        let controller: MediaApp;
        let cachedMediaOfAllMediaStations: Map<number, ICachedMedia[]>;
        let allCachedMedia: ICachedMedia[];
        let allMediaIdsToDelete: Map<number, number[]>
        let allMediaToAdd: Map<MediaApp, ICachedMedia[]> = new Map();
        let allMediaToDelete: Map<MediaApp, number[]> = new Map();

        let allMediaAppsWithChanges: MediaApp[] = [];

        //send all media to the media-apps
        cachedMediaOfAllMediaStations = this._mediaStationRepo.mediaCacheHandler.getAllCachedMedia();
        allCachedMedia = cachedMediaOfAllMediaStations.get(mediaStationId);
        allMediaIdsToDelete = await this._mediaStationRepo.getAllMediaIDsToDelete(mediaStationId);

        //save all cachedMedia by their mediaApp, because all media-operations are executed per media-app (all actions for media-app 1 first,
        //then for media app 2, etc.
        if (allCachedMedia) {
            for (const cachedMedia of allCachedMedia) {
                mediaApp = mediaStation.mediaAppRegistry.get(cachedMedia.mediaAppId);

                if (!allMediaToAdd.has(mediaApp)) {
                    allMediaToAdd.set(mediaApp, []);
                    allMediaAppsWithChanges.push(mediaApp);
                }

                allMediaToAdd.get(mediaApp).push(cachedMedia);
            }
        }

        for (const [mediaAppId, idsToDelete] of allMediaIdsToDelete) {
            mediaApp = mediaStation.mediaAppRegistry.get(mediaAppId);
            allMediaToDelete.set(mediaApp, idsToDelete);

            if (allMediaAppsWithChanges.indexOf(mediaApp) === -1)
                allMediaAppsWithChanges.push(mediaApp);
        }

        //loop through all existing media apps in the mediastation and try to connect to them and register
        for (const mediaApp of allMediaAppsWithChanges) {
            progressReporter({scope: SyncScope.MediaApp, type: "Connecting", appName: mediaApp.name, ip: mediaApp.ip})

            const answer: MediaAppConnectionStatus = await this._mediaAppConnectionService.checkConnection(mediaStationId, mediaApp.id, {role: "admin"});
            progressReporter({scope: SyncScope.MediaApp, type: "ConnectionStatus", status: this._mapConnectionStatusToProgress(answer) });

            if (answer !== MediaAppConnectionStatus.Online) {
                allMediaAppsWereSynced = false;
                continue;
            }

            await this._mediaAppConnectionService.connectAndRegisterToMediaApp(mediaStationId, mediaApp.id, "admin");

            //if the connection could be established to a media-app, send all cached media-files
            // if (await this._mediaAppSyncService.sendMediaFilesToMediaApp(mediaStation, allMediaToAdd.get(mediaApp), mediaApp.ip, onSyncStep) === false)
            //     areAllMediaSentSuccesfully = false;

            // if (allMediaIdsToDelete.has(mediaApp.id))
            //     await this._mediaAppSyncService.sendCommandDeleteMediaToMediaApps(mediaStationId, mediaApp.id, allMediaIdsToDelete.get(mediaApp.id), mediaApp.ip, onSyncStep);

            this._mediaStationRepo.cacheMediaStation(mediaStationId);
        }

        console.log("CHECK IF CONTENTS.JSON WILL BE SENT: ", allMediaAppsWereSynced, areAllMediaSentSuccesfully)

        if (allMediaAppsWereSynced && areAllMediaSentSuccesfully) {
            // send content-file (last step in synchronisation)
            controller = mediaStation.mediaAppRegistry.getController();

            progressReporter({scope: SyncScope.Controller, type: "Connecting", ip: controller.ip});

            const answer: MediaAppConnectionStatus = await this._mediaAppConnectionService.checkConnection(mediaStationId, mediaApp.id, {role: "admin"});
            progressReporter({scope: SyncScope.MediaApp, type: "ConnectionStatus", status: this._mapConnectionStatusToProgress(answer) });

            console.log("CONNECTION CREATED FOR SENDING CONTENT-FILE?", answer);

            if (answer === MediaAppConnectionStatus.Online) {
                await this._mediaAppConnectionService.connectAndRegisterToMediaApp(mediaStationId, mediaApp.id, "admin");

                progressReporter({scope: SyncScope.Controller, type: "SendingContents"});
                json = mediaStation.exportToJSON();

                console.log("SEND CONTENTS-FILE: ", json);

                await this._networkService.sendContentFileTo(controller.ip, json);
                this._mediaStationRepo.removeCachedMediaStation(mediaStationId);

                progressReporter({scope: SyncScope.Controller, type: "Sent"});
                progressReporter({scope: SyncScope.MediaStation, type: "Done"});

                return true;
            }
        }

        progressReporter({scope: SyncScope.MediaStation, type: "Done"});
        return false;
    }

    private _mapConnectionStatusToProgress(status: MediaAppConnectionStatus): ConnectionStatus {
        switch (status) {
            case MediaAppConnectionStatus.IcmpPingFailed:
                return ConnectionStatus.IcmpPingFailed;
            case MediaAppConnectionStatus.TcpConnectionFailed:
                return ConnectionStatus.TcpConnectionFailed;
            case MediaAppConnectionStatus.WebSocketPingFailed:
                return ConnectionStatus.WebSocketPingFailed;
            case MediaAppConnectionStatus.RegistrationFailed:
                return ConnectionStatus.RegistrationFailed;
            case MediaAppConnectionStatus.Online:
                return ConnectionStatus.Online;
            default:
                throw Error("ConnectionStatus not valid: " + status);
        }
    }

}