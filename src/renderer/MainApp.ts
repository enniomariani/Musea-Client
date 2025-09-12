import {MediaClientFramework} from "src/mcf/renderer/MediaClientFramework";
import {SyncEvent} from "src/mcf/renderer/services/mediastation/SyncEvents";
import {IConnectionProgress} from "src/mcf/renderer/network/MediaAppConnectionSteps";

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

        console.log("ADD MEDIA-APP WITH ID: ", mcf.mediaAppDataService.createMediaApp(firstMediaStationId,  "myControllerApp", "localhost"));
        console.log("ADD MEDIA-APP WITH ID: ", mcf.mediaAppDataService.createMediaApp(firstMediaStationId,  "media-app2", "127.0.0.1"));

        console.log("IS MEDIA-APP PC REACHABLE?" , await mcf.mediaAppConnectionService
            .checkConnection("localhost", {role: "admin",
                onProgress:(p: IConnectionProgress)=>{console.log("connection-step: "+ p.step+ p.state);}}))

        if(mediaAppReachable){
            await mcf.mediaAppConnectionService.connectAndRegisterToMediaApp(0,0);

            // console.log("DOWNLOAD RESULT: ", await mcf.mediaStationNetworkService.downloadContentsOfMediaStation(0));

            console.log("GET NAME OF MEDIASTATION: ", mcf.mediaStationService.getMediaStationName(0));
            console.log("GET NAME OF CONTENTS: ", mcf.folderService.getAllContentsInFolder(0,0));

            //sync
            await mcf.mediaStationService.syncMediaStation(0, (evt:SyncEvent) =>{console.log("SYNC-MESSAGE: ", evt.scope, evt.type, evt)});
        }
    }
}