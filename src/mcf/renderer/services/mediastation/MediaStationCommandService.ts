import {MediaStationRepository} from "renderer/dataStructure/MediaStationRepository";
import {MediaStation} from "renderer/dataStructure/MediaStation";
import {Content} from "renderer/dataStructure/Content";
import {ContentManager} from "renderer/dataManagers/ContentManager";
import {MediaAppCommandService} from "renderer/network/MediaAppCommandService";
import {IMedia, Video} from "renderer/dataStructure/Media";
import {ContentDataService} from "renderer/services/ContentDataService";
import {NetworkService} from "renderer/network/NetworkService";

export class MediaStationCommandService  {
    private _mediaStationRepository: MediaStationRepository;
    private _networkService: NetworkService;
    private _contentManager: ContentManager;
    private _contentNetworkService: MediaAppCommandService;

    constructor(mediaStationRepository: MediaStationRepository, networkService: NetworkService, contentNetworkService: MediaAppCommandService, contentManager: ContentManager = new ContentManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._networkService = networkService;
        this._contentManager = contentManager;
        this._contentNetworkService = contentNetworkService;
    }

    async sendCommandPlay(mediaStationId: number, contentId: number | null): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content:Content | null = contentId === null? null: this._contentManager.getContent(ms, contentId);
        let media:IMedia | undefined;

        for (const [key, item] of ms.mediaAppRegistry.getAll()){
            if(content)
                media = content.media.get(item.id);

            if(media && media.idOnMediaApp !== -1)
                await this._contentNetworkService.sendCommandPlay(item, media.idOnMediaApp);
            else if(!content)
                await this._contentNetworkService.sendCommandPlay(item, null);
            else
                await this._contentNetworkService.sendCommandStop(item);
        }

        if(content)
            await this._contentNetworkService.sendCommandLight(ms.mediaAppRegistry.getAll(), content.lightIntensity);
    }

    async sendCommandStop(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        for (const [key, item] of ms.mediaAppRegistry.getAll())
            await this._contentNetworkService.sendCommandStop(item);

        await this._contentNetworkService.sendCommandPause(ms.mediaAppRegistry.getAll());
        await this._contentNetworkService.sendCommandLight(ms.mediaAppRegistry.getAll(), ContentDataService.DEFAULT_DMX_PRESET);
    }

    async sendCommandPause(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandPause(ms.mediaAppRegistry.getAll());
    }

    async sendCommandFwd(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandFwd(ms.mediaAppRegistry.getAll());
    }

    async sendCommandRew(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandRew(ms.mediaAppRegistry.getAll());
    }

    async sendCommandSync(mediaStationId: number, contentId:number, pos: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content:Content = this._contentManager.requireContent(ms, contentId);
        let media:IMedia | undefined;

        for (const [key, item] of ms.mediaAppRegistry.getAll()){

            if(content)
                media = content.media.get(item.id);

            if(media && media instanceof Video)
                await this._contentNetworkService.sendCommandSync(item, pos);
        }
    }

    async sendCommandSeek(mediaStationId: number, pos: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandSeek(ms.mediaAppRegistry.getAll(), pos);
    }

    async sendCommandMute(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandMute(ms.mediaAppRegistry.getAll());
    }

    async sendCommandUnmute(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandUnmute(ms.mediaAppRegistry.getAll());
    }

    async sendCommandSetVolume(mediaStationId: number, vol: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandSetVolume(ms.mediaAppRegistry.getAll(), vol);
    }
}