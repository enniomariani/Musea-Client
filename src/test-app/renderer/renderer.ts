import {MainApp} from "./MainApp";

document.addEventListener("DOMContentLoaded", async function () {
    let mainApp:MainApp =  new MainApp()
    await mainApp.initFrameWork();
});