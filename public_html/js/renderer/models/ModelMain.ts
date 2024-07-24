import {CreateGlobalSettings} from "./globalSettings/CreateGlobalSettings";
import {GlobalSettings} from "./globalSettings/GlobalSettings";
import {MediaClientFramework} from "../mediaClientFramework/MediaClientFramework";
import {NetworkConnectionHandler} from "../mediaClientFramework/network/NetworkConnectionHandler";

export class ModelMain extends EventTarget {
    private _globalSettings:GlobalSettings;
    private _backend:IBackend;
    private _createGlobalSettings:CreateGlobalSettings;

    constructor(createGlobalSettings:CreateGlobalSettings, globalSettings:GlobalSettings, backend:IBackend) {
        super();
        this._backend = backend;
        this._globalSettings = globalSettings;
        this._createGlobalSettings = createGlobalSettings;
    }

    async loadSettings(){
        this._globalSettings = await this._createGlobalSettings.create();

        if(this._globalSettings.errorsInJSON === null)
            console.log("settings.txt loaded successfully - no errors in the settings.txt-file: ", this._globalSettings);
        else
            console.error("Errors in the settings.txt, use default-settings, where there was an error: ", this._globalSettings);
    }

    async initFrameWork(){
        //for TEST-PURPOSES!! TO DO: REMOVE
        let mcf:MediaClientFramework = new MediaClientFramework(this._globalSettings.pathToDataFolder);

        let firstMediaStationId:number = mcf.mediaStationDataService.createMediaStation("111");
        console.log("FIRST MEDIA-STATIONID: ", firstMediaStationId)

        console.log("ADD MEDIA-APP WITH ID: ", mcf.mediaAppService.createMediaApp(firstMediaStationId, "localhost", "myControllerApp"));
        console.log("ADD MEDIA-APP WITH ID: ", mcf.mediaAppService.createMediaApp(firstMediaStationId, "127.0.0.2", "media-app2"));

        console.log("IS MEDIA-APP PC REACHABLE?" , await mcf.mediaAppService.pcRespondsToPing(0,0));
        console.log("IS MEDIA-APP APP ONLINE?" , await mcf.mediaAppService.isOnline(0,0));

        await mcf.mediaAppService.connectAndRegisterToMediaApp(0,0);

        let contentId1:number = mcf.contentService.createContent(0, 0, "content1")
        let contentId2:number = mcf.contentService.createContent(0, 0, "content2")
        let contentId3:number = mcf.contentService.createContent(0, 0, "content3")

        // console.log("DOWNLOAD RESULT: ", await mcf.mediaStationNetworkService.downloadContentsOfMediaStation(0));

        console.log("GET NAME OF MEDIASTATION: ", mcf.mediaStationDataService.getName(0));
        console.log("GET NAME OF CONTENTS: ", mcf.folderService.getAllContentsInFolder(0,0));

        //add media
        mcf.mediaService.addImageAndCacheIt(0,1,0,"jpeg", new Uint8Array([0x00, 0xFF, 0x11]))
        mcf.mediaService.addImageAndCacheIt(0,1,1,"png", new Uint8Array([0x00, 0xFF, 0x11]))

        mcf.mediaService.addImageAndCacheIt(0,2,0,"mp4", new Uint8Array([0x00, 0xFF, 0x11]))

        await mcf.mediaStationNetworkService.syncMediaStation(0);

        mcf.contentService.sendCommandPlay(0, 1);
    }
}