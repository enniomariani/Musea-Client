import {MockNetworkService} from "./MockNetworkService";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {
    MediaStationNetworkService
} from "../../../../../src/js/renderer/mediaClientFramework/services/MediaStationNetworkService";
import {MockContentFileService} from "../fileHandling/MockContentFileService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockContentFileService:MockContentFileService = new MockContentFileService();


export class MockMediaStationNetworkService extends MediaStationNetworkService{
    downloadContentsOfMediaStation: jest.Mock;
    downloadOnlyMediaAppDataFromMediaStation: jest.Mock;
    syncMediaStation: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStationRepo, mockContentFileService);
        this.downloadContentsOfMediaStation = jest.fn();
        this.downloadOnlyMediaAppDataFromMediaStation = jest.fn();
        this.syncMediaStation = jest.fn();
    }
}