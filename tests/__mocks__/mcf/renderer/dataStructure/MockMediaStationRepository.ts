import {
    MediaStationRepository
} from "../../../../../src/mcf/renderer/dataStructure/MediaStationRepository";
import {MockMediaStationLocalMetaData} from "../fileHandling/MockMediaStationLocalMetaData";
import {MockContentFileService} from "../fileHandling/MockContentFileService";
import {MockMediaFilesMarkedToDeleteService} from "../fileHandling/MockMediaFilesMarkedToDeleteService";
import {MockMediaFileCacheHandler} from "tests/__mocks__/mcf/renderer/fileHandling/MockMediaFileCacheHandler";

const mockMediaStationLocalMetaData:MockMediaStationLocalMetaData = new MockMediaStationLocalMetaData();
const mockMediaCacheHandler:MockMediaFileCacheHandler = new MockMediaFileCacheHandler("fakePathToMediaFolder");
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

    private _mockMediaCacheHandler:MockMediaFileCacheHandler = new MockMediaFileCacheHandler("fakePathToMediaFolder");

    cacheMediaStation: jest.Mock;
    removeCachedMediaStation: jest.Mock;
    isMediaStationCached: jest.Mock;

    markMediaIDtoDelete: jest.Mock;
    deleteStoredMediaID: jest.Mock;
    getAllMediaIDsToDelete: jest.Mock;

    constructor() {
        super(mockMediaStationLocalMetaData, "fakePathToMediaFolder", mockMediaCacheHandler,mockMediaFilesMarkedToDeleteService, mockContentFileService);

        this.loadMediaStations = jest.fn();
        this.addMediaStation = jest.fn();
        this.findMediaStation = jest.fn();
        this.requireMediaStation = jest.fn();
        this.deleteMediaStation = jest.fn();
        this.updateMediaStation = jest.fn();
        this.updateAndSaveMediaStation = jest.fn();

        this.cacheMediaStation = jest.fn();
        this.removeCachedMediaStation = jest.fn();
        this.isMediaStationCached = jest.fn();

        this.markMediaIDtoDelete = jest.fn();
        this.deleteStoredMediaID = jest.fn();
        this.getAllMediaIDsToDelete = jest.fn();
    }

    override  get mediaCacheHandler(): MockMediaFileCacheHandler {
        return this._mockMediaCacheHandler;
    }

}