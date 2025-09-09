import {MockNetworkService} from "tests/__mocks__/mcf/renderer/network/MockNetworkService";
import {MockMediaStationRepository} from "__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MediaAppSyncService} from "src/mcf/renderer/network/MediaAppSyncService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStatonRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaAppSyncService extends MediaAppSyncService{
    sendMediaFilesToMediaApp: jest.Mock;
    sendCommandDeleteMediaToMediaApps: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStatonRepo );
        this.sendMediaFilesToMediaApp = jest.fn();
        this.sendCommandDeleteMediaToMediaApps = jest.fn();
    }
}