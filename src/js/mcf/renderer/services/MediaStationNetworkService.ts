import {NetworkService} from "./NetworkService";
import {ICachedMedia, MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {MediaApp} from "../dataStructure/MediaApp";
import {Content} from "../dataStructure/Content";
import {IMedia} from "../dataStructure/Media";

export interface IOnSyncStep {
    (message: string): void
}

export class MediaStationNetworkService {

    static CONTENT_DOWNLOAD_SUCCESS: string = "contents of mediaStation received and saved: ";
    static CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM: string = "download of contents of mediaStation failed, because controller-app did not answer: ";
    static CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER: string = "download of contents of mediaStation failed, because controller-app does not have a contents.json file saved: ";
    static CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP: string = "download of contents of mediaStation failed, because there is no controller-ip specified!";
    static CONTENT_DOWNLOAD_FAILED_APP_BLOCKED: string = "download of contents of mediaStation for user-app failed, because it is blocked by an admin-app!";

    private _networkService: NetworkService;
    private _mediaStationRepo: MediaStationRepository;

    constructor(networkService: NetworkService, mediaStationRepo: MediaStationRepository) {
        this._networkService = networkService;
        this._mediaStationRepo = mediaStationRepo;
    }

    async sendCommandMute(mediaStationId: number): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        for (const [key, item] of mediaStation.getAllMediaApps()) {
            if (item.ip && item.ip !== "")
                await this._networkService.sendSystemCommandTo(item.ip, ["volume", "mute"]);
            else
                console.error("Sending mute-command to media-app failed, because there is no ip set: ", item.name, item.ip)
        }
    }

    async sendCommandUnmute(mediaStationId: number): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        for (const [key, item] of mediaStation.getAllMediaApps()) {
            if (item.ip && item.ip !== "")
                await this._networkService.sendSystemCommandTo(item.ip, ["volume", "unmute"]);
            else
                console.error("Sending unmute-command to media-app failed, because there is no ip set: ", item.name, item.ip)
        }
    }

    async sendCommandSetVolume(mediaStationId: number, volume: number): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        for (const [key, item] of mediaStation.getAllMediaApps()) {
            if (item.ip && item.ip !== "")
                await this._networkService.sendSystemCommandTo(item.ip, ["volume", "set", volume.toString()]);
            else
                console.error("Sending set volume-command to media-app failed, because there is no ip set: ", item.name, item.ip)
        }
    }

    onBlockReceived(callback:Function):void{
        this._networkService.onBlockReceived(callback);
    }

    onUnBlockReceived(callback:Function):void{
        this._networkService.onUnBlockReceived(callback);
    }

    /**
     * gets the controller-ip of the passed mediaStation, sends the command to download the content-file of this controller-app
     * and saves the contents-json to the mediaStation.
     *
     * The registration will be kept alive and the connection open after this method
     *
     * Always resolves the promise with different strings (see statics in this class), only throws an error if the passed mediaStationId does not exist
     *
     * @param {number} id
     * @param {boolean} boolean preserveMSname  if true, the actually set name in the mediaStation object is preserved, if false the name is overwritten by the
     * name loaded from the contents-file
     * @param {string} role either "admin" or "user": determines if the app registers as admin- or user-app on the media-apps
     * @returns {Promise<string>}
     */
    async downloadContentsOfMediaStation(id: number, preserveMSname:boolean,role:string = "admin"): Promise<string> {
        let mediaStation: MediaStation = this._findMediaStation(id);
        const controllerIP: string = mediaStation.getControllerIp();
        let contentsJSON: string;

        if (!controllerIP)
            return MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP;

        let pingResult: boolean = await this._networkService.pcRespondsToPing(controllerIP);

        if (!pingResult)
            return MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP;

        let connection: boolean = await this._networkService.openConnection(controllerIP);

        if (!connection) {
            console.log("NO CONNECTION")
            return MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP;
        }

        let appIsOnline: boolean = await this._networkService.isMediaAppOnline(controllerIP);

        if (!appIsOnline)
            return MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP;

        let registration: string

        if(role === "admin")
            registration = await this._networkService.sendRegistrationAdminApp(controllerIP);
        else if(role === "user")
            registration = await this._networkService.sendRegistrationUserApp(controllerIP);
        else
            throw new Error("Role not valid: " + role);

        console.log("got registration-answer: ", registration)

        if (registration === "no") {
            console.log("NO registration")
            return MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP;
        }else if(registration === "yes_blocked") {
            console.log("registration, but blocked")
            return MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_APP_BLOCKED;
        }

        contentsJSON = await this._networkService.getContentFileFrom(controllerIP);

        console.log("got contents-file: ", contentsJSON)

        if (contentsJSON === null) {
            return MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP;
        } else if (contentsJSON === "{}") {
            mediaStation.reset();
            return MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER + controllerIP;
        } else {
            mediaStation.importFromJSON(JSON.parse(contentsJSON), preserveMSname);

            this._mediaStationRepo.updateAndSaveMediaStation(mediaStation);

            return MediaStationNetworkService.CONTENT_DOWNLOAD_SUCCESS + mediaStation.id;
        }
    }

    /**
     * checks if all media-apps (including the controller) are online, reachable and registration is possible (as admin-app)
     *
     * returns true if this is true for all of them
     *
     * returns false if one of the media-apps is not reachable
     *
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async checkOnlineStatusOfAllMediaApps(id: number): Promise<boolean> {
        let mediaStation: MediaStation = this._findMediaStation(id);
        const controllerIP: string = mediaStation.getControllerIp();
        let contentsJSONstr: string;
        let contentsJSON: any;

        if (!controllerIP)
            return false;

        if (!await this._networkService.pcRespondsToPing(controllerIP))
            return false;

        if (!await this._networkService.openConnection(controllerIP))
            return false;

        if (!await this._networkService.isMediaAppOnline(controllerIP))
            return false;

        if (!await this._networkService.sendCheckRegistration(controllerIP))
            return false;

        contentsJSONstr = await this._networkService.getContentFileFrom(controllerIP);

        if (contentsJSONstr === null)
            return false;
        else if (contentsJSONstr === "{}")
            return true;
        else {
            contentsJSON = JSON.parse(contentsJSONstr);

            if (contentsJSON.mediaApps) {
                for (let i: number = 0; i < contentsJSON.mediaApps.length; i++) {
                    console.log("FOUND MEDIA-APP IN JSON: ", contentsJSON.mediaApps[i], contentsJSON.mediaApps[i].id, contentsJSON.mediaApps[i].name)

                    if (contentsJSON.mediaApps[i].role !== MediaApp.ROLE_CONTROLLER)
                        if (!await this._checkMediaAppAvailability(contentsJSON.mediaApps[i].ip))
                            return false;
                }
            }

            await this._networkService.unregisterAndCloseConnection(controllerIP);
        }
        return true;
    }

    private async _checkMediaAppAvailability(ip: string): Promise<boolean> {

        if (!await this._networkService.pcRespondsToPing(ip))
            return false;

        if (!await this._networkService.openConnection(ip))
            return false;

        if (!await this._networkService.isMediaAppOnline(ip))
            return false;

        if (!await this._networkService.sendCheckRegistration(ip))
            return false;

        return true;
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
    async syncMediaStation(mediaStationId: number, onSyncStep: IOnSyncStep, role:string = "admin"): Promise<boolean> {
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
            idOnMediaApp = await this._networkService.sendMediaFileToIp(ipMediaApp, cachedMedia.fileExtension, fileData,360000,
                onSyncStep);
            console.log("RECEIVED ID FROM MEDIA-APP: ", idOnMediaApp);

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