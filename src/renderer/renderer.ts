import {MainApp} from "./MainApp";

console.log("renderer starts")

document.addEventListener("DOMContentLoaded", async function () {
    let mainApp:MainApp =  new MainApp(window.backend)
    await mainApp.initFrameWork();
});