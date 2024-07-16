import {GlobalSetting} from "./GlobalSetting";

export class GlobalSettings {

    _settings = [];

    constructor() {}

    /**
     * adds a setting to the _settings-array
     */
    addSetting(globalSetting:GlobalSetting){
        this._settings.push(globalSetting);
    }

    /**
     * sets all values of the globalSettings saved by the method addSetting() to the ones passed in the JSON of this method
     * the JSON must hold the values with keys that correspond to the "nameInSettingsFile" value of the globalObjects added by addSetting()
     *
     * @param settingsFileJSON
     */
    setValuesFromSettingsFileJSON(settingsFileJSON:any):void{
        let globalSetting;

        if(!settingsFileJSON){
            console.error("no settings-file loaded!");
            return;
        }

        for(let i = 0; i < this._settings.length; i++){
            globalSetting = this._settings[i];

            if(settingsFileJSON[globalSetting.nameInSettingsFile] === null || typeof settingsFileJSON[globalSetting.nameInSettingsFile] !== globalSetting.varType)
                continue;
            else
                globalSetting.value = settingsFileJSON[globalSetting.nameInSettingsFile];
        }
    }

    /**
     * returns an object with key-value pairs of each setting defined in the init() method
     *
     * keys are: the names in the settings-file (var nameInSettingsFile of each globalSetting)
     * values are: the varType of the setting
     *
     * @returns any
     */
    getJsonWithAllSettingFileNamesAndVarTypes():any{
        let json:any = {};

        for(let i:number = 0; i < this._settings.length;i++){
            const globalSetting = this._settings[i];
            json[globalSetting.nameInSettingsFile] = globalSetting.varType;
        }

        return json;
    }

    /**
     * returns an object with key-value pairs of each setting defined in the init() method
     *
     * keys are: the names used in the programming-environment (var name of each globalSetting)
     * values are: the value of the var
     *
     * @returns any
     */
    getJsonWithAllNamesAndValues():any{
        let json = {};

        for(let i = 0; i < this._settings.length;i++){
            const globalSetting = this._settings[i];
            json[globalSetting.name] = globalSetting.value;
        }

        return json;
    }

    get settings() {
        return this._settings;
    }
}