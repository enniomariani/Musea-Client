import {NetworkService} from "src/mcf/renderer/services/NetworkService";

export class MediaStationEventService {

    private _networkService: NetworkService;

    constructor(networkService: NetworkService) {
        this._networkService = networkService;
    }

    onBlockReceived(callback:Function):void{
        this._networkService.onBlockReceived(callback);
    }

    onUnBlockReceived(callback:Function):void{
        this._networkService.onUnBlockReceived(callback);
    }
}