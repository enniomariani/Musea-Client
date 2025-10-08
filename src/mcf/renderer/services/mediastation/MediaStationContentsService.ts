import {NetworkService} from "src/mcf/renderer/network/NetworkService";
import {MediaStationRepository} from "src/mcf/renderer/dataStructure/MediaStationRepository";
import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";

export enum ContentDownloadStatus{
    Success = "success",
    SuccessNoContentsOnController = "failedNoContentsOnController",
    FailedNoResponseFrom = "failedNoResponseFrom",
    FailedNoControllerIp = "failedNoControllerIp",
    FailedAppBlocked = "failedAppBlocked"
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
     * Always resolves the promise with different strings (see statics in this class), only throws an error if the passed mediaStationId does not exist
     *
     * @param {number} id
     * @param {boolean} preserveMSname if true, the actually set name in the mediaStation object is preserved, if false the name is overwritten by the
     * name loaded from the contents-file
     * @param {string} role either "admin" or "user": determines if the app registers as admin- or user-app on the media-apps
     * @returns {Promise<string>}
     */
    async downloadContentsOfMediaStation(id: number, preserveMSname: boolean, role: ("user" | "admin") = "admin"): Promise<string> {
        const mediaStation: MediaStation = this._mediaStationRepo.requireMediaStation(id);
        const controllerIP: string | null = mediaStation.mediaAppRegistry.getControllerIp();
        let contentsJSON: string | null;

        if (!controllerIP)
            return ContentDownloadStatus.FailedNoControllerIp;

        const pingResult: boolean = await this._networkService.pcRespondsToPing(controllerIP);

        if (!pingResult)
            return ContentDownloadStatus.FailedNoResponseFrom + controllerIP;

        const connection: boolean = await this._networkService.openConnection(controllerIP);

        if (!connection)
            return ContentDownloadStatus.FailedNoResponseFrom + controllerIP;

        const appIsOnline: boolean = await this._networkService.isMediaAppOnline(controllerIP);

        if (!appIsOnline)
            return ContentDownloadStatus.FailedNoResponseFrom + controllerIP;

        let registration: string

        if (role === "admin")
            registration = await this._networkService.sendRegistrationAdminApp(controllerIP);
        else if (role === "user")
            registration = await this._networkService.sendRegistrationUserApp(controllerIP);
        else
            throw new Error("Role not valid: " + role);

        if (registration === "no")
            return ContentDownloadStatus.FailedNoResponseFrom + controllerIP;
         else if (registration === "yes_blocked")
            return ContentDownloadStatus.FailedAppBlocked;

        contentsJSON = await this._networkService.getContentFileFrom(controllerIP);

        if (contentsJSON === null) {
            return ContentDownloadStatus.FailedNoResponseFrom + controllerIP;
        } else if (contentsJSON === "{}") {
            mediaStation.reset();
            return ContentDownloadStatus.SuccessNoContentsOnController + controllerIP;
        } else {
            mediaStation.importFromJSON(JSON.parse(contentsJSON), preserveMSname);
            await this._mediaStationRepo.saveMediaStations();
            return ContentDownloadStatus.Success + mediaStation.id;
        }
    }
}