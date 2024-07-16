import {GlobalSetting} from "./GlobalSetting";


export class GlobalSettingsFactory{

    //names of global settings
    static IS_FULLSCREEN:string = "isFullScreen";
    static MOUSE_ENABLED:string = "mouseEnabled";
    static SCREENSAVE_TIMER_MS:string = "screenSaveTimeMS";

    constructor() {}

    /**
     * creates an array of GlobalSetting-objects
     * @returns {GlobalSetting[]}
     */
    static getGlobalSettings(){
        let settings = [];
        settings.push(new GlobalSetting("Vollbild", GlobalSettingsFactory.IS_FULLSCREEN, GlobalSetting.TYPE_BOOLEAN, true));
        settings.push(new GlobalSetting("Mauszeiger", GlobalSettingsFactory.MOUSE_ENABLED, GlobalSetting.TYPE_BOOLEAN, false));
        settings.push(new GlobalSetting("BildschirmSchonerInMSec", GlobalSettingsFactory.SCREENSAVE_TIMER_MS, GlobalSetting.TYPE_NUMBER, 10000));

        return settings
    }
}