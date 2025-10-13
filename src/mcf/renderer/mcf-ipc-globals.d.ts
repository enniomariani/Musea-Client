declare global {
    interface Window {
        mcfBackendFiles: import("main/MediaClientFrameworkMain.js").IMainFileService;
        mcfBackendNetwork: import("main/MediaClientFrameworkMain.js").IMainNetworkService;
    }
}

export {};