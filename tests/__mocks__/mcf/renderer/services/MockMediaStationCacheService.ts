import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {
    MediaStationCacheService
} from "../../../../../src/js/mcf/renderer/services/MediaStationCacheService";
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