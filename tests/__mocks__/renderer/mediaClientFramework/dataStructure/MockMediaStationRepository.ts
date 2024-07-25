import {
    MediaStationRepository
} from "../../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaStationRepository";
import {MockMediaStationLocalMetaData} from "../fileHandling/MockMediaStationLocalMetaData";
import {MockMediaFileService} from "../fileHandling/MockMediaFileService";

const mockMediaStationLocalMetaData:MockMediaStationLocalMetaData = new MockMediaStationLocalMetaData();
const mockMediaFileService:MockMediaFileService = new MockMediaFileService();

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

    constructor() {
        super(mockMediaStationLocalMetaData, "fakePathToMediaFolder", mockMediaFileService);
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
    }
}