import {ModelMain} from "../models/ModelMain";
import {CreateGlobalSettings} from "../models/globalSettings/CreateGlobalSettings";
import {ViewMain} from "../views/ViewMain";
import {GlobalSettings} from "../models/globalSettings/GlobalSettings";


export class ControllerMain{

    _modelMain:ModelMain = new ModelMain(new CreateGlobalSettings(new GlobalSettings(),window.backend), new GlobalSettings(), window.backend)
    _viewMain:ViewMain = new ViewMain();

    constructor() {    }

    async init(){
        console.log("ControllerMain init: get backend: ", window.backend)
        this._viewMain.init();

        await this._modelMain.loadSettings();

        await this._modelMain.initFrameWork();
    }
}