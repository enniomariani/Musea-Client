import {MediaStationRepository} from "renderer/dataStructure/MediaStationRepository.js";
import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {Content} from "renderer/dataStructure/Content.js";
import {ContentManager} from "renderer/dataManagers/ContentManager.js";
import {MediaPlayerCommandService} from "renderer/network/MediaPlayerCommandService.js";
import {IMedia, Video} from "renderer/dataStructure/Media.js";
import {ContentDataService} from "renderer/services/ContentDataService.js";
import {Iso6392T} from "../../dataStructure/iso6392.js";

export class MediaStationCommandService  {
    private _mediaStationRepository: MediaStationRepository;
    private _contentManager: ContentManager;
    private _mediaPlayerCommandService: MediaPlayerCommandService;

    constructor(mediaStationRepository: MediaStationRepository, contentNetworkService: MediaPlayerCommandService, contentManager: ContentManager = new ContentManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._contentManager = contentManager;
        this._mediaPlayerCommandService = contentNetworkService;
    }

    async sendCommandPlay(mediaStationId: number, contentId: number | null): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content:Content | null = contentId === null? null: this._contentManager.getContent(ms, contentId);
        let media:IMedia | undefined;

        for (const [key, item] of ms.mediaPlayerRegistry.getAll()){
            if(content)
                media = content.media.get(item.id);

            if(media && media.idOnMediaPlayer !== -1)
                await this._mediaPlayerCommandService.sendCommandPlay(item, media.idOnMediaPlayer);
            else if(!content)
                await this._mediaPlayerCommandService.sendCommandPlay(item, null);
            else
                await this._mediaPlayerCommandService.sendCommandStop(item);
        }

        if(content)
            await this._mediaPlayerCommandService.sendCommandLight(ms.mediaPlayerRegistry.getAll(), content.lightIntensity);
    }

    async sendCommandStop(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        for (const [key, item] of ms.mediaPlayerRegistry.getAll())
            await this._mediaPlayerCommandService.sendCommandStop(item);

        await this._mediaPlayerCommandService.sendCommandLight(ms.mediaPlayerRegistry.getAll(), ContentDataService.DEFAULT_DMX_PRESET);
    }

    async sendCommandPause(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._mediaPlayerCommandService.sendCommandPause(ms.mediaPlayerRegistry.getAll());
    }

    async sendCommandFwd(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._mediaPlayerCommandService.sendCommandFwd(ms.mediaPlayerRegistry.getAll());
    }

    async sendCommandRew(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._mediaPlayerCommandService.sendCommandRew(ms.mediaPlayerRegistry.getAll());
    }

    async sendCommandSubs(mediaStationId: number, subIso6392:Iso6392T | null): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        for (const [key, item] of ms.mediaPlayerRegistry.getAll()){
            await this._mediaPlayerCommandService.sendCommandSubs(item, subIso6392);
        }
    }

    async sendCommandSync(mediaStationId: number, contentId:number, pos: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content:Content = this._contentManager.requireContent(ms, contentId);
        let media:IMedia | undefined;

        for (const [key, item] of ms.mediaPlayerRegistry.getAll()){

            if(content)
                media = content.media.get(item.id);

            if(media && media instanceof Video)
                await this._mediaPlayerCommandService.sendCommandSync(item, pos);
        }
    }

    async sendCommandSeek(mediaStationId: number, pos: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._mediaPlayerCommandService.sendCommandSeek(ms.mediaPlayerRegistry.getAll(), pos);
    }

    async sendCommandMute(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._mediaPlayerCommandService.sendCommandMute(ms.mediaPlayerRegistry.getAll());
    }

    async sendCommandUnmute(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._mediaPlayerCommandService.sendCommandUnmute(ms.mediaPlayerRegistry.getAll());
    }

    async sendCommandSetVolume(mediaStationId: number, vol: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._mediaPlayerCommandService.sendCommandSetVolume(ms.mediaPlayerRegistry.getAll(), vol);
    }
}