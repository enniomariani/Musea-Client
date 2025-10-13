import {MediaFileCacheHandler} from "renderer/fileHandling/MediaFileCacheHandler.js";
import {MockMediaFileService} from "./MockMediaFileService.js";

const mockMediaFileService:MockMediaFileService = new MockMediaFileService();

export class MockMediaFileCacheHandler extends MediaFileCacheHandler{

    hydrate: jest.Mock;

    cacheMedia: jest.Mock;
    isMediaCached: jest.Mock;
    deleteCachedMedia: jest.Mock;
    deleteAllCachedMedia: jest.Mock;
    getCachedMediaFile: jest.Mock;
    getAllCachedMedia: jest.Mock;

    constructor(pathToMainFolder:string) {
        super(pathToMainFolder, mockMediaFileService);

        this.hydrate = jest.fn();

        this.cacheMedia = jest.fn();
        this.isMediaCached = jest.fn();
        this.deleteCachedMedia = jest.fn();
        this.deleteAllCachedMedia = jest.fn();
        this.getCachedMediaFile = jest.fn();
        this.getAllCachedMedia = jest.fn();
    }
}