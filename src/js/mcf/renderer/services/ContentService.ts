import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Content} from "../dataStructure/Content";
import {ContentManager} from "../dataManagers/ContentManager";
import {ContentNetworkService} from "./ContentNetworkService";
import {IMedia} from "../dataStructure/Media";


export class ContentService {
    private _mediaStationRepository: MediaStationRepository;
    private _contentManager: ContentManager;
    private _contentNetworkService: ContentNetworkService;

    constructor(mediaStationRepository: MediaStationRepository, contentNetworkService: ContentNetworkService, contentManager: ContentManager = new ContentManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._contentManager = contentManager;
        this._contentNetworkService = contentNetworkService;
    }

    createContent(mediaStationId: number, folderId: number, name: string): number {
        let content: Content;
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        content = this._contentManager.createContent(mediaStation, name, folderId);

        this._mediaStationRepository.updateMediaStation(mediaStation);

        return content.id;
    }

    changeName(mediaStationId: number, contentId: number, name: string): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        this._contentManager.changeName(mediaStation, contentId, name);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    sendCommandPlay(mediaStationId: number, contentId: number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let media:IMedia;

        let content:Content = this._contentManager.getContent(mediaStation, contentId);

        for (const [key, item] of mediaStation.getAllMediaApps()){
            media = content.media.get(item.id);
            if(media && media.idOnMediaApp !== -1)
                this._contentNetworkService.sendCommandPlay(mediaStation.getMediaApp(item.id), media.idOnMediaApp);
            else
                this._contentNetworkService.sendCommandStop(mediaStation.getMediaApp(item.id));
        }
    }

    sendCommandStop(mediaStationId: number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        for (const [key, item] of mediaStation.getAllMediaApps())
            this._contentNetworkService.sendCommandStop(item);
    }

    sendCommandPause(mediaStationId: number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        this._contentNetworkService.sendCommandPause(mediaStation.getAllMediaApps());
    }

    sendCommandSeek(mediaStationId: number, pos: number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        this._contentNetworkService.sendCommandSeek(mediaStation.getAllMediaApps(), pos);
    }

    private _findMediaStation(id: number): MediaStation {
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(id);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);
        else
            return mediaStation;
    }
}