import {MockMediaStationRepository} from "../../dataStructure/MockMediaStationRepository.js";
import {
    MediaStationCacheService
} from "../../../../renderer/services/mediastation/MediaStationCacheService.js";
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();


export class MockMediaStationCacheService extends MediaStationCacheService {
    cacheMediaStation: jest.Mock;
    isMediaStationCached: jest.Mock;

    constructor() {
        super(mockMediaStationRepo);
        this.cacheMediaStation = jest.fn();
        this.isMediaStationCached = jest.fn();
    }
}