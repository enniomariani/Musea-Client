import {GlobalSettingsFactory} from "../../../main/globalSettings/GlobalSettingsFactory";
import {GlobalSettings} from "./GlobalSettings";

export class CreateGlobalSettings {

    _backend:IBackend = null;

    _globalSettings: GlobalSettings;

    constructor(globalSettings:GlobalSettings, backend:IBackend) {
        this._globalSettings = globalSettings;
        this._backend = backend;
    }

    public async create(){
        let backendData:BackendData = await this._backend.loadSettings();
        let json = backendData.json;

        if(json[GlobalSettingsFactory.SCREENSAVE_TIMER_MS])
            this._globalSettings.screenSaverTimeMS = json[GlobalSettingsFactory.SCREENSAVE_TIMER_MS];

        this._globalSettings.pathToDataFolder = backendData.pathToDataFolder;
        this._globalSettings.errorsInJSON = backendData.errorsInJson;

        return this._globalSettings;
    }
}