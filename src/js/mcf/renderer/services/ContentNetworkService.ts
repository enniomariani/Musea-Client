import {NetworkService} from "./NetworkService";
import {MediaApp} from "../dataStructure/MediaApp";


export class ContentNetworkService{

    static COMMAND_PLAY:string = "play";
    static COMMAND_STOP:string = "stop";
    static COMMAND_PAUSE:string = "pause";
    static COMMAND_SEEK:string = "seek";

    static COMMAND_LIGHT:string= "preset";

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
        await this._sendMediaCommandToAllMediaApps(mediaApps, [ContentNetworkService.COMMAND_PAUSE]);
    }

    async sendCommandSeek(mediaApps:Map<number, MediaApp>, posInSec:number):Promise<void>{
        let commands:string[] =  [ContentNetworkService.COMMAND_SEEK];

        if(posInSec < 0){
            console.error("Seek position is below 0, command is not sent: ", posInSec);
            return;
        }

        if(posInSec)
            commands.push(posInSec.toString());

        await this._sendMediaCommandToAllMediaApps(mediaApps, commands);
    }

    async sendCommandLight(mediaApps:Map<number, MediaApp>, presetId:number):Promise<void>{
        let command:string[] = [ContentNetworkService.COMMAND_LIGHT, presetId.toString()];

        console.log("SEND COMMAND LIGHT: ",command,  presetId);
        await this._sendLightCommandToAllMediaApps(mediaApps, command);
    }

    private async _sendMediaCommandToAllMediaApps(mediaApps:Map<number, MediaApp>, command:string[]):Promise<void>{

        console.log("SEND COMMAND TO ALL MEDIA-APPS: ", command)

        mediaApps.forEach(async (mediaApp:MediaApp)=>{
            if(mediaApp.ip && mediaApp.ip !== "")
                await this._networkService.sendMediaControlTo(mediaApp.ip, command);
            else
                console.error("Media-App with id " + mediaApp.id + " does not have set an ip: " + mediaApp.ip);
        })
    }

    private async _sendLightCommandToAllMediaApps(mediaApps:Map<number, MediaApp>, command:string[]):Promise<void>{

        console.log("SEND COMMAND TO ALL MEDIA-APPS: ", command)

        mediaApps.forEach(async (mediaApp:MediaApp)=>{
            if(mediaApp.ip && mediaApp.ip !== "")
                await this._networkService.sendLightCommandTo(mediaApp.ip, command);
            else
                console.error("Media-App with id " + mediaApp.id + " does not have set an ip: " + mediaApp.ip);
        })
    }
}