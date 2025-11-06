declare global {
    interface Window {
        mcfBackendFiles: import("../../musea-client/main/MediaClientFrameworkMain.js").IMainFileService;
        mcfBackendNetwork: import("../../musea-client/main/MediaClientFrameworkMain.js").IMainNetworkService;
    }
}

export {};