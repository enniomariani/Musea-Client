import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Content} from "../dataStructure/Content";
import {ContentManager} from "../dataManagers/ContentManager";


export class ContentService{
    private _mediaStationRepository:MediaStationRepository;
    private _contentManager:ContentManager;

    constructor(mediaStationRepository: MediaStationRepository, contentManager:ContentManager = new ContentManager()){
        this._mediaStationRepository = mediaStationRepository;
        this._contentManager = contentManager;
    }

    createContent(mediaStationId:number, folderId:number, name:string):number{
        let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);
        let content:Content;

        if(!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        content = this._contentManager.createContent(mediaStation, name, folderId);

        this._mediaStationRepository.updateMediaStation(mediaStation);

        return null;
        // return content.id;
    }

    changeName(mediaStationId:number, mediaAppId:number, name:string):void{
        // let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);
        // let mediaApp:MediaApp = this._getMediaApp(mediaStationId, mediaAppId);
        //
        // mediaApp.name = name;
        //
        // this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    // private _getMediaApp(mediaStationId:number, mediaAppId:number):MediaApp {
    //     let mediaStation:MediaStation = this._mediaStationRepository.findMediaStation(mediaStationId);
    //     let mediaApp:MediaApp;
    //
    //     if(!mediaStation)
    //         throw new Error("Mediastation with this ID does not exist: " + mediaStationId);
    //
    //     mediaApp = mediaStation.mediaApps[mediaAppId];
    //
    //     if(!mediaApp)
    //         throw new Error("MediaApp with this ID does not exist: " + mediaAppId);
    //
    //     return mediaApp;
    // }
}