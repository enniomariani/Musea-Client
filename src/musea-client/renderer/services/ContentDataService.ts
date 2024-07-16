import {MediaStationRepository} from "renderer/dataStructure/MediaStationRepository.js";
import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {Content} from "renderer/dataStructure/Content.js";
import {ContentManager} from "renderer/dataManagers/ContentManager.js";
import {MediaService} from "renderer/services/MediaService.js";
import {MediaPlayer} from "renderer/dataStructure/MediaPlayer.js";


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

    /**
     * Create a content
     */
    createContent(mediaStationId: number, folderId: number, name: string): number {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content:Content = this._contentManager.createContent(mediaStation, name, folderId);
        return content.id;
    }

    /**
     * Change the name of the content
     */
    changeName(mediaStationId: number, contentId: number, name: string): void {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        this._contentManager.changeName(mediaStation, contentId, name);
    }

    /**
     * Get the name of the content
     */
    getName(mediaStationId:number, id:number):string{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content:Content = this._contentManager.requireContent(mediaStation,id);
        return content.name;
    }

    /**
     * Change parent-folder of the content (means content is moved into another folder)
     */
    changeFolder(mediaStationId:number, contentId:number, newFolderId:number):void{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        this._contentManager.changeFolder(mediaStation, contentId, newFolderId);
    }

    /**
     * Get light-intensity of the content.
     * There are 3 levels of intensity, 0, 1, 2.
     * 0 means no light, 1 means low light, 2 means high light.
     * -> the presets are saved statically in the MSF at the moment
     */
    getLightIntensity(mediaStationId:number, id:number):number{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let content:Content = this._contentManager.requireContent(mediaStation,id);
        return content.lightIntensity;
    }

    /**
     * Get id of the folder the content is in.
     */
    getFolderId(mediaStationId:number, id:number):number{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content:Content = this._contentManager.requireContent(mediaStation,id);
        return content.folderId;
    }

    /**
     * Change light-intensity of the content.
     * There are 3 levels of intensity, 0, 1, 2.
     * 0 means no light, 1 means low light, 2 means high light.
     * -> the presets are saved statically in the MSF at the moment
     */
    changeLightIntensity(mediaStationId:number, id:number, intensity:number):void{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        this._contentManager.changeLightIntensity(mediaStation, id, intensity);
    }

    /**
     * Get the duration of the longest video or 0 if there is no video
     */
    getMaxDuration(mediaStationId:number, contentId:number):number{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content:Content = this._contentManager.requireContent(mediaStation,contentId);
        return content.getMaxDuration();
    }

    /**
     * Delete the content and all media in it
     */
    async deleteContent(mediaStationId:number, folderId:number, contentId:number):Promise<void>{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const allMediaPlayers: Map<number, MediaPlayer> = mediaStation.mediaPlayerRegistry.getAll();

        for(const [key, mediaPlayer] of allMediaPlayers)
            if(this._mediaService.getMediaType(mediaStationId, contentId, mediaPlayer.id) !== null)
                await this._mediaService.deleteMedia(mediaStationId, contentId, mediaPlayer.id);

        this._contentManager.deleteContent(mediaStation, folderId, contentId);
    }
}