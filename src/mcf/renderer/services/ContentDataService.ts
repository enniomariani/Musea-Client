import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Content} from "../dataStructure/Content";
import {ContentManager} from "../dataManagers/ContentManager";
import {MediaService} from "./MediaService";
import {MediaApp} from "../dataStructure/MediaApp";


export class ContentDataService  {
    static DEFAULT_DMX_PRESET:number = 2;

    private _mediaStationRepository: MediaStationRepository;
    private _contentManager: ContentManager;
    private _mediaService: MediaService;

    constructor(mediaStationRepository: MediaStationRepository, mediaService:MediaService, contentManager: ContentManager = new ContentManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._contentManager = contentManager;
        this._mediaService = mediaService;
    }

    createContent(mediaStationId: number, folderId: number, name: string): number {
        let content: Content;
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        content = this._contentManager.createContent(mediaStation, name, folderId);

        this._mediaStationRepository.updateMediaStation(mediaStation);

        return content.id;
    }

    changeName(mediaStationId: number, contentId: number, name: string): void {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        this._contentManager.changeName(mediaStation, contentId, name);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    changeFolder(mediaStationId:number, contentId:number, newFolderId:number):void{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        this._contentManager.changeFolder(mediaStation, contentId, newFolderId);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    getLightIntensity(mediaStationId:number, id:number):number{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let content:Content = this._contentManager.getContent(mediaStation,id);

        if (!content)
            throw new Error("Content with this ID does not exist: " + id)

        return content.lightIntensity;
    }

    getFolderId(mediaStationId:number, id:number):number{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let content:Content = this._contentManager.getContent(mediaStation,id);

        if (!content)
            throw new Error("Content with this ID does not exist: " + id)

        return content.folderId;
    }

    changeLightIntensity(mediaStationId:number, id:number, intensity:number):void{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        this._contentManager.changeLightIntensity(mediaStation, id, intensity);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    getMaxDuration(mediaStationId:number, contentId:number):number{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
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
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let allMediaApps: Map<number, MediaApp> = mediaStation.getAllMediaApps();

        for(const [key, mediaApp] of allMediaApps)
            if(this._mediaService.getMediaType(mediaStationId, contentId, mediaApp.id) !== null)
                await this._mediaService.deleteMedia(mediaStationId, contentId, mediaApp.id);

        this._contentManager.deleteContent(mediaStation, folderId, contentId);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }
}