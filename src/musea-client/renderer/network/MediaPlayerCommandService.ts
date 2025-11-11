import {NetworkService} from "renderer/network/NetworkService.js";
import {MediaPlayer} from "renderer/dataStructure/MediaPlayer.js";

export const MediaCommand = {
    PLAY: "play",
    STOP: "stop",
    PAUSE: "pause",
    SEEK: "seek",
    FWD: "forward",
    REW: "rewind",
    SYNC: "sync",
    LIGHT: "preset",
    MUTE: "mute",
    UNMUTE: "unmute",
    SET_VOLUME: "set"
} as const;
export type MediaCommand = typeof MediaCommand[keyof typeof MediaCommand];

export class MediaPlayerCommandService {

    private _networkService:NetworkService;

    constructor(networkService:NetworkService) {
        this._networkService = networkService;
    }

    async sendCommandPlay(mediaPlayer:MediaPlayer, mediaId:number|null):Promise<void>{
        let command:string[] =  [MediaCommand.PLAY];

        if(mediaPlayer.ip === "")
            console.error("Media-Player with id " + mediaPlayer.id + " does not have set an ip: " + mediaPlayer.ip);
        else{
            if(mediaId !== null)
                command.push( mediaId.toString());

            await this._networkService.sendMediaControlTo(mediaPlayer.ip, command);
        }
    }

    async sendCommandStop(mediaPlayer:MediaPlayer):Promise<void>{
        if(mediaPlayer.ip === "")
            console.error("Media-Player with id " + mediaPlayer.id + " does not have set an ip: " + mediaPlayer.ip);
        else
            await this._networkService.sendMediaControlTo(mediaPlayer.ip, [MediaCommand.STOP]);
    }

    async sendCommandPause(mediaPlayers:Map<number, MediaPlayer>):Promise<void>{
        await this._sendToAll(mediaPlayers.values(),(ip) => this._networkService.sendMediaControlTo(ip, [MediaCommand.PAUSE]));
    }

    async sendCommandFwd(mediaPlayers:Map<number, MediaPlayer>):Promise<void>{
        await this._sendToAll(mediaPlayers.values(),(ip) => this._networkService.sendMediaControlTo(ip, [MediaCommand.FWD]));
    }

    async sendCommandRew(mediaPlayers:Map<number, MediaPlayer>):Promise<void>{
        await this._sendToAll(mediaPlayers.values(),(ip) => this._networkService.sendMediaControlTo(ip, [MediaCommand.REW]));
    }

    async sendCommandSync(mediaPlayer:MediaPlayer, posInSec:number):Promise<void>{
        if(posInSec < 0){
            console.error("Sync position is below 0, command is not sent: ", posInSec);
            return;
        }
        if(mediaPlayer.ip === "")
            console.error("Media-Player with id " + mediaPlayer.id + " does not have set an ip: " + mediaPlayer.ip);
        else
            await this._networkService.sendMediaControlTo(mediaPlayer.ip, [MediaCommand.SYNC, posInSec.toString()]);
    }

    async sendCommandSeek(mediaPlayers:Map<number, MediaPlayer>, posInSec:number):Promise<void>{
        let command:string[] =  [MediaCommand.SEEK];

        if(posInSec < 0){
            console.error("Seek position is below 0, command is not sent: ", posInSec);
            return;
        }

        command.push(posInSec.toString());

        await this._sendToAll(mediaPlayers.values(),(ip) => this._networkService.sendMediaControlTo(ip, command));
    }

    async sendCommandLight(mediaPlayers:Map<number, MediaPlayer>, presetId:number):Promise<void>{
        let command:string[] = [MediaCommand.LIGHT, presetId.toString()];

        await this._sendToAll(mediaPlayers.values(),(ip) => this._networkService.sendLightCommandTo(ip, command));
    }

    async sendCommandMute(mediaPlayers:Map<number, MediaPlayer>):Promise<void>{
        await this._sendAudioCommandToAll(mediaPlayers.values(),[MediaCommand.MUTE]);
    }

    async sendCommandUnmute(mediaPlayers:Map<number, MediaPlayer>):Promise<void>{
        await this._sendAudioCommandToAll(mediaPlayers.values(),[MediaCommand.UNMUTE]);
    }

    async sendCommandSetVolume(mediaPlayers:Map<number, MediaPlayer>, volume:number):Promise<void>{
        await this._sendAudioCommandToAll(mediaPlayers.values(),[MediaCommand.SET_VOLUME, volume.toString()]);
    }

    private async _sendAudioCommandToAll(apps: Iterable<MediaPlayer>, command:string[]): Promise<void> {
        const commands:string[] = ["volume", ...command];
        await this._sendToAll(apps,(ip) => this._networkService.sendSystemCommandTo(ip, commands));
    }

    private async _sendToAll(apps: Iterable<MediaPlayer>, sendOne: (ip: string) => Promise<void>): Promise<void> {
        for (const app of apps) {
            if (!app.ip) {
                console.error(`Media-Player with id ${app.id} does not have set an ip: ${app.ip}`);
                continue;
            }
            await sendOne(app.ip);
        }
    }
}