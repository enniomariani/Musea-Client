import {NetworkService} from "src/mcf/renderer/services/NetworkService";
import {MediaStationRepository} from "src/mcf/renderer/dataStructure/MediaStationRepository";
import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";
import {MediaApp} from "src/mcf/renderer/dataStructure/MediaApp";

export class MediaStationNetworkService {

    private _networkService: NetworkService;
    private _mediaStationRepo: MediaStationRepository;

    constructor(networkService: NetworkService, mediaStationRepo: MediaStationRepository) {
        this._networkService = networkService;
        this._mediaStationRepo = mediaStationRepo;
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

    private _findMediaStation(id: number): MediaStation {
        let mediaStation: MediaStation = this._mediaStationRepo.findMediaStation(id);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);
        else
            return mediaStation;
    }
}