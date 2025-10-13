import {MockNetworkService} from "../network/MockNetworkService.js";
import {MediaAppConnectionService} from "../../../renderer/services/MediaAppConnectionService.js";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository.js";
import {CheckOptions, MediaAppConnectionStatus} from "../../../renderer/network/MediaAppConnectionSteps.js";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStatonRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaAppConnectionService extends MediaAppConnectionService{
    checkConnection: jest.Mock<Promise<MediaAppConnectionStatus>, [ip:string, options: CheckOptions]>;
    connectAndRegisterToMediaApp: jest.Mock<Promise<boolean>, [mediaStationId: number, mediaAppId: number, role?: string]>;
    unregisterAndCloseMediaApp: jest.Mock<Promise<void>, [mediaStationId: number, mediaAppId: number]>;
    checkOnlineStatusOfAllMediaApps: jest.Mock<Promise<boolean>, [id: number]>;

    constructor() {
        super(mockMediaStatonRepo, mockNetworkService);
        this.checkConnection = jest.fn();
        this.connectAndRegisterToMediaApp = jest.fn();
        this.unregisterAndCloseMediaApp = jest.fn();
        this.checkOnlineStatusOfAllMediaApps = jest.fn();
    }
}