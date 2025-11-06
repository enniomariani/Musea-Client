//the preload-script does NOT SUPPORT ESM! Only if sandbox = false
const {ipcRenderer, contextBridge, webUtils} = require('electron');

//the "main"-world means the RENDERER-world (the code that runs in the virtual browser)
//this method makes the ipcRenderer-Object available as a sub-object of the window-object (window.ipcRenderer)
//if you include it like this in the renderer.ts: const { backend } = window;, you can use the object ipcRenderer directly
//more info here: https://chiragagrawal65.medium.com/how-to-import-ipcrenderer-in-renderer-process-component-26fef55fa4b7

export function exposeMuseClientAPI() {
    contextBridge.exposeInMainWorld("museaClientBackendFiles", {
        saveFile: (path: string, data: Uint8Array) => ipcRenderer.invoke('museaClient:saveFile', path, data),
        saveFileByPath: async (path: string, fileInstance: File) => {
            const pathToLoad: string = webUtils.getPathForFile(fileInstance);
            await ipcRenderer.invoke('museaClient:saveFileByPath', path, pathToLoad)
        },
        deleteFile: (path: string) => ipcRenderer.invoke('museaClient:deleteFile', path),
        loadFile: (path: string) => ipcRenderer.invoke('museaClient:loadFile', path),
        fileExists: (path: string) => ipcRenderer.invoke('museaClient:fileExists', path),
        getAllFileNamesInFolder: (path: string) => ipcRenderer.invoke('museaClient:getAllFileNamesInFolder', path)
    });

    contextBridge.exposeInMainWorld("museaClientBackendNetwork", {
        ping: (ip: string) => ipcRenderer.invoke('backendNetworkService:ping', ip)
    });
}