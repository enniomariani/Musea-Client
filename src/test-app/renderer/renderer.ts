import {MainApp} from "./MainApp.js";

document.addEventListener("DOMContentLoaded", async function () {
    let mainApp:MainApp =  new MainApp()
    await mainApp.initFrameWork();
});