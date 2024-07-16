import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {ModelMain} from "renderer/models/ModelMain";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings";
import {CreateGlobalSettings} from "renderer/models/globalSettings/CreateGlobalSettings"
import {MediaClientFramework} from "../../../public_html/js/renderer/mediaServerFramework/MediaClientFramework";

const mockBackend: jest.Mocked<IBackend> = {
    loadSettings: jest.fn()
};

const globalSettings = new GlobalSettings();

//mock classes
jest.mock('renderer/models/globalSettings/CreateGlobalSettings', () => {
    return {
        CreateGlobalSettings: jest.fn().mockImplementation(() => {
            return {
                create: jest.fn().mockImplementation(()=>{ return globalSettings}),
            }
        }),
    }
});

const createGlobalSettings: CreateGlobalSettings = new CreateGlobalSettings(globalSettings, mockBackend);

jest.mock('../../../public_html/js/renderer/mediaServerFramework/MediaClientFramework', () => {
    return {
        MediaServerFramework: jest.fn().mockImplementation(() => {
            return {}
        }),
    }
});

let modelMain:ModelMain;

beforeEach(() => {
    modelMain = new ModelMain(createGlobalSettings, globalSettings, mockBackend)
});

describe("method loadSettings() ", () =>{
    it("should call createGlobalSettings.create() of ", async() =>{
        globalSettings.errorsInJSON = null;
        //call method to test
        await modelMain.loadSettings();

        //tests
        expect(createGlobalSettings.create).toHaveBeenCalledTimes(1);
    });

    it("should print an error if the property globalSettings.errorsInJSON returned from createGlobalSettings.create is not null", async() =>{
        globalSettings.errorsInJSON = "ERROR";
        let logSpy = jest.spyOn(global.console, 'error');

        //method to test
        await modelMain.loadSettings();

        //tests
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});