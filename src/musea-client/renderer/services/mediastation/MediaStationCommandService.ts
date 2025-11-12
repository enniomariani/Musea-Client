import {MediaStationRepository} from "renderer/dataStructure/MediaStationRepository.js";
import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {Content} from "renderer/dataStructure/Content.js";
import {ContentManager} from "renderer/dataManagers/ContentManager.js";
import {MediaPlayerCommandService} from "renderer/network/MediaPlayerCommandService.js";
import {IMedia, Video} from "renderer/dataStructure/Media.js";
import {ContentDataService} from "renderer/services/ContentDataService.js";
import {NetworkService} from "renderer/network/NetworkService.js";

export class MediaStationCommandService  {
    private _mediaStationRepository: MediaStationRepository;
    private _networkService: NetworkService;
    private _contentManager: ContentManager;
    private _contentNetworkService: MediaPlayerCommandService;

    constructor(mediaStationRepository: MediaStationRepository, networkService: NetworkService, contentNetworkService: MediaPlayerCommandService, contentManager: ContentManager = new ContentManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._networkService = networkService;
        this._contentManager = contentManager;
        this._contentNetworkService = contentNetworkService;
    }

    async sendCommandPlay(mediaStationId: number, contentId: number | null): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content:Content | null = contentId === null? null: this._contentManager.getContent(ms, contentId);
        let media:IMedia | undefined;

        for (const [key, item] of ms.mediaPlayerRegistry.getAll()){
            if(content)
                media = content.media.get(item.id);

            if(media && media.idOnMediaPlayer !== -1)
                await this._contentNetworkService.sendCommandPlay(item, media.idOnMediaPlayer);
            else if(!content)
                await this._contentNetworkService.sendCommandPlay(item, null);
            else
                await this._contentNetworkService.sendCommandStop(item);
        }

        if(content)
            await this._contentNetworkService.sendCommandLight(ms.mediaPlayerRegistry.getAll(), content.lightIntensity);
    }

    async sendCommandStop(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        for (const [key, item] of ms.mediaPlayerRegistry.getAll())
            await this._contentNetworkService.sendCommandStop(item);

        await this._contentNetworkService.sendCommandLight(ms.mediaPlayerRegistry.getAll(), ContentDataService.DEFAULT_DMX_PRESET);
    }

    async sendCommandPause(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandPause(ms.mediaPlayerRegistry.getAll());
    }

    async sendCommandFwd(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandFwd(ms.mediaPlayerRegistry.getAll());
    }

    async sendCommandRew(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandRew(ms.mediaPlayerRegistry.getAll());
    }

    async sendCommandSync(mediaStationId: number, contentId:number, pos: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content:Content = this._contentManager.requireContent(ms, contentId);
        let media:IMedia | undefined;

        for (const [key, item] of ms.mediaPlayerRegistry.getAll()){

            if(content)
                media = content.media.get(item.id);

            if(media && media instanceof Video)
                await this._contentNetworkService.sendCommandSync(item, pos);
        }
    }

    async sendCommandSeek(mediaStationId: number, pos: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandSeek(ms.mediaPlayerRegistry.getAll(), pos);
    }

    async sendCommandMute(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandMute(ms.mediaPlayerRegistry.getAll());
    }

    async sendCommandUnmute(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandUnmute(ms.mediaPlayerRegistry.getAll());
    }

    async sendCommandSetVolume(mediaStationId: number, vol: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandSetVolume(ms.mediaPlayerRegistry.getAll(), vol);
    }
}