import {
    MediaStationRepository
} from "../../../../../src/js/renderer/mediaClientFramework/dataStructure/MediaStationRepository";
import {MockMediaStationLocalMetaData} from "../fileHandling/MockMediaStationLocalMetaData";
import {MockMediaFileService} from "../fileHandling/MockMediaFileService";
import {MockContentFileService} from "../fileHandling/MockContentFileService";

const mockMediaStationLocalMetaData:MockMediaStationLocalMetaData = new MockMediaStationLocalMetaData();
const mockMediaFileService:MockMediaFileService = new MockMediaFileService();
const mockContentFileService:MockContentFileService = new MockContentFileService();

export class MockMediaStationRepository extends MediaStationRepository{

    loadMediaStations: jest.Mock;
    addMediaStation: jest.Mock;
    findMediaStation: jest.Mock;
    deleteMediaStation: jest.Mock;
    updateMediaStation: jest.Mock;
    updateAndSaveMediaStation: jest.Mock;
    cacheMedia: jest.Mock;
    isMediaCached: jest.Mock;
    deleteCachedMedia: jest.Mock;
    getCachedMediaFile: jest.Mock;
    getAllCachedMedia: jest.Mock;

    cacheMediaStation: jest.Mock;
    removeCachedMediaStation: jest.Mock;
    isMediaStationCached: jest.Mock;

    constructor() {
        super(mockMediaStationLocalMetaData, "fakePathToMediaFolder", mockMediaFileService, mockContentFileService);
        this.loadMediaStations = jest.fn();
        this.addMediaStation = jest.fn();
        this.findMediaStation = jest.fn();
        this.deleteMediaStation = jest.fn();
        this.updateMediaStation = jest.fn();
        this.updateAndSaveMediaStation = jest.fn();
        this.cacheMedia = jest.fn();
        this.isMediaCached = jest.fn();
        this.deleteCachedMedia = jest.fn();
        this.getCachedMediaFile = jest.fn();
        this.getAllCachedMedia = jest.fn();

        this.cacheMediaStation = jest.fn();
        this.removeCachedMediaStation = jest.fn();
        this.isMediaStationCached = jest.fn();
    }
}