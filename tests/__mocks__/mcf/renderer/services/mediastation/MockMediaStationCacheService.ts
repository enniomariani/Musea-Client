import {MockMediaStationRepository} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {
    MediaStationCacheService
} from "src/mcf/renderer/services/mediastation/MediaStationCacheService";
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