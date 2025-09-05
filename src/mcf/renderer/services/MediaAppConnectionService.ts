import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {MediaApp} from "../dataStructure/MediaApp";
import {NetworkService} from "./NetworkService";

export interface IMediaAppData {
    ip: string
    name: string
    isController: boolean
}

export class MediaAppConnectionService {
    private _mediaStationRepository: MediaStationRepository;
    private _networkService: NetworkService;

    constructor(mediaStationRepository: MediaStationRepository, networkService: NetworkService) {
        this._mediaStationRepository = mediaStationRepository;
        this._networkService = networkService;
    }

    async pcRespondsToPing(mediaStationId: number, mediaAppId: number): Promise<boolean> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;
        console.log("MEDIA APP SERVICE: PING: ", mediaStationId, mediaAppId, this._getMediaApp(mediaStationId, mediaAppId))
        return await this._networkService.pcRespondsToPing(ip);
    }

    async isOnline(mediaStationId: number, mediaAppId: number): Promise<boolean> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;
        let connection: boolean = await this._networkService.openConnection(ip);

        if (!connection)
            return new Promise((resolve) => {
                resolve(false)
            });

        return await this._networkService.isMediaAppOnline(ip);
    }

    /**
     * opens the connection to the passed media-app and registers to it
     *
     * @param {number} mediaStationId
     * @param {number} mediaAppId
     * @param {string} appType      either "user" or "admin", default is "admin"
     * @returns {Promise<boolean>}
     */
    async connectAndRegisterToMediaApp(mediaStationId: number, mediaAppId: number, appType: string = "admin"): Promise<boolean> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;

        if (!await this._networkService.openConnection(ip))
            return false;

        if (appType === "admin") {
            if (await this._networkService.sendRegistrationAdminApp(ip) === "no")
                return false;
        } else if (appType === "user") {
            if (await this._networkService.sendRegistrationUserApp(ip) === "no")
                return false;
        } else
            throw new Error("App-Type is not valid: " + appType);

        return true;
    }

    async unregisterAndCloseMediaApp(mediaStationId: number, mediaAppId: number): Promise<void> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;

        return new Promise(async (resolve) => {
            await this._networkService.unregisterAndCloseConnection(ip);
            resolve();
        });
    }

    private _getMediaApp(mediaStationId: number, mediaAppId: number): MediaApp {
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);
        let mediaApp: MediaApp;

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        mediaApp = mediaStation.getMediaApp(mediaAppId);

        if (!mediaApp)
            throw new Error("Media-App with this ID does not exist: " + mediaAppId);

        return mediaApp;
    }
}