import {MediaClientFramework} from "src/mcf/renderer/MediaClientFramework";

export class MainApp extends EventTarget {
    private _backend:IBackend;

    constructor(backend:IBackend) {
        super();
        this._backend = backend;
    }

    async initFrameWork(){
        let backendData:BackendData = await this._backend.loadSettings();

        //for TEST-PURPOSES!!
        let mcf:MediaClientFramework = new MediaClientFramework(backendData.pathToDataFolder);
        let mediaAppReachable:boolean;

        let firstMediaStationId:number = mcf.mediaStationService.createMediaStation("111");
        console.log("FIRST MEDIA-STATIONID: ", firstMediaStationId)

        console.log("ADD MEDIA-APP WITH ID: ", mcf.mediaAppDataService.createMediaApp(firstMediaStationId, "localhost", "myControllerApp"));
        console.log("ADD MEDIA-APP WITH ID: ", mcf.mediaAppDataService.createMediaApp(firstMediaStationId, "127.0.0.2", "media-app2"));

        console.log("IS MEDIA-APP PC REACHABLE?" , await mcf.mediaAppConnectionService.pcRespondsToPing(0,0))
        mediaAppReachable = await mcf.mediaAppConnectionService.isOnline(0,0);
        console.log("IS MEDIA-APP APP ONLINE?" , mediaAppReachable);

        if(mediaAppReachable){
            await mcf.mediaAppConnectionService.connectAndRegisterToMediaApp(0,0);

            // console.log("DOWNLOAD RESULT: ", await mcf.mediaStationNetworkService.downloadContentsOfMediaStation(0));

            console.log("GET NAME OF MEDIASTATION: ", mcf.mediaStationService.getMediaStationName(0));
            console.log("GET NAME OF CONTENTS: ", mcf.folderService.getAllContentsInFolder(0,0));

            //sync
            await mcf.mediaStationService.runSync(0, (message:string) =>{console.log("SYNC-MESSAGE: ", message)});
        }
    }
}