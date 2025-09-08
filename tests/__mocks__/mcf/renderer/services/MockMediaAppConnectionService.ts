import {MockNetworkService} from "tests/__mocks__/mcf/renderer/network/MockNetworkService";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {MediaAppConnectionService} from "src/mcf/renderer/services/MediaAppConnectionService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaAppConnectionService extends MediaAppConnectionService{
    isOnline: jest.Mock;
    pcRespondsToPing: jest.Mock;
    connectAndRegisterToMediaApp: jest.Mock;
    unregisterAndCloseMediaApp: jest.Mock;
    checkOnlineStatusOfAllMediaApps: jest.Mock;

    constructor() {
        super(mockMediaStationRepo, mockNetworkService);
        this.isOnline = jest.fn();
        this.pcRespondsToPing = jest.fn();
        this.connectAndRegisterToMediaApp = jest.fn();
        this.unregisterAndCloseMediaApp = jest.fn();
        this.checkOnlineStatusOfAllMediaApps = jest.fn();
    }
}