import {NetworkService} from "./NetworkService";
import {MediaApp} from "../dataStructure/MediaApp";


export class ContentNetworkService{

    static COMMAND_PLAY:string = "play";
    static COMMAND_STOP:string = "stop";
    static COMMAND_PAUSE:string = "pause";
    static COMMAND_SEEK:string = "seek";

    private _networkService:NetworkService;

    constructor(networkService:NetworkService) {
        this._networkService = networkService;
    }

    sendCommandPlay(mediaApp:MediaApp, mediaId:number|null):void{
        let command:string =  ContentNetworkService.COMMAND_PLAY;

        if(mediaApp.ip === "")
            console.error("Media-App with id " + mediaApp.id + " does not have set an ip: " + mediaApp.ip);
        else{
            if(mediaId !== null)
                command += "_" + mediaId.toString();

            this._networkService.sendMediaControlTo(mediaApp.ip, command);
        }
    }

    sendCommandStop(mediaApp:MediaApp):void{
        if(mediaApp.ip === "")
            console.error("Media-App with id " + mediaApp.id + " does not have set an ip: " + mediaApp.ip);
        else
            this._networkService.sendMediaControlTo(mediaApp.ip, ContentNetworkService.COMMAND_STOP);
    }

    sendCommandPause(mediaApps:Map<number, MediaApp>):void{
        this._sendCommandToAllMediaApps(mediaApps, ContentNetworkService.COMMAND_PAUSE);
    }

    sendCommandSeek(mediaApps:Map<number, MediaApp>, pos:number):void{
        let command:string =  ContentNetworkService.COMMAND_SEEK;

        if(pos < 0){
            console.error("Seek position is below 0, command is not sent: ", pos);
            return;
        }

        if(pos)
            command += "_" + pos.toString();

        this._sendCommandToAllMediaApps(mediaApps, command);
    }

    private _sendCommandToAllMediaApps(mediaApps:Map<number, MediaApp>, command:string):void{
        mediaApps.forEach((mediaApp:MediaApp)=>{
            if(mediaApp.ip && mediaApp.ip !== "")
                this._networkService.sendMediaControlTo(mediaApp.ip, command);
            else
                console.error("Media-App with id " + mediaApp.id + " does not have set an ip: " + mediaApp.ip);
        })
    }
}