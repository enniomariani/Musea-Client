import {MockNetworkService} from "tests/__mocks__/mcf/renderer/network/MockNetworkService";
import {MediaAppConnectionService} from "src/mcf/renderer/services/MediaAppConnectionService";
import {MockMediaStationRepository} from "__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStatonRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaAppConnectionService extends MediaAppConnectionService{
    checkConnection: jest.Mock;
    connectAndRegisterToMediaApp: jest.Mock;
    unregisterAndCloseMediaApp: jest.Mock;
    checkOnlineStatusOfAllMediaApps: jest.Mock;

    constructor() {
        super(mockMediaStatonRepo, mockNetworkService);
        this.checkConnection = jest.fn();
        this.connectAndRegisterToMediaApp = jest.fn();
        this.unregisterAndCloseMediaApp = jest.fn();
        this.checkOnlineStatusOfAllMediaApps = jest.fn();
    }
}