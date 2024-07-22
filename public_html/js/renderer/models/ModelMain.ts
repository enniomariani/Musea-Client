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
        let mcf:MediaClientFramework = new MediaClientFramework();

        let connectionHandler:NetworkConnectionHandler = new NetworkConnectionHandler();
        console.log("EXECUTE PING-COMMANDS...")
        let answer1:boolean = await connectionHandler.ping("127.0.0.1");

        console.log("ANSWER1 localhost: ", answer1)

        let firstMediaStationId:number = mcf.mediaStationDataService.createMediaStation("firstMediaStation");
        console.log("FIRST MEDIA-STATIONID: ", firstMediaStationId)
        mcf.mediaStationDataService.changeName(firstMediaStationId, "firstMediaStationChangedName!");

        mcf.mediaAppService.createMediaApp(firstMediaStationId, "localhost", "myControllerApp");
        mcf.mediaAppService.createMediaApp(firstMediaStationId, "127.0.0.2", "myOtherMediaApp");

        mcf.contentService.createContent(firstMediaStationId, 0, "myFirstContent");
        mcf.contentService.createContent(firstMediaStationId, 0, "mySecondContent");

        await mcf.mediaStationNetworkService.syncMediaStation(firstMediaStationId);

    }
}