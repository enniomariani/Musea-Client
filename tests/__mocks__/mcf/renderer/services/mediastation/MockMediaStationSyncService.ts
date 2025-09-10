import {MockNetworkService} from "tests/__mocks__/mcf/renderer/network/MockNetworkService";
import {MockMediaStationRepository} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MediaStationSyncService} from "src/mcf/renderer/services/mediastation/MediaStationSyncService";
import {MockMediaAppConnectionService} from "tests/__mocks__/mcf/renderer/network/MockMediaAppConnectionService";
import {MockMediaAppSyncService} from "tests/__mocks__/mcf/renderer/network/MockMediaAppSyncService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockMediaAppConnectionService:MockMediaAppConnectionService = new MockMediaAppConnectionService();
const mockMediaAppSyncService:MockMediaAppSyncService = new MockMediaAppSyncService();

export class MockMediaStationSyncService extends MediaStationSyncService{
    sync: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStationRepo, mockMediaAppConnectionService, mockMediaAppSyncService);
        this.sync = jest.fn();
    }
}