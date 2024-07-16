import {CreateGlobalSettings} from "./globalSettings/CreateGlobalSettings";
import {GlobalSettings} from "./globalSettings/GlobalSettings";
import {MediaClientFramework} from "../mediaServerFramework/MediaClientFramework";

export class ModelMain extends EventTarget {
    private _globalSettings:GlobalSettings;
    private _backend:IBackend;
    private _createGlobalSettings:CreateGlobalSettings;

    private _end2endCallbacks:IEnd2EndTestEvents;

    private _mediaServerFramework:MediaClientFramework;

    constructor(createGlobalSettings:CreateGlobalSettings, globalSettings:GlobalSettings, backend:IBackend, mediaServerFramework:MediaClientFramework = new MediaClientFramework()) {
        super();
        this._backend = backend;
        this._globalSettings = globalSettings;
        this._createGlobalSettings = createGlobalSettings;
        this._mediaServerFramework = mediaServerFramework;
    }

    async loadSettings(){
        this._globalSettings = await this._createGlobalSettings.create();

        if(this._globalSettings.errorsInJSON === null)
            console.log("settings.txt loaded successfully - no errors in the settings.txt-file: ", this._globalSettings);
        else
            console.error("Errors in the settings.txt, use default-settings, where there was an error: ", this._globalSettings);
    }

    async initFrameWork(){

        this._end2endCallbacks = window.end2endTestEvents;

        this._end2endCallbacks.checkMedia(this.onEnd2EndCheckMedia.bind(this))

        this._mediaServerFramework.registerMediaCommandCallback(this.onMediaCommandReceived);
        this._mediaServerFramework.start(this._globalSettings.pathToDataFolder, {port:5000});
    }

    private async onEnd2EndCheckMedia(event: Event, id: number):Promise<void>{
        console.log("END 2 END, CHECK MEDIA: ", id)
        let mediaType:string = this._mediaServerFramework.getMediaType(id);
        let fileName:string = this._mediaServerFramework.getMediaFileName(id);

        window.end2endTest.mediaReceived(id, fileName, mediaType);
    }

    private onMediaCommandReceived(ip:string, command:string):void{
        console.log("MEDIA COMMAND RECEIVED: ", ip, command);
    }
}