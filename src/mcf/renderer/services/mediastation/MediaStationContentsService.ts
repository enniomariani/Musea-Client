import {NetworkService} from "src/mcf/renderer/network/NetworkService";
import {MediaStationRepository} from "src/mcf/renderer/dataStructure/MediaStationRepository";
import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";

export class MediaStationContentsService {

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
        const mediaStation: MediaStation = this._mediaStationRepo.requireMediaStation(id);
        const controllerIP: string|null = mediaStation.mediaAppRegistry.getControllerIp();
        let contentsJSON: string|null;

        if (!controllerIP)
            return MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP;

        let pingResult: boolean = await this._networkService.pcRespondsToPing(controllerIP);

        if (!pingResult)
            return MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP;

        let connection: boolean = await this._networkService.openConnection(controllerIP);

        if (!connection)
            return MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP;

        let appIsOnline: boolean = await this._networkService.isMediaAppOnline(controllerIP);

        if (!appIsOnline)
            return MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP;

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
            return MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP;
        }else if(registration === "yes_blocked") {
            console.log("registration, but blocked")
            return MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_APP_BLOCKED;
        }

        contentsJSON = await this._networkService.getContentFileFrom(controllerIP);

        console.log("got contents-file: ", contentsJSON)

        if (contentsJSON === null) {
            return MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP;
        } else if (contentsJSON === "{}") {
            mediaStation.reset();
            return MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER + controllerIP;
        } else {
            mediaStation.importFromJSON(JSON.parse(contentsJSON), preserveMSname);

            await this._mediaStationRepo.saveMediaStations();

            return MediaStationContentsService.CONTENT_DOWNLOAD_SUCCESS + mediaStation.id;
        }
    }
}