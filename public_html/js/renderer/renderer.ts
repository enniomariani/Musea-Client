import {ControllerMain} from "./controllers/ControllerMain";

document.addEventListener("DOMContentLoaded", async function () {
    console.log("renderer starts")
    //load main-controller here
    let controllerMain:ControllerMain = new ControllerMain();
    await controllerMain.init();

});