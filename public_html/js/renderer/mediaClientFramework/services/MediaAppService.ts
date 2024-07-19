import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {MediaApp} from "../dataStructure/MediaApp";
import {NetworkService} from "./NetworkService";


export class MediaAppService{
    private _mediaStationRepository:MediaStationRepository;
    private _networkService:NetworkService;

    constructor(mediaStationRepository: MediaStationRepository, networkService:NetworkService){
        this._mediaStationRepository = mediaStationRepository;
        this._networkService = networkService;
    }

    createMediaApp(mediaStationId:number, ip:string, name:string):number{
        let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);
        let mediAppId:number;
        let mediaApp:MediaApp;

        if(!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        mediAppId = mediaStation.getNextMediaAppId();
        mediaApp = new MediaApp(mediAppId);

        mediaApp.ip = ip;
        mediaApp.name = name;

        if(mediAppId === 0)
            mediaApp.role = MediaApp.ROLE_CONTROLLER;
        else if(mediAppId > 0)
            mediaApp.role = MediaApp.ROLE_DEFAULT;

        mediaStation.mediaApps.push(mediaApp);

        this._mediaStationRepository.updateMediaStation(mediaStation);

        return mediAppId;
    }

    getName(mediaStationId:number, mediaAppId:number):string{
        return this._getMediaApp(mediaStationId, mediaAppId).name;
    }

    changeName(mediaStationId:number, mediaAppId:number, name:string):void{
        let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);
        let mediaApp:MediaApp = this._getMediaApp(mediaStationId, mediaAppId);

        mediaApp.name = name;

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    getIp(mediaStationId:number, mediaAppId:number):string{
        return this._getMediaApp(mediaStationId, mediaAppId).ip;
    }

    changeIp(mediaStationId:number, mediaAppId:number, ip:string):void{
        let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);

        this._getMediaApp(mediaStationId, mediaAppId).ip = ip;

        if(mediaAppId === 0)
            this._mediaStationRepository.updateAndSaveMediaStation(mediaStation);
        else
            this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    async isOnline(mediaStationId:number, mediaAppId:number):Promise<boolean>{
        let ip:string = this._getMediaApp(mediaStationId, mediaAppId).ip;
        return await this._networkService.isMediaAppOnline(ip);
    }

    async pcRespondsToPing(mediaStationId:number, mediaAppId:number):Promise<boolean>{
        let ip:string = this._getMediaApp(mediaStationId, mediaAppId).ip;
        return await this._networkService.pcRespondsToPing(ip);
    }

    private _getMediaApp(mediaStationId:number, mediaAppId:number):MediaApp {
        let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);
        let mediaApp:MediaApp;

        if(!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        mediaApp = mediaStation.mediaApps[mediaAppId];

        if(!mediaApp)
            throw new Error("MediaApp with this ID does not exist: " + mediaAppId);

        return mediaApp;
    }
}