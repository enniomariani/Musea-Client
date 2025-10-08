import {MainApp} from "./MainApp";

document.addEventListener("DOMContentLoaded", async function () {
    let mainApp:MainApp =  new MainApp(window.backend)
    await mainApp.initFrameWork();
});