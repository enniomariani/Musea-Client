import {NetworkService} from "src/mcf/renderer/services/NetworkService";
import {ICachedMedia, MediaStationRepository} from "src/mcf/renderer/dataStructure/MediaStationRepository";
import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";
import {MediaApp} from "src/mcf/renderer/dataStructure/MediaApp";
import {Content} from "src/mcf/renderer/dataStructure/Content";
import {IMedia} from "src/mcf/renderer/dataStructure/Media";

export interface IOnSyncStep {
    (message: string): void
}

export class MediaStationSyncService {

    private _networkService: NetworkService;
    private _mediaStationRepo: MediaStationRepository;

    constructor(networkService: NetworkService, mediaStationRepo: MediaStationRepository) {
        this._networkService = networkService;
        this._mediaStationRepo = mediaStationRepo;
    }

    /**
     * sends all cached media-files to the media-apps of a mediaStation.
     * If it receives an ID back from the media-app, it sets the idOnMediaApp
     * property of the media to this ID and deletes the cached file.
     *
     * After that it sends the contents-json with the actualized IDs to the controller-app
     *
     * @param {number} mediaStationId
     * @param {IOnSyncStep} onSyncStep  Is called after every new network-operation and receives a string with info about what is going on
     * @param {string} role either "admin" or "user": determines if the app registers as admin- or user-app on the media-apps
     * @returns {Promise<void>}
     */
    async sync(mediaStationId: number, onSyncStep: IOnSyncStep, role:string  = "admin"): Promise<boolean> {
        console.log("SYNC MEDIA STATION: ", mediaStationId)
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let json: string;
        let connectionIsOpen: boolean;
        let mediaApp: MediaApp;
        let allMediaAppsWereSynced: boolean = true;
        let areAllMediaSentSuccesfully: boolean = true;

        let ip: string;
        let cachedMediaOfAllMediaStations: Map<number, ICachedMedia[]>;
        let allCachedMedia: ICachedMedia[];
        let allMediaIdsToDelete: Map<number, number[]>
        let allMediaToAdd: Map<MediaApp, ICachedMedia[]> = new Map();
        let allMediaToDelete: Map<MediaApp, number[]> = new Map();

        let allMediaAppsWithChanges: MediaApp[] = [];

        let registration: string;

        //send all media to the media-apps
        cachedMediaOfAllMediaStations = this._mediaStationRepo.getAllCachedMedia();
        allCachedMedia = cachedMediaOfAllMediaStations.get(mediaStationId);
        allMediaIdsToDelete = await this._mediaStationRepo.getAllMediaIDsToDelete(mediaStationId);

        //save all cachedMedia by their mediaApp, because all media-operations are executed per media-app (all actions for media-app 1 first,
        //then for media app 2, etc.
        if (allCachedMedia) {
            for (const cachedMedia of allCachedMedia) {
                mediaApp = mediaStation.getMediaApp(cachedMedia.mediaAppId);

                if (!allMediaToAdd.has(mediaApp)) {
                    allMediaToAdd.set(mediaApp, []);
                    allMediaAppsWithChanges.push(mediaApp);
                }

                allMediaToAdd.get(mediaApp).push(cachedMedia);
            }
        }

        for (const [mediaAppId, idsToDelete] of allMediaIdsToDelete) {
            mediaApp = mediaStation.getMediaApp(mediaAppId);
            allMediaToDelete.set(mediaApp, idsToDelete);

            if (allMediaAppsWithChanges.indexOf(mediaApp) === -1)
                allMediaAppsWithChanges.push(mediaApp);
        }

        //loop through all existing media apps in the mediastation and try to connect to them and register
        for (const mediaApp of allMediaAppsWithChanges) {
            onSyncStep("Verbindung mit Medien-App wird aufgebaut: " + mediaApp.name + "/" + mediaApp.ip);

            connectionIsOpen = await this._networkService.openConnection(mediaApp.ip);

            if (!connectionIsOpen) {
                onSyncStep("Verbindung mit Medien-App konnte nicht hergestellt werden!");
                allMediaAppsWereSynced = false;
                continue;
            }

            if(role === "admin")
                registration = await this._networkService.sendRegistrationAdminApp(mediaApp.ip);
            else if(role === "user")
                registration = await this._networkService.sendRegistrationUserApp(mediaApp.ip);
            else
                throw new Error("Role not valid: " + role);

            console.log("got registration back: ", registration)

            //if the connection could be established to a media-app, send it all media that are cached
            if (registration === "yes") {
                onSyncStep("Verbindung mit Medien-App hergestellt.");
                if (await this._sendMediaFilesToMediaApp(mediaStation, allMediaToAdd.get(mediaApp), mediaApp.ip, onSyncStep) === false)
                    areAllMediaSentSuccesfully = false;

                if (allMediaIdsToDelete.has(mediaApp.id))
                    await this._sendCommandDeleteMediaToMediaApps(mediaStationId, mediaApp.id, allMediaIdsToDelete.get(mediaApp.id), mediaApp.ip, onSyncStep);

                this._mediaStationRepo.cacheMediaStation(mediaStationId);
            } else {
                allMediaAppsWereSynced = false;
                onSyncStep("Medien-App ist erreichbar, aber von einer anderen App blockiert.");
            }
        }

        console.log("CHECK IF CONTENTS.JSON WILL BE SENT: ", allMediaAppsWereSynced, areAllMediaSentSuccesfully)

        if (allMediaAppsWereSynced && areAllMediaSentSuccesfully) {
            // send content-file (last step in synchronisation)
            ip = mediaStation.getControllerIp();

            onSyncStep("Sende contents.json an Controller-App: " + ip);

            connectionIsOpen = await this._networkService.openConnection(ip);
            console.log("CONNECTION CREATED FOR SENDING CONTENT-FILE?", connectionIsOpen);

            if (connectionIsOpen) {
                onSyncStep("Verbindung mit Controller-App hergestellt. Sende Registrierungs-Anfrage...");

                if(role === "admin")
                    registration = await this._networkService.sendRegistrationAdminApp(ip);
                else if(role === "user")
                    registration = await this._networkService.sendRegistrationUserApp(ip);
                else
                    throw new Error("Role not valid: " + role);

                console.log("beim controller registriert? ", registration)

                if (registration === "yes") {
                    onSyncStep("Verbindung mit Controller-App hergestellt. Sende Daten...");
                    json = mediaStation.exportToJSON();

                    console.log("SEND CONTENTS-FILE: ", json);

                    await this._networkService.sendContentFileTo(ip, json);

                    this._mediaStationRepo.removeCachedMediaStation(mediaStationId);

                    onSyncStep("Daten übermittelt.");
                    return true;
                } else
                    onSyncStep("Controller-App ist erreichbar, aber von einer anderen App blockiert.");

            } else
                onSyncStep("Controller-App nicht erreichbar!");
        }

        return false;
    }

    private async _sendMediaFilesToMediaApp(mediaStation: MediaStation, allCachedMedia: ICachedMedia[], ipMediaApp: string, onSyncStep: IOnSyncStep): Promise<boolean> {
        let fileData: Uint8Array;
        let idOnMediaApp: number;
        let content: Content;
        let media: IMedia;
        let areAllMediaSentSuccesfully: boolean = true;

        if (!allCachedMedia)
            return true;

        for (const cachedMedia of allCachedMedia) {
            onSyncStep("Lade Medium: " + cachedMedia.fileExtension);
            console.log("SEND MEDIA: ", cachedMedia);
            fileData = await this._mediaStationRepo.getCachedMediaFile(mediaStation.id, cachedMedia.contentId, cachedMedia.mediaAppId, cachedMedia.fileExtension);

            onSyncStep("Medium geladen, sende...");
            idOnMediaApp = await this._networkService.sendMediaFileToIp(ipMediaApp, cachedMedia.fileExtension, fileData,240000,
                onSyncStep);
            console.log("RECEIVED ID FROM MEDIA-APP: ", idOnMediaApp);

            fileData = null;

            if (idOnMediaApp !== null && idOnMediaApp !== undefined && idOnMediaApp >= 0) {
                onSyncStep("Medium erfolgreich gesendet.");

                content = mediaStation.rootFolder.findContent(cachedMedia.contentId);
                media = content.media.get(cachedMedia.mediaAppId);

                media.idOnMediaApp = idOnMediaApp;

                console.log("SET NEW ID FOR MEDIA: ", content.id, media.idOnMediaApp, idOnMediaApp)

                this._mediaStationRepo.deleteCachedMedia(mediaStation.id, cachedMedia.contentId, cachedMedia.mediaAppId);
            } else {
                areAllMediaSentSuccesfully = false;
                console.log("MEDIUM KONNTE NICHT GESENDET ODER EMPFANGEN WERDEN!")
                onSyncStep("Medium konnte nicht gesendet oder empfangen werden!");
            }
        }
        return areAllMediaSentSuccesfully;
    }

    private async _sendCommandDeleteMediaToMediaApps(mediaStationId: number, mediaAppId: number, allMediaIdsToDelete: number[], ipMediaApp: string, onSyncStep: IOnSyncStep): Promise<void> {
        for (const id of allMediaIdsToDelete) {
            onSyncStep("Lösche ID: " + id + " in der Medien-App: " + mediaAppId.toString());
            console.log("DELETE MEDIA: ", id);

            await this._networkService.sendDeleteMediaTo(ipMediaApp, id);
            await this._mediaStationRepo.deleteStoredMediaID(mediaStationId, mediaAppId, id);
        }
    }

    private _findMediaStation(id: number): MediaStation {
        let mediaStation: MediaStation = this._mediaStationRepo.findMediaStation(id);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);
        else
            return mediaStation;
    }
}