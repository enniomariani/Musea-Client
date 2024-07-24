import {ControllerMain} from "./controllers/ControllerMain";

console.log("renderer starts")

document.addEventListener("DOMContentLoaded", async function () {

    //load main-controller here
    let controllerMain:ControllerMain = new ControllerMain();
    await controllerMain.init();

});