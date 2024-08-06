import {NetworkService} from "./NetworkService";
import {ICachedMedia, MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {MediaApp} from "../dataStructure/MediaApp";
import {Content} from "../dataStructure/Content";
import {IMedia} from "../dataStructure/Media";
import {ContentFileService} from "../fileHandling/ContentFileService";
import {ContentService} from "./ContentService";

export interface IOnSyncStep {
    (message: string): void
}

export class MediaStationNetworkService {

    static CONTENT_DOWNLOAD_SUCCESS: string = "contents of mediaStation received and saved: ";
    static CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM: string = "download of contents of mediaStation failed, because controller-app did not answer: ";
    static CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER: string = "download of contents of mediaStation failed, because controller-app does not have a contents.json file saved: ";
    static CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP: string = "download of contents of mediaStation failed, because there is no controller-ip specified!";

    private _networkService: NetworkService;
    private _mediaStationRepo: MediaStationRepository;
    private _contentFileService:ContentFileService;

    constructor(networkService: NetworkService, mediaStationRepo: MediaStationRepository, contentFileService:ContentFileService) {
        this._networkService = networkService;
        this._mediaStationRepo = mediaStationRepo;
        this._contentFileService = contentFileService;
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
     * @returns {Promise<string>}
     */
    async downloadContentsOfMediaStation(id: number): Promise<string> {
        let mediaStation: MediaStation = this._findMediaStation(id);
        return this._downloadContentsFromMediaStationAndSendToMediaStation(mediaStation, mediaStation.importFromJSON.bind(mediaStation));
    }

    /**
     * gets the controller-ip of the passed mediaStation, sends the command to download the content-file of this controller-app
     * and saves the media-app information to the mediaStation.
     *
     * Disconnects and closes the connection after it received the data
     *
     * Always resolves the promise with different strings (see statics in this class), only throws an error if the passed mediaStationId does not exist
     *
     * @param {number} id
     * @returns {Promise<string>}
     */
    async downloadOnlyMediaAppDataFromMediaStation(id: number): Promise<string> {
        let mediaStation: MediaStation = this._findMediaStation(id);
        return this._downloadContentsFromMediaStationAndSendToMediaStation(mediaStation, mediaStation.importMediaAppsFromJSON.bind(mediaStation), true);
    }

    private _downloadContentsFromMediaStationAndSendToMediaStation(mediaStation: MediaStation, functionToCallAtMediStation: Function, closeConnection: boolean = false): Promise<string> {
        const controllerIP: string = mediaStation.getControllerIp();
        let contentsJSON: string;

        return new Promise(async (resolve, reject) => {

            if (!controllerIP) {
                resolve(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP);
                return;
            }

            let connection: boolean = await this._networkService.openConnection(controllerIP);

            if (!connection) {
                resolve(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP);
                return;
            }

            let registration: boolean = await this._networkService.sendRegistration(controllerIP);

            if (!registration) {
                resolve(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP);
                return;
            }

            contentsJSON = await this._networkService.getContentFileFrom(controllerIP);

            if (contentsJSON === null) {
                resolve(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP);
            } else if (contentsJSON === "{}") {
                resolve(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER + controllerIP);
            } else {
                functionToCallAtMediStation(JSON.parse(contentsJSON));

                if (closeConnection)
                    await this._networkService.unregisterAndCloseConnection(controllerIP);

                resolve(MediaStationNetworkService.CONTENT_DOWNLOAD_SUCCESS + mediaStation.id);
            }
        });
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
     * @returns {Promise<void>}
     */
    async syncMediaStation(mediaStationId: number, onSyncStep: IOnSyncStep): Promise<void> {
        console.log("SYNC MEDIA STATION: ", mediaStationId)
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let json: string;
        let connectionIsOpen: boolean;
        let mediaApp: MediaApp;
        let allMediaAppsWereSynced:boolean = true;

        return new Promise(async (resolve, reject) => {
            let ip: string;
            let cachedMediaOfAllMediaStations: Map<number, ICachedMedia[]>;
            let allCachedMedia: ICachedMedia[];
            let allMediaOperationsByMediaApp: Map<MediaApp, ICachedMedia[]> = new Map();

            //send all media to the media-apps
            cachedMediaOfAllMediaStations = this._mediaStationRepo.getAllCachedMedia();
            allCachedMedia = cachedMediaOfAllMediaStations.get(mediaStationId);

            if (allCachedMedia) {
                //save all cachedMedia by their mediaApp, because all media-operations are executed per media-app (all actions for media-app 1 first,
                //then for media app 2, etc.
                for (const cachedMedia of allCachedMedia) {
                    mediaApp = mediaStation.getMediaApp(cachedMedia.mediaAppId);

                    if (!allMediaOperationsByMediaApp.has(mediaApp))
                        allMediaOperationsByMediaApp.set(mediaApp, []);

                    allMediaOperationsByMediaApp.get(mediaApp).push(cachedMedia);
                }

                console.log("FOUND CACHED MEDIA: ", allMediaOperationsByMediaApp);

                //loop through all existing media apps in the mediastation and try to connect to them
                for (const [mediaApp, allCachedMedia] of allMediaOperationsByMediaApp) {
                    onSyncStep("Verbindung mit Medien-App wird aufgebaut: " + mediaApp.name + "/" + mediaApp.ip);

                    connectionIsOpen = await this._networkService.openConnection(mediaApp.ip);

                    //if the connection could be established to a media-app, send it all media that are cached
                    if (connectionIsOpen) {
                        onSyncStep("Verbindung mit Medien-App hergestellt.");
                        await this._sendMediaFilesToMediaApp(mediaStation, allCachedMedia, mediaApp.ip, onSyncStep);
                        this._contentFileService.saveFile(mediaStationId, mediaStation.exportToJSON());
                    } else {
                        allMediaAppsWereSynced = false;
                        onSyncStep("Verbindung mit Medien-App konnte nicht hergestellt werden!");
                    }
                }
            }

            if(allMediaAppsWereSynced){
                // send content-file (last step in synchronisation)
                ip = mediaStation.getControllerIp();

                onSyncStep("Sende contents.json an Controller-App: " + ip);

                connectionIsOpen = await this._networkService.openConnection(ip);
                console.log("CONNECTION CREATED FOR SENDING CONTENT-FILE?", connectionIsOpen);

                if (connectionIsOpen) {
                    onSyncStep("Verbindung mit Controller-App hergestellt. Sende Daten...");
                    json = mediaStation.exportToJSON();

                    console.log("SEND CONTENTS-FILE: ", json);

                    this._networkService.sendContentFileTo(ip, json);

                    this._contentFileService.deleteFile(mediaStationId);
                } else
                    onSyncStep("Controller-App nicht erreichbar!");
            }

            resolve();
        });
    }

    private async _sendMediaFilesToMediaApp(mediaStation: MediaStation, allCachedMedia: ICachedMedia[], ipMediaApp: string, onSyncStep: IOnSyncStep): Promise<void> {
        let fileData: Uint8Array;
        let idOnMediaApp: number;
        let content: Content;
        let media: IMedia;

        for (const cachedMedia of allCachedMedia) {
            onSyncStep("Medium wird gesendet: " + cachedMedia.fileExtension);
            console.log("SEND MEDIA: ", cachedMedia);
            fileData = await this._mediaStationRepo.getCachedMediaFile(mediaStation.id, cachedMedia.contentId, cachedMedia.mediaAppId, cachedMedia.fileExtension);

            idOnMediaApp = await this._networkService.sendMediaFileToIp(ipMediaApp, cachedMedia.fileExtension, fileData);
            console.log("RECEIVED ID FROM MEDIA-APP: ", idOnMediaApp);

            if (idOnMediaApp !== null && idOnMediaApp !== undefined && idOnMediaApp >= 0) {
                onSyncStep("Medium erfolgreich gesendet.");
                content = mediaStation.rootFolder.findContent(cachedMedia.contentId);
                media = content.media.get(cachedMedia.mediaAppId);
                media.idOnMediaApp = idOnMediaApp;

                console.log("SET NEW ID FOR MEDIA: ", content.id, media.idOnMediaApp, idOnMediaApp)

                this._mediaStationRepo.deleteCachedMedia(mediaStation.id, cachedMedia.contentId, cachedMedia.mediaAppId);
            } else
                onSyncStep("Medium konnte nicht gesendet oder empfangen werden!");
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