import {NetworkService} from "./NetworkService";
import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";


export class MediaStationNetworkService{

    static CONTENT_DOWNLOAD_SUCCESS:string = "contents of mediaStation received and saved: ";
    static CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM:string = "download of contents of mediaStation failed, because controller-app did not answer: ";
    static CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER:string = "download of contents of mediaStation failed, because controller-app does not have a contents.json file saved: ";
    static CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP:string = "download of contents of mediaStation failed, because there is no controller-ip specified!";

    private _networkService:NetworkService;
    private _mediaStationRepo:MediaStationRepository;

    constructor(networkService: NetworkService, mediaStationRepo:MediaStationRepository) {
        this._networkService = networkService;
        this._mediaStationRepo = mediaStationRepo;
    }

    /**
     * gets the controller-ip of the passed mediaStation, sends the command to download the content-file of this controller-app
     * and saves the contents-json to the mediaStation.
     *
     * Always resolves the promise with different strings (see statics in this class), only throws an error if the passed mediaStationId does not exist
     *
     * @param {number} id
     * @returns {Promise<string>}
     */
    async downloadContentsOfMediaStation(id:number):Promise<string>{
        let mediaStation: MediaStation = this._findMediaStation(id);
        const controllerIP:string = mediaStation.getControllerIp();
        let contentsJSON:string;

        return new Promise(async (resolve, reject) =>{

            if(!controllerIP){
                resolve(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP);
                return;
            }

            contentsJSON = await this._networkService.getContentFileFrom(controllerIP);

            if(contentsJSON === null){
                resolve(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIP);
            }else if(contentsJSON === "{}"){
                resolve(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER + controllerIP);
            }
            else{
                mediaStation.importFromJSON(JSON.parse(contentsJSON));
                resolve(MediaStationNetworkService.CONTENT_DOWNLOAD_SUCCESS + id);
            }
        });
    }

    async syncMediaStation(mediaStationId:number){
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let json:string = mediaStation.exportToJSON();

        await this._networkService.openConnection(mediaStation.getControllerIp());

        this._networkService.sendContentFileTo(mediaStation.getControllerIp(), json);
    }

    private _findMediaStation(id: number): MediaStation {
        let mediaStation: MediaStation = this._mediaStationRepo.findMediaStation(id);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);
        else
            return mediaStation;
    }
}