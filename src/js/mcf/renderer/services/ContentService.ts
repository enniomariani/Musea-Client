import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Content} from "../dataStructure/Content";
import {ContentManager} from "../dataManagers/ContentManager";
import {ContentNetworkService} from "./ContentNetworkService";
import {IMedia} from "../dataStructure/Media";
import {MediaService} from "./MediaService";
import {MediaApp} from "../dataStructure/MediaApp";


export class ContentService {
    static DEFAULT_DMX_PRESET:number = 2;

    private _mediaStationRepository: MediaStationRepository;
    private _contentManager: ContentManager;
    private _contentNetworkService: ContentNetworkService;
    private _mediaService: MediaService;

    constructor(mediaStationRepository: MediaStationRepository, contentNetworkService: ContentNetworkService, mediaService:MediaService, contentManager: ContentManager = new ContentManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._contentManager = contentManager;
        this._contentNetworkService = contentNetworkService;
        this._mediaService = mediaService;
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

    getLightIntensity(mediaStationId:number, id:number):number{
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let content:Content = this._contentManager.getContent(mediaStation,id);

        if (!content)
            throw new Error("Content with this ID does not exist: " + id)

        return content.lightIntensity;
    }

    getFolderId(mediaStationId:number, id:number):number{
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let content:Content = this._contentManager.getContent(mediaStation,id);

        if (!content)
            throw new Error("Content with this ID does not exist: " + id)

        return content.folderId;
    }

    changeLightIntensity(mediaStationId:number, id:number, intensity:number):void{
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        this._contentManager.changeLightIntensity(mediaStation, id, intensity);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    getMaxDuration(mediaStationId:number, contentId:number):number{
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let content:Content = this._contentManager.getContent(mediaStation,contentId);

        if (!content)
            throw new Error("Content with this ID does not exist: " + contentId)

        return content.getMaxDuration();
    }

    /**
     * deletes the content and all media in it
     *
     * @param {number} mediaStationId
     * @param {number} folderId
     * @param {number} contentId
     * @returns {Promise<void>}
     */
    async deleteContent(mediaStationId:number, folderId:number, contentId:number):Promise<void>{
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let allMediaApps: Map<number, MediaApp> = mediaStation.getAllMediaApps();

        for(const [key, mediaApp] of allMediaApps)
            if(this._mediaService.getMediaType(mediaStationId, contentId, mediaApp.id) !== null)
                await this._mediaService.deleteMedia(mediaStationId, contentId, mediaApp.id);

        this._contentManager.deleteContent(mediaStation, folderId, contentId);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    async sendCommandPlay(mediaStationId: number, contentId: number | null): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let media:IMedia;

        console.log("SEND COMMAND PLAY: ", contentId)

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

        await this._contentNetworkService.sendCommandLight(mediaStation.getAllMediaApps(), ContentService.DEFAULT_DMX_PRESET);
    }

    async sendCommandPause(mediaStationId: number): Promise<void> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        await this._contentNetworkService.sendCommandPause(mediaStation.getAllMediaApps());
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