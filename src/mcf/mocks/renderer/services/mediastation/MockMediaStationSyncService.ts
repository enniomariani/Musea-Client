import {MockNetworkService} from "../../network/MockNetworkService";
import {MockMediaStationRepository} from "../../dataStructure/MockMediaStationRepository";
import {MediaStationSyncService} from "../../../../renderer/services/mediastation/MediaStationSyncService";
import {MockMediaAppConnectionService} from "../MockMediaAppConnectionService";
import {MockMediaAppSyncService} from "../../network/MockMediaAppSyncService";

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