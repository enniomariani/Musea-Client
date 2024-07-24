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
        let mediaAppId:number;

        if(!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        mediaAppId = mediaStation.getNextMediaAppId();

        mediaStation.addMediaApp(mediaAppId, name, ip,mediaAppId === 0? MediaApp.ROLE_CONTROLLER: MediaApp.ROLE_DEFAULT );

        this._mediaStationRepository.updateMediaStation(mediaStation);

        return mediaAppId;
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

    async connectAndRegisterToMediaApp(mediaStationId:number, mediaAppId:number):Promise<boolean>{
        let ip:string = this._getMediaApp(mediaStationId, mediaAppId).ip;

        return new Promise(async (resolve, reject)=> {
            if(!await this._networkService.openConnection(ip))
                resolve(false);

            if(!await this._networkService.sendRegistration(ip))
                resolve(false);

            resolve(true);
        });
    }

    async unregisterAndCloseMediaApp(mediaStationId:number, mediaAppId:number):Promise<void>{
        let ip:string = this._getMediaApp(mediaStationId, mediaAppId).ip;

        return new Promise(async (resolve)=> {
            await this._networkService.unregisterAndCloseConnection(ip);
            resolve();
        });
    }

    private _getMediaApp(mediaStationId:number, mediaAppId:number):MediaApp {
        let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);
        let mediaApp:MediaApp;

        if(!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        mediaApp = mediaStation.getMediaApp(mediaAppId);

        return mediaApp;
    }
}