import {NetworkService} from "./NetworkService";
import {MediaApp} from "../dataStructure/MediaApp";


export class ContentNetworkService{

    static COMMAND_PLAY:string = "play";
    static COMMAND_STOP:string = "stop";
    static COMMAND_PAUSE:string = "pause";
    static COMMAND_SEEK:string = "seek";

    static COMMAND_LIGHT:string[] = ["light", "preset"];

    private _networkService:NetworkService;

    constructor(networkService:NetworkService) {
        this._networkService = networkService;
    }

    async sendCommandPlay(mediaApp:MediaApp, mediaId:number|null):Promise<void>{
        let command:string[] =  [ContentNetworkService.COMMAND_PLAY];

        if(mediaApp.ip === "")
            console.error("Media-App with id " + mediaApp.id + " does not have set an ip: " + mediaApp.ip);
        else{
            if(mediaId !== null)
                command.push( mediaId.toString());

            await this._networkService.sendMediaControlTo(mediaApp.ip, command);
        }
    }

    async sendCommandStop(mediaApp:MediaApp):Promise<void>{
        if(mediaApp.ip === "")
            console.error("Media-App with id " + mediaApp.id + " does not have set an ip: " + mediaApp.ip);
        else
            await this._networkService.sendMediaControlTo(mediaApp.ip, [ContentNetworkService.COMMAND_STOP]);
    }

    async sendCommandPause(mediaApps:Map<number, MediaApp>):Promise<void>{
        await this._sendCommandToAllMediaApps(mediaApps, [ContentNetworkService.COMMAND_PAUSE]);
    }

    async sendCommandSeek(mediaApps:Map<number, MediaApp>, posInSec:number):Promise<void>{
        let commands:string[] =  [ContentNetworkService.COMMAND_SEEK];

        if(posInSec < 0){
            console.error("Seek position is below 0, command is not sent: ", posInSec);
            return;
        }

        if(posInSec)
            commands.push(posInSec.toString());

        await this._sendCommandToAllMediaApps(mediaApps, commands);
    }

    async sendCommandLight(mediaApps:Map<number, MediaApp>, presetId:number):Promise<void>{
        let command:string[] = ContentNetworkService.COMMAND_LIGHT;

        command.push(presetId.toString());
        await this._sendCommandToAllMediaApps(mediaApps, command);
    }

    private async _sendCommandToAllMediaApps(mediaApps:Map<number, MediaApp>, command:string[]):Promise<void>{
        mediaApps.forEach(async (mediaApp:MediaApp)=>{
            if(mediaApp.ip && mediaApp.ip !== "")
                await this._networkService.sendMediaControlTo(mediaApp.ip, command);
            else
                console.error("Media-App with id " + mediaApp.id + " does not have set an ip: " + mediaApp.ip);
        })
    }
}