import {
    MediaStationRepository
} from "../../../../../src/mcf/renderer/dataStructure/MediaStationRepository";
import {MockMediaStationLocalMetaData} from "../fileHandling/MockMediaStationLocalMetaData";
import {MockMediaFileService} from "../fileHandling/MockMediaFileService";
import {MockContentFileService} from "../fileHandling/MockContentFileService";
import {MockMediaFilesMarkedToDeleteService} from "../fileHandling/MockMediaFilesMarkedToDeleteService";

const mockMediaStationLocalMetaData:MockMediaStationLocalMetaData = new MockMediaStationLocalMetaData();
const mockMediaFileService:MockMediaFileService = new MockMediaFileService();
const mockContentFileService:MockContentFileService = new MockContentFileService();
const mockMediaFilesMarkedToDeleteService:MockMediaFilesMarkedToDeleteService = new MockMediaFilesMarkedToDeleteService();

export class MockMediaStationRepository extends MediaStationRepository{

    loadMediaStations: jest.Mock;
    addMediaStation: jest.Mock;
    findMediaStation: jest.Mock;
    requireMediaStation: jest.Mock;
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

    markMediaIDtoDelete: jest.Mock;
    deleteStoredMediaID: jest.Mock;
    getAllMediaIDsToDelete: jest.Mock;

    constructor() {
        super(mockMediaStationLocalMetaData, "fakePathToMediaFolder", mockMediaFileService,mockMediaFilesMarkedToDeleteService, mockContentFileService);
        this.loadMediaStations = jest.fn();
        this.addMediaStation = jest.fn();
        this.findMediaStation = jest.fn();
        this.requireMediaStation = jest.fn();
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

        this.markMediaIDtoDelete = jest.fn();
        this.deleteStoredMediaID = jest.fn();
        this.getAllMediaIDsToDelete = jest.fn();
    }
}