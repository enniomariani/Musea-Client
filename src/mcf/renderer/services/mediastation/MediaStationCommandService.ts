import {MediaStationRepository} from "src/mcf/renderer/dataStructure/MediaStationRepository";
import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";
import {Content} from "src/mcf/renderer/dataStructure/Content";
import {ContentManager} from "src/mcf/renderer/dataManagers/ContentManager";
import {ContentNetworkService} from "src/mcf/renderer/services/ContentNetworkService";
import {IMedia, Video} from "src/mcf/renderer/dataStructure/Media";
import {ContentDataService} from "src/mcf/renderer/services/ContentDataService";

export class MediaStationCommandService  {
    private _mediaStationRepository: MediaStationRepository;
    private _contentManager: ContentManager;
    private _contentNetworkService: ContentNetworkService;

    constructor(mediaStationRepository: MediaStationRepository, contentNetworkService: ContentNetworkService, contentManager: ContentManager = new ContentManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._contentManager = contentManager;
        this._contentNetworkService = contentNetworkService;
    }

    async sendCommandPlay(mediaStationId: number, contentId: number | null): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let media:IMedia;

        let content:Content = this._contentManager.getContent(mediaStation, contentId);

        for (const [key, item] of mediaStation.getAllMediaApps()){

            if(content)
                media = content.media.get(item.id);

            if(media && media.idOnMediaApp !== -1)
                await this._contentNetworkService.sendCommandPlay(mediaStation.getMediaApp(item.id), media.idOnMediaApp);
            else if(!content)
                await this._contentNetworkService.sendCommandPlay(mediaStation.getMediaApp(item.id), null);
            else
                await this._contentNetworkService.sendCommandStop(mediaStation.getMediaApp(item.id));
        }

        if(contentId !== null)
            await this._contentNetworkService.sendCommandLight(mediaStation.getAllMediaApps(), content.lightIntensity);
    }

    async sendCommandStop(mediaStationId: number): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        for (const [key, item] of mediaStation.getAllMediaApps())
            await this._contentNetworkService.sendCommandStop(item);

        await this._contentNetworkService.sendCommandLight(mediaStation.getAllMediaApps(), ContentDataService.DEFAULT_DMX_PRESET);
    }

    async sendCommandPause(mediaStationId: number): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandPause(mediaStation.getAllMediaApps());
    }

    async sendCommandFwd(mediaStationId: number): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandFwd(mediaStation.getAllMediaApps());
    }

    async sendCommandRew(mediaStationId: number): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandRew(mediaStation.getAllMediaApps());
    }

    async sendCommandSync(mediaStationId: number, contentId:number, pos: number): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let media:IMedia;

        let content:Content = this._contentManager.getContent(mediaStation, contentId);

        for (const [key, item] of mediaStation.getAllMediaApps()){

            if(content)
                media = content.media.get(item.id);

            if(media && media instanceof Video)
                await this._contentNetworkService.sendCommandSync(mediaStation.getMediaApp(item.id), pos);
        }
    }

    async sendCommandSeek(mediaStationId: number, pos: number): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandSeek(mediaStation.getAllMediaApps(), pos);
    }

    private _findMediaStation(id: number): MediaStation {
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(id);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);
        else
            return mediaStation;
    }
}