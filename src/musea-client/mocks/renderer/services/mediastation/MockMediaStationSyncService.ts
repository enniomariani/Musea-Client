import {MockNetworkService} from "../../network/MockNetworkService.js";
import {MockMediaStationRepository} from "../../dataStructure/MockMediaStationRepository.js";
import {MediaStationSyncService} from "renderer/services/mediastation/MediaStationSyncService.js";
import {MockMediaPlayerConnectionService} from "../MockMediaPlayerConnectionService.js";
import {MockMediaPlayerSyncService} from "../../network/MockMediaPlayerSyncService.js";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockMediaPlayerConnectionService:MockMediaPlayerConnectionService = new MockMediaPlayerConnectionService();
const mockMediaPlayerSyncService:MockMediaPlayerSyncService = new MockMediaPlayerSyncService();

export class MockMediaStationSyncService extends MediaStationSyncService{
    sync: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStationRepo, mockMediaPlayerConnectionService, mockMediaPlayerSyncService);
        this.sync = jest.fn();
    }
}