import {MockNetworkService} from "tests/__mocks__/mcf/renderer/services/MockNetworkService";
import {MockMediaStationRepository} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MediaStationSyncService} from "@app/mcf/renderer/services/mediastation/MediaStationSyncService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaStationSyncService extends MediaStationSyncService{
    sync: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStationRepo);
        this.sync = jest.fn();
    }
}