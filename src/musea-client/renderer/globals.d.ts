declare global {
    interface Window {
        museaClientBackendFiles: import("main/MuseaClientMain.js").IMainFileService;
        museaClientBackendNetwork: import("main/MuseaClientMain.js").IMainNetworkService;
    }
}

export {};