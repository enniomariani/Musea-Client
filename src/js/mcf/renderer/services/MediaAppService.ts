import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {MediaApp} from "../dataStructure/MediaApp";
import {NetworkService} from "./NetworkService";

export interface IMediaAppData {
    ip: string
    name: string
    isController: boolean
}

export class MediaAppService {
    private _mediaStationRepository: MediaStationRepository;
    private _networkService: NetworkService;

    constructor(mediaStationRepository: MediaStationRepository, networkService: NetworkService) {
        this._mediaStationRepository = mediaStationRepository;
        this._networkService = networkService;
    }

    createMediaApp(mediaStationId: number, name: string, ip: string): number {
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);
        let mediaAppId: number;

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        mediaAppId = mediaStation.getNextMediaAppId();

        mediaStation.addMediaApp(mediaAppId, name, ip, mediaAppId === 0 ? MediaApp.ROLE_CONTROLLER : MediaApp.ROLE_DEFAULT);

        if (mediaAppId === 0)
            this._mediaStationRepository.updateAndSaveMediaStation(mediaStation);
        else
            this._mediaStationRepository.updateMediaStation(mediaStation);

        return mediaAppId;
    }

    getAllMediaApps(mediaStationId: number): Map<number, IMediaAppData> {
        let map: Map<number, IMediaAppData> = new Map();
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        let allMediaApps: Map<number, MediaApp> = mediaStation.getAllMediaApps();

        allMediaApps.forEach((mediaApp: MediaApp) => {
            map.set(mediaApp.id, {
                name: mediaApp.name,
                ip: mediaApp.ip,
                isController: mediaApp.role === MediaApp.ROLE_CONTROLLER
            });
        });

        return map;
    }

    getName(mediaStationId: number, mediaAppId: number): string {
        return this._getMediaApp(mediaStationId, mediaAppId).name;
    }

    changeName(mediaStationId: number, mediaAppId: number, name: string): void {
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);
        let mediaApp: MediaApp = this._getMediaApp(mediaStationId, mediaAppId);

        mediaApp.name = name;

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    getIp(mediaStationId: number, mediaAppId: number): string {
        return this._getMediaApp(mediaStationId, mediaAppId).ip;
    }

    changeIp(mediaStationId: number, mediaAppId: number, ip: string): void {
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);

        this._getMediaApp(mediaStationId, mediaAppId).ip = ip;

        console.log("ID: ", mediaAppId)

        if (mediaAppId === 0)
            this._mediaStationRepository.updateAndSaveMediaStation(mediaStation);
        else
            this._mediaStationRepository.updateMediaStation(mediaStation);
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
            if (!await this._networkService.sendRegistrationAdminApp(ip))
                return false;
        } else if (appType === "user") {
            if (!await this._networkService.sendRegistrationUserApp(ip))
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