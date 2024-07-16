import {CreateGlobalSettings} from "./globalSettings/CreateGlobalSettings";
import {GlobalSettings} from "./globalSettings/GlobalSettings";

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

    }
}