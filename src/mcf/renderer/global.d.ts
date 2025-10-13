/// <reference path="./global.d.ts" />
import {IMainFileService, IMainNetworkService} from "main/MediaClientFrameworkMain.js";

declare global {
    interface Window {
        mcfBackendFiles:IMainFileService;
        mcfBackendNetwork:IMainNetworkService;
    }
}