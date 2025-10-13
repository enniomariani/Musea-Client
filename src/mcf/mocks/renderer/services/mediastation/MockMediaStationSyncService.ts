import {MockNetworkService} from "../../network/MockNetworkService.js";
import {MockMediaStationRepository} from "../../dataStructure/MockMediaStationRepository.js";
import {MediaStationSyncService} from "renderer/services/mediastation/MediaStationSyncService.js";
import {MockMediaAppConnectionService} from "../MockMediaAppConnectionService.js";
import {MockMediaAppSyncService} from "../../network/MockMediaAppSyncService.js";

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