import {NetworkService} from "renderer/network/NetworkService.js";

export class MediaStationEventService {

    private _networkService: NetworkService;

    constructor(networkService: NetworkService) {
        this._networkService = networkService;
    }

    onBlockReceived(callback:() => void):void{
        this._networkService.onBlockReceived(callback);
    }

    onUnBlockReceived(callback:() => void):void{
        this._networkService.onUnBlockReceived(callback);
    }
}