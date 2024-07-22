import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Content} from "../dataStructure/Content";
import {ContentManager} from "../dataManagers/ContentManager";
import {ContentNetworkService} from "./ContentNetworkService";


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

        this._contentNetworkService.sendCommandPlay(mediaStation.mediaApps, contentId);
    }

    sendCommandStop(mediaStationId: number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        this._contentNetworkService.sendCommandStop(mediaStation.mediaApps);
    }

    sendCommandPause(mediaStationId: number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        this._contentNetworkService.sendCommandPause(mediaStation.mediaApps);
    }

    sendCommandSeek(mediaStationId: number, pos: number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        this._contentNetworkService.sendCommandSeek(mediaStation.mediaApps, pos);
    }

    private _findMediaStation(id: number): MediaStation {
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(id);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);
        else
            return mediaStation;
    }
}