//the preload-script does NOT SUPPORT ESM!

const {ipcRenderer, contextBridge} = require('electron');

console.log("Preload-Script starts: ", process.env.NODE_ENV);

//the "main"-world means the RENDERER-world (the code that runs in the virtual browser)
//this method makes the ipcRenderer-Object available as a sub-object of the window-object (window.ipcRenderer)
//if you include it like this in the renderer.ts: const { backend } = window;, you can use the object ipcRenderer directly
//more info here: https://chiragagrawal65.medium.com/how-to-import-ipcrenderer-in-renderer-process-component-26fef55fa4b7
contextBridge.exposeInMainWorld("backend", {
    loadSettings: () => ipcRenderer.invoke('app:load-settings')
});

contextBridge.exposeInMainWorld("backendFileService", {
    saveFile: (path: string, data: Uint8Array) => ipcRenderer.invoke('mediaClientFramework:saveFile', path, data),
    deleteFile: (path: string) => ipcRenderer.invoke('mediaClientFramework:deleteFile', path),
    loadFile: (path: string) => ipcRenderer.invoke('mediaClientFramework:loadFile', path),
    fileExists: (path: string) => ipcRenderer.invoke('mediaClientFramework:fileExists', path)
});

contextBridge.exposeInMainWorld("backendNetworkService", {
    ping: (ip: string) => ipcRenderer.invoke('backendNetworkService:ping', ip)
});

console.log("Preload-script ended");