import {NetworkService} from "src/mcf/renderer/network/NetworkService";
import {MediaApp} from "src/mcf/renderer/dataStructure/MediaApp";


export class MediaAppCommandService {

    static COMMAND_PLAY:string = "play";
    static COMMAND_STOP:string = "stop";
    static COMMAND_PAUSE:string = "pause";
    static COMMAND_SEEK:string = "seek";
    static COMMAND_FWD:string = "forward";
    static COMMAND_REW:string = "rewind";
    static COMMAND_SYNC:string = "sync";

    static COMMAND_LIGHT:string= "preset";

    static COMMAND_MUTE:string = "mute";
    static COMMAND_UNMUTE:string = "unmute";
    static COMMAND_SET_VOLUME:string = "set";

    private _networkService:NetworkService;

    constructor(networkService:NetworkService) {
        this._networkService = networkService;
    }

    async sendCommandPlay(mediaApp:MediaApp, mediaId:number|null):Promise<void>{
        let command:string[] =  [MediaAppCommandService.COMMAND_PLAY];

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
            await this._networkService.sendMediaControlTo(mediaApp.ip, [MediaAppCommandService.COMMAND_STOP]);
    }

    async sendCommandPause(mediaApps:Map<number, MediaApp>):Promise<void>{
        await this._sendToAll(mediaApps.values(),(ip) => this._networkService.sendMediaControlTo(ip, [MediaAppCommandService.COMMAND_PAUSE]));
    }

    async sendCommandFwd(mediaApps:Map<number, MediaApp>):Promise<void>{
        await this._sendToAll(mediaApps.values(),(ip) => this._networkService.sendMediaControlTo(ip, [MediaAppCommandService.COMMAND_FWD]));
    }

    async sendCommandRew(mediaApps:Map<number, MediaApp>):Promise<void>{
        await this._sendToAll(mediaApps.values(),(ip) => this._networkService.sendMediaControlTo(ip, [MediaAppCommandService.COMMAND_REW]));
    }

    async sendCommandSync(mediaApp:MediaApp, posInSec:number):Promise<void>{
        if(posInSec < 0){
            console.error("Sync position is below 0, command is not sent: ", posInSec);
            return;
        }
        if(mediaApp.ip === "")
            console.error("Media-App with id " + mediaApp.id + " does not have set an ip: " + mediaApp.ip);
        else
            await this._networkService.sendMediaControlTo(mediaApp.ip, [MediaAppCommandService.COMMAND_SYNC, posInSec.toString()]);
    }

    async sendCommandSeek(mediaApps:Map<number, MediaApp>, posInSec:number):Promise<void>{
        let command:string[] =  [MediaAppCommandService.COMMAND_SEEK];

        if(posInSec < 0){
            console.error("Seek position is below 0, command is not sent: ", posInSec);
            return;
        }

        command.push(posInSec.toString());

        await this._sendToAll(mediaApps.values(),(ip) => this._networkService.sendMediaControlTo(ip, command));
    }

    async sendCommandLight(mediaApps:Map<number, MediaApp>, presetId:number):Promise<void>{
        let command:string[] = [MediaAppCommandService.COMMAND_LIGHT, presetId.toString()];

        await this._sendToAll(mediaApps.values(),(ip) => this._networkService.sendLightCommandTo(ip, command));
    }

    async sendCommandMute(mediaApps:Map<number, MediaApp>):Promise<void>{
        await this._sendAudioCommandToAll(mediaApps.values(),[MediaAppCommandService.COMMAND_MUTE]);
    }

    async sendCommandUnmute(mediaApps:Map<number, MediaApp>):Promise<void>{
        await this._sendAudioCommandToAll(mediaApps.values(),[MediaAppCommandService.COMMAND_UNMUTE]);
    }

    async sendCommandSetVolume(mediaApps:Map<number, MediaApp>, volume:number):Promise<void>{
        await this._sendAudioCommandToAll(mediaApps.values(),[MediaAppCommandService.COMMAND_SET_VOLUME, volume.toString()]);
    }

    private async _sendAudioCommandToAll(apps: Iterable<MediaApp>, command:string[]): Promise<void> {
        const commands:string[] = ["volume", ...command];
        await this._sendToAll(apps,(ip) => this._networkService.sendSystemCommandTo(ip, commands));
    }

    private async _sendToAll(apps: Iterable<MediaApp>, sendOne: (ip: string) => Promise<void>): Promise<void> {
        for (const app of apps) {
            if (!app.ip) {
                console.error(`Media-App with id ${app.id} does not have set an ip: ${app.ip}`);
                continue;
            }
            await sendOne(app.ip);
        }
    }
}