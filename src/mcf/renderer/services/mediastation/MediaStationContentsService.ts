import {NetworkService} from "renderer/network/NetworkService.js";
import {MediaStationRepository} from "renderer/dataStructure/MediaStationRepository.js";
import {MediaStation} from "renderer/dataStructure/MediaStation.js";

export const ContentDownloadStatus = {
    Success : "success",
    SuccessNoContentsOnController : "failedNoContentsOnController",
    FailedNoResponseFrom : "failedNoResponseFrom",
    FailedNoControllerIp : "failedNoControllerIp",
    FailedAppBlocked : "failedAppBlocked"
} as const;
export type ContentDownloadStatus = typeof ContentDownloadStatus[keyof typeof ContentDownloadStatus];

export interface IContentDownloadResult {
    status: ContentDownloadStatus,
    ip:string
}

export class MediaStationContentsService {
    private _networkService: NetworkService;
    private _mediaStationRepo: MediaStationRepository;

    constructor(networkService: NetworkService, mediaStationRepo: MediaStationRepository) {
        this._networkService = networkService;
        this._mediaStationRepo = mediaStationRepo;
    }

    /**
     * Get the controller-ip of the passed mediaStation, sends the command to download the content-file of this controller-app
     * and saves the contents-json to the mediaStation.
     *
     * The registration will be kept alive and the connection open after this method
     *
     * @param {number} id
     * @param {boolean} preserveMSname if true, the actually set name in the mediaStation object is preserved, if false the name is overwritten by the
     * name loaded from the contents-file
     * @param {string} role either "admin" or "user": determines if the app registers as admin- or user-app on the media-apps
     * @returns {Promise<ContentDownloadStatus>}
     */
    async downloadContentsOfMediaStation(id: number, preserveMSname: boolean, role: ("user" | "admin") = "admin"): Promise<IContentDownloadResult> {
        const mediaStation: MediaStation = this._mediaStationRepo.requireMediaStation(id);
        const controllerIP: string | null = mediaStation.mediaAppRegistry.getControllerIp();
        let contentsJSON: string | null;

        if (!controllerIP)
            return {status: ContentDownloadStatus.FailedNoControllerIp, ip:""};

        const pingResult: boolean = await this._networkService.pcRespondsToPing(controllerIP);

        if (!pingResult)
            return {status: ContentDownloadStatus.FailedNoResponseFrom , ip: controllerIP};

        const connection: boolean = await this._networkService.openConnection(controllerIP);

        if (!connection)
            return {status: ContentDownloadStatus.FailedNoResponseFrom , ip: controllerIP};

        const appIsOnline: boolean = await this._networkService.isMediaAppOnline(controllerIP);

        if (!appIsOnline)
            return {status: ContentDownloadStatus.FailedNoResponseFrom , ip: controllerIP};

        let registration: string

        if (role === "admin")
            registration = await this._networkService.sendRegistrationAdminApp(controllerIP);
        else if (role === "user")
            registration = await this._networkService.sendRegistrationUserApp(controllerIP);
        else
            throw new Error("Role not valid: " + role);

        if (registration === "no")
            return {status: ContentDownloadStatus.FailedNoResponseFrom , ip: controllerIP};
         else if (registration === "yes_blocked")
            return {status: ContentDownloadStatus.FailedAppBlocked , ip: controllerIP};

        contentsJSON = await this._networkService.getContentFileFrom(controllerIP);

        if (contentsJSON === null) {
            return {status: ContentDownloadStatus.FailedNoResponseFrom , ip: controllerIP};
        } else if (contentsJSON === "{}") {
            mediaStation.reset();
            return {status: ContentDownloadStatus.SuccessNoContentsOnController , ip: controllerIP};
        } else {
            mediaStation.importFromJSON(JSON.parse(contentsJSON), preserveMSname);
            await this._mediaStationRepo.saveMediaStations();
            return {status: ContentDownloadStatus.Success , ip: controllerIP};
        }
    }
}