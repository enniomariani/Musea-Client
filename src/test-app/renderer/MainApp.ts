import {MuseaClient} from "renderer/MuseaClient.js";
import {SyncEvent} from "renderer/services/mediastation/SyncEvents.js";
import {IConnectionProgress} from "renderer/network/MediaPlayerConnectionSteps.js";

export class MainApp extends EventTarget {
    private _backend: IBackend;

    constructor() {
        super();
        this._backend = window.backend;
    }

    async initFrameWork() {
        let backendData: BackendData = await this._backend.loadSettings();

        //for TEST-PURPOSES
        let museaClient: MuseaClient = new MuseaClient(backendData.pathToDataFolder);

        let firstMediaStationId: number = await museaClient.mediaStationService.createMediaStation("111");
        console.log("FIRST MEDIA-STATIONID: ", firstMediaStationId)

        console.log("ADD MEDIA-PLAYER WITH ID: ", await museaClient.mediaPlayerDataService.createMediaPlayer(firstMediaStationId, "myControllerApp", "localhost"));
        console.log("ADD MEDIA-PLAYER WITH ID: ", await museaClient.mediaPlayerDataService.createMediaPlayer(firstMediaStationId, "media-player-2", "127.0.0.1"));

        console.log("IS MEDIA-PLAYER PC REACHABLE?", await museaClient.mediaPlayerConnectionService
            .checkConnection("localhost", {
                role: "admin",
                onProgress: (p: IConnectionProgress) => {
                    console.log("connection-step: " + p.step + p.state);
                }
            }))

        await museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer(0, 0);

        console.log("GET NAME OF MEDIASTATION: ", museaClient.mediaStationService.getMediaStationName(0));
        console.log("GET NAME OF CONTENTS: ", museaClient.folderService.getAllContentsInFolder(0, 0));

        //sync
        await museaClient.mediaStationService.syncMediaStation(0, (evt: SyncEvent) => {
            console.log("SYNC-MESSAGE: ", evt.scope, evt.type, evt)
        });
    }
}