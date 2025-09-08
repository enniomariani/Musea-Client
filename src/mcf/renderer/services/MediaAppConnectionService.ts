import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {MediaApp} from "../dataStructure/MediaApp";
import {NetworkService} from "src/mcf/renderer/network/NetworkService";

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

        if(appType !== "admin" && appType !== "user")
            throw new Error("App-Type is not valid: " + appType);

        if (!await this._networkService.openConnection(ip))
            return false;

        if (appType === "admin") {
            if (await this._networkService.sendRegistrationAdminApp(ip) === "no")
                return false;
        } else if (appType === "user") {
            if (await this._networkService.sendRegistrationUserApp(ip) === "no")
                return false;
        }

        return true;
    }

    async unregisterAndCloseMediaApp(mediaStationId: number, mediaAppId: number): Promise<void> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;

        return new Promise(async (resolve) => {
            await this._networkService.unregisterAndCloseConnection(ip);
            resolve();
        });
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
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(id);
        const controllerIP: string = mediaStation.mediaAppRegistry.getControllerIp();
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

    private _getMediaApp(mediaStationId: number, mediaAppId: number): MediaApp {
        let mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let mediaApp: MediaApp;

        mediaApp = mediaStation.mediaAppRegistry.get(mediaAppId);

        if (!mediaApp)
            throw new Error("Media-App with this ID does not exist: " + mediaAppId);

        return mediaApp;
    }
}