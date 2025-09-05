import {MediaStationRepository} from "src/mcf/renderer/dataStructure/MediaStationRepository";
import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";
import {Content} from "src/mcf/renderer/dataStructure/Content";
import {ContentManager} from "src/mcf/renderer/dataManagers/ContentManager";
import {ContentNetworkService} from "src/mcf/renderer/services/ContentNetworkService";
import {IMedia, Video} from "src/mcf/renderer/dataStructure/Media";
import {ContentDataService} from "src/mcf/renderer/services/ContentDataService";
import {NetworkService} from "src/mcf/renderer/services/NetworkService";

export class MediaStationCommandService  {
    private _mediaStationRepository: MediaStationRepository;
    private _networkService: NetworkService;
    private _contentManager: ContentManager;
    private _contentNetworkService: ContentNetworkService;

    constructor(mediaStationRepository: MediaStationRepository, networkService: NetworkService, contentNetworkService: ContentNetworkService, contentManager: ContentManager = new ContentManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._networkService = networkService;
        this._contentManager = contentManager;
        this._contentNetworkService = contentNetworkService;
    }

    async sendCommandPlay(mediaStationId: number, contentId: number | null): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let media:IMedia;

        let content:Content = this._contentManager.getContent(ms, contentId);

        for (const [key, item] of ms.getAllMediaApps()){

            if(content)
                media = content.media.get(item.id);

            if(media && media.idOnMediaApp !== -1)
                await this._contentNetworkService.sendCommandPlay(ms.getMediaApp(item.id), media.idOnMediaApp);
            else if(!content)
                await this._contentNetworkService.sendCommandPlay(ms.getMediaApp(item.id), null);
            else
                await this._contentNetworkService.sendCommandStop(ms.getMediaApp(item.id));
        }

        if(contentId !== null)
            await this._contentNetworkService.sendCommandLight(ms.getAllMediaApps(), content.lightIntensity);
    }

    async sendCommandStop(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        for (const [key, item] of ms.getAllMediaApps())
            await this._contentNetworkService.sendCommandStop(item);

        await this._contentNetworkService.sendCommandLight(ms.getAllMediaApps(), ContentDataService.DEFAULT_DMX_PRESET);
    }

    async sendCommandPause(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandPause(ms.getAllMediaApps());
    }

    async sendCommandFwd(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandFwd(ms.getAllMediaApps());
    }

    async sendCommandRew(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandRew(ms.getAllMediaApps());
    }

    async sendCommandSync(mediaStationId: number, contentId:number, pos: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let media:IMedia;

        let content:Content = this._contentManager.getContent(ms, contentId);

        for (const [key, item] of ms.getAllMediaApps()){

            if(content)
                media = content.media.get(item.id);

            if(media && media instanceof Video)
                await this._contentNetworkService.sendCommandSync(ms.getMediaApp(item.id), pos);
        }
    }

    async sendCommandSeek(mediaStationId: number, pos: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandSeek(ms.getAllMediaApps(), pos);
    }

    async sendCommandMute(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        for (const [key, item] of ms.getAllMediaApps()) {
            if (item.ip && item.ip !== "")
                await this._networkService.sendSystemCommandTo(item.ip, ["volume", "mute"]);
            else
                console.error("Sending mute-command to media-app failed, because there is no ip set: ", item.name, item.ip)
        }
    }

    async sendCommandUnmute(mediaStationId: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        for (const [key, item] of ms.getAllMediaApps()) {
            if (item.ip && item.ip !== "")
                await this._networkService.sendSystemCommandTo(item.ip, ["volume", "unmute"]);
            else
                console.error("Sending unmute-command to media-app failed, because there is no ip set: ", item.name, item.ip)
        }
    }

    async sendCommandSetVolume(mediaStationId: number, volume: number): Promise<void> {
        const ms: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        for (const [key, item] of ms.getAllMediaApps()) {
            if (item.ip && item.ip !== "")
                await this._networkService.sendSystemCommandTo(item.ip, ["volume", "set", volume.toString()]);
            else
                console.error("Sending set volume-command to media-app failed, because there is no ip set: ", item.name, item.ip)
        }
    }
}