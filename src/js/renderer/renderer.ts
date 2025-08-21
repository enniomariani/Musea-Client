import {MainApp} from "./MainApp";
import {CreateGlobalSettings} from "./globalSettings/CreateGlobalSettings";
import {GlobalSettings} from "./globalSettings/GlobalSettings";

console.log("renderer starts")

document.addEventListener("DOMContentLoaded", async function () {

    let mainApp:MainApp =  new MainApp(new CreateGlobalSettings(new GlobalSettings(),window.backend), new GlobalSettings(), window.backend)

    await mainApp.loadSettings();
    await mainApp.initFrameWork();
});