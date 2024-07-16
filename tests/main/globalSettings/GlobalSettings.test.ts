import {beforeEach, describe, expect, it} from "@jest/globals";
import {GlobalSettings} from "main/globalSettings/GlobalSettings";
import {GlobalSetting} from "main/globalSettings/GlobalSetting";

let globalSettings:GlobalSettings = new GlobalSettings();
let logSpy:any = jest.spyOn(global.console, 'error');

beforeEach(()=>{
    globalSettings = new GlobalSettings();
    jest.clearAllMocks();
});

describe("test addSetting(globalSetting) ", ()=>{
    it("should add the setting to the _settings array", ()=>{
        //setup
        let globalSetting:GlobalSetting = new GlobalSetting("Vollbild", "isFullScreen", GlobalSetting.TYPE_BOOLEAN, true);

        //method to test
        globalSettings.addSetting(globalSetting);

        //test
        expect(globalSettings.settings[0]).toEqual(globalSetting);
    });
});

describe("test setValuesFromSettingsFileJSON(settingsFileJSON) ", ()=>{
    it("should adjust the values of the settings added before by addSetting() to the values in the JSON passed as parameter (corresponding to the nameInSettingsFile parameter in the settings)", ()=>{
        //setup
        globalSettings.addSetting(new GlobalSetting("Vollbild", "isFullScreen", GlobalSetting.TYPE_BOOLEAN, true));
        globalSettings.addSetting(new GlobalSetting("Mauszeiger", "mouseEnabled", GlobalSetting.TYPE_BOOLEAN, false));
        globalSettings.addSetting(new GlobalSetting("BildschirmSchonerInMSec", "screenSaveTimeMS", GlobalSetting.TYPE_NUMBER, 10000));

        let jsonFromSettingsFile = {
            "Vollbild": false,
            "Mauszeiger": true,
            "BildschirmSchonerInMSec": 5
        }

        //call method to test
        globalSettings.setValuesFromSettingsFileJSON(jsonFromSettingsFile);

        //tests
        expect(globalSettings.settings[0].value).toBe(false);
        expect(globalSettings.settings[1].value).toBe(true);
        expect(globalSettings.settings[2].value).toBe(5);
    });

    it("should print an error if the passed JSON is null", () =>{
        //call method to test
        globalSettings.setValuesFromSettingsFileJSON(null);

        //tests
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("test getJsonWithAllSettingFileNamesAndVarTypes() ", ()=>{
    it("should return a JSON with key-value pairs which reflect the names of the settings-file and var-types of all the settings added to the class by addSetting()", ()=>{
        //setup
        let result:any;
        globalSettings.addSetting(new GlobalSetting("Vollbild", "isFullScreen", GlobalSetting.TYPE_BOOLEAN, true));
        globalSettings.addSetting(new GlobalSetting("Mauszeiger", "mouseEnabled", GlobalSetting.TYPE_BOOLEAN, false));
        globalSettings.addSetting(new GlobalSetting("BildschirmSchonerInMSec", "screenSaveTimeMS", GlobalSetting.TYPE_NUMBER, 10000));

        //call method to test
        result = globalSettings.getJsonWithAllSettingFileNamesAndVarTypes();

        //tests
        expect(result.Vollbild).toBe(GlobalSetting.TYPE_BOOLEAN);
        expect(result.Mauszeiger).toBe(GlobalSetting.TYPE_BOOLEAN);
        expect(result.BildschirmSchonerInMSec).toBe(GlobalSetting.TYPE_NUMBER);
    });
});

describe("test getJsonWithAllNamesAndValues() ", ()=>{
    it("should return a JSON with key-value pairs which reflect the names and values of all the settings added to the class by addSetting()", ()=>{
        //setup
        let result:any;
        globalSettings.addSetting(new GlobalSetting("Vollbild", "isFullScreen", GlobalSetting.TYPE_BOOLEAN, true));
        globalSettings.addSetting(new GlobalSetting("Mauszeiger", "mouseEnabled", GlobalSetting.TYPE_BOOLEAN, false));
        globalSettings.addSetting(new GlobalSetting("BildschirmSchonerInMSec", "screenSaveTimeMS", GlobalSetting.TYPE_NUMBER, 10000));

        //call method to test
        result = globalSettings.getJsonWithAllNamesAndValues();

        //tests
        expect(result.isFullScreen).toBe(true);
        expect(result.mouseEnabled).toBe(false);
        expect(result.screenSaveTimeMS).toBe(10000);
    });
});