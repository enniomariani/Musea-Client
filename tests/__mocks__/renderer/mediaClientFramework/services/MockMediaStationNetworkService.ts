import {MockNetworkService} from "./MockNetworkService";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {
    MediaStationNetworkService
} from "../../../../../src/js/renderer/mediaClientFramework/services/MediaStationNetworkService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();


export class MockMediaStationNetworkService extends MediaStationNetworkService{
    downloadContentsOfMediaStation: jest.Mock;
    downloadOnlyMediaAppDataFromMediaStation: jest.Mock;
    syncMediaStation: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStationRepo);
        this.downloadContentsOfMediaStation = jest.fn();
        this.downloadOnlyMediaAppDataFromMediaStation = jest.fn();
        this.syncMediaStation = jest.fn();
    }
}