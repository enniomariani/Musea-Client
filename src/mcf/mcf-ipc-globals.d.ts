export {};

declare global {
    interface Window {
        mcfBackendFiles:IBackendFileService;
        mcfBackendNetwork:IBackendNetworkService;
    }
}