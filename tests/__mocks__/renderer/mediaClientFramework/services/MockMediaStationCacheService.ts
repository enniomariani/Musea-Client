import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {
    MediaStationCacheService
} from "../../../../../src/js/renderer/mediaClientFramework/services/MediaStationCacheService";
import {MockContentFileService} from "../fileHandling/MockContentFileService";

const mockContentFileService:MockContentFileService = new MockContentFileService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();


export class MockMediaStationCacheService extends MediaStationCacheService {
    cacheMediaStation: jest.Mock;
    isMediaStationCached: jest.Mock;

    constructor() {
        super(mockContentFileService, mockMediaStationRepo);
        this.cacheMediaStation = jest.fn();
        this.isMediaStationCached = jest.fn();
    }
}