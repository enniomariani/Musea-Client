//the preload-script does NOT SUPPORT ESM!
const {ipcRenderer, contextBridge} = require('electron');
const {url} = require('node:url');

console.log("PRELOAD: ", url)
// const { exposeMCFAPI } = require('../../mcf/preload/preload.js');

//the "main"-world means the RENDERER-world (the code that runs in the virtual browser)
//this method makes the ipcRenderer-Object available as a sub-object of the window-object (window.ipcRenderer)
//if you include it like this in the renderer.ts: const { backend } = window;, you can use the object ipcRenderer directly
//more info here: https://chiragagrawal65.medium.com/how-to-import-ipcrenderer-in-renderer-process-component-26fef55fa4b7
contextBridge.exposeInMainWorld("backend", {
    loadSettings: () => ipcRenderer.invoke('app:load-settings')
});

// exposeMCFAPI();