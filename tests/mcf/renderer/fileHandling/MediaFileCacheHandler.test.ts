import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {MockMediaFileService} from "src/mcf/mocks/renderer/fileHandling/MockMediaFileService";
import {ICachedMedia, MediaFileCacheHandler} from "renderer/fileHandling/MediaFileCacheHandler";

let mockMediaFileService:MockMediaFileService;
let mediaFileCacheHandler:MediaFileCacheHandler;

const pathToDataFolder:string = "pathToData";

beforeEach(() => {
    mockMediaFileService = new MockMediaFileService();
    mediaFileCacheHandler = new MediaFileCacheHandler(pathToDataFolder, mockMediaFileService);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("hydrate() ", ()=>{
    it("should load cached media from service and set it for the station", async ()=>{
        const stationId = 7;
        const list: ICachedMedia[] = [
            { contentId: 10, mediaAppId: 2, fileExtension: "jpeg" },
            { contentId: 11, mediaAppId: 3, fileExtension: "mp4" },
        ];
        mockMediaFileService.getAllCachedMedia.mockResolvedValueOnce(list);

        // method to test
        await mediaFileCacheHandler.hydrate(stationId);

        // tests
        expect(mockMediaFileService.getAllCachedMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaFileService.getAllCachedMedia).toHaveBeenCalledWith(stationId);
        expect(mediaFileCacheHandler.getAllCachedMedia().get(stationId)).toEqual(list);
    });

    it("should set an empty array when service returns undefined/null", async ()=>{
        const stationId = 3;
        mockMediaFileService.getAllCachedMedia.mockResolvedValueOnce(undefined as unknown as ICachedMedia[]);

        // method to test
        await mediaFileCacheHandler.hydrate(stationId);

        // tests
        expect(mediaFileCacheHandler.getAllCachedMedia().get(stationId)).toEqual([]);
    });

    it("should overwrite any existing cache for the station", async ()=>{
        const stationId = 5;
        const fileName = 'mockFile.txt';
        const fileContent = 'Hello, world!';
        const fileType = 'text/plain';
        const mockFile = new File([fileContent], fileName, { type: fileType });

        // pre-populate internal cache via public API
        await mediaFileCacheHandler.cacheMedia(stationId, 1, 1, "png", mockFile);

        const replacement: ICachedMedia[] = [{ contentId: 2, mediaAppId: 2, fileExtension: "mp4" }];
        mockMediaFileService.getAllCachedMedia.mockResolvedValueOnce(replacement);

        // method to test
        await mediaFileCacheHandler.hydrate(stationId);

        // tests
        expect(mediaFileCacheHandler.getAllCachedMedia().get(stationId)).toEqual(replacement);
    });
});

describe("cacheMedia() ", ()=>{
    const fileName = 'mockFile.txt';
    const fileContent = 'Hello, world!';
    const fileType = 'text/plain';

    // Create a mock File object
    const mockFile = new File([fileContent], fileName, { type: fileType });
    it("should call mediaFileService.saveFile with the passed parameters", async ()=>{
        await mediaFileCacheHandler.cacheMedia(0,1,2,"jpeg", mockFile);

        expect(mockMediaFileService.saveFileByPath).toHaveBeenCalledTimes(1);
        expect(mockMediaFileService.saveFileByPath).toHaveBeenCalledWith(0, 1,2, "jpeg", mockFile);
    });

    it("should add the cached media to cachedMedia and create a mediaStationId if it does not exist", async ()=>{
        await mediaFileCacheHandler.cacheMedia(0,1,2,"jpeg", mockFile);
        const mediaFileArr:ICachedMedia[]|undefined = mediaFileCacheHandler.getAllCachedMedia().get(0);
        expect(mediaFileArr).not.toBeUndefined();

        if (mediaFileArr) {
            expect(mediaFileArr[0].mediaAppId).toBe(2);
            expect(mediaFileArr[0].contentId).toBe(1);
            expect(mediaFileArr[0].fileExtension).toBe("jpeg");
        }
    });

    it("should add the cached media to cachedMedia if the mediastation already exists and has already a cached file set", async ()=>{
        await mediaFileCacheHandler.cacheMedia(0,1,2,"jpeg", mockFile);
        await mediaFileCacheHandler.cacheMedia(0,2,2,"mp4", mockFile);

        const mediaFileArr:ICachedMedia[]|undefined = mediaFileCacheHandler.getAllCachedMedia().get(0);
        expect(mediaFileArr).not.toBeUndefined();

        if (mediaFileArr) {
            expect(mediaFileArr.length).toBe(2);
            expect(mediaFileArr[1].mediaAppId).toBe(2);
            expect(mediaFileArr[1].contentId).toBe(2);
            expect(mediaFileArr[1].fileExtension).toBe("mp4");
        }
    });
});

describe("isMediaCached() ", ()=>{
    it("should return true if the media is cached", async ()=>{
        const file = new File(["x"], "x", {type: "text/plain"});
        await mediaFileCacheHandler.cacheMedia(0,1,2,"jpeg", file);
        let answer:boolean;

        answer = mediaFileCacheHandler.isMediaCached(0,1,2);

        expect(answer).toBe(true);
    });

    it("should return false if the media is not cached", async ()=>{
        const file = new File(["x"], "x", {type: "text/plain"});
        await mediaFileCacheHandler.cacheMedia(0,1,2,"jpeg", file);
        let answer:boolean;

        answer = mediaFileCacheHandler.isMediaCached(0,1,1);

        expect(answer).toBe(false);
    });

    it("should return false if there is no media cached for the mediastation", ()=>{
        const answer = mediaFileCacheHandler.isMediaCached(1,1,2);
        expect(answer).toBe(false);
    });
});

describe("deleteCachedMedia() ", ()=>{
    it("should call mediaFileService.deleteFile with the passed parameters", async ()=>{
        const file = new File(["x"], "x", {type: "text/plain"});
        await mediaFileCacheHandler.cacheMedia(0,3,3,"mp4", file);
        await mediaFileCacheHandler.cacheMedia(0,1,2,"jpeg", file);

        mediaFileCacheHandler.deleteCachedMedia(0,1,2);

        expect(mockMediaFileService.deleteFile).toHaveBeenCalledTimes(1);
        expect(mockMediaFileService.deleteFile).toHaveBeenCalledWith(0, 1,2, "jpeg");
    });

    it("should remove the cached media from cachedMedia but other entries should be preserved, element to delete is first in array", async ()=>{
        const file = new File(["x"], "x", {type: "text/plain"});
        await mediaFileCacheHandler.cacheMedia(0,3,3,"mp4", file);
        await mediaFileCacheHandler.cacheMedia(0,1,2,"jpeg", file);

        mediaFileCacheHandler.deleteCachedMedia(0,3,3);

        const copy = mediaFileCacheHandler.getAllCachedMedia().get(0);
        expect(copy).not.toBeUndefined();
        expect(copy![0].contentId).toBe(1);
        expect(copy![0].mediaAppId).toBe(2);
        expect(copy![0].fileExtension).toBe("jpeg");
    });

    it("should remove the cached media from cachedMedia but other entries should be preserved, element to delete is last in array", async ()=>{
        const file = new File(["x"], "x", {type: "text/plain"});
        await mediaFileCacheHandler.cacheMedia(0,3,3,"mp4", file);
        await mediaFileCacheHandler.cacheMedia(0,1,2,"jpeg", file);

        mediaFileCacheHandler.deleteCachedMedia(0,1,2);

        const copy = mediaFileCacheHandler.getAllCachedMedia().get(0);
        expect(copy).not.toBeUndefined();
        expect(copy![0].contentId).toBe(3);
        expect(copy![0].mediaAppId).toBe(3);
        expect(copy![0].fileExtension).toBe("mp4");
    });

    it("should remove the mediaStationId when no cached media left", async ()=>{
        const file = new File(["x"], "x", {type: "text/plain"});
        await mediaFileCacheHandler.cacheMedia(0,1,2,"jpeg", file);

        mediaFileCacheHandler.deleteCachedMedia(0,1,2);

        expect(mediaFileCacheHandler.getAllCachedMedia().get(0)).toBeUndefined();
    });

    it("should throw an error if there are no media cached for the passed mediastation", ()=>{
        expect(()=> mediaFileCacheHandler.deleteCachedMedia(1,1,2)).toThrow("No media cached for mediastation with ID: 1")
    });

    it("should throw an error if there is no cached media for the passed contentId and mediaAppID", async ()=>{
        const file = new File(["x"], "x", {type: "text/plain"});
        await mediaFileCacheHandler.cacheMedia(0,1,2,"jpeg", file);

        expect(()=> mediaFileCacheHandler.deleteCachedMedia(0,2,2)).toThrow("No media cached for media-App-ID 2 in content-ID 2 of mediastation with ID: 0")
    });
});

describe("getCachedMediaFile() ", ()=>{
    it("should call mediaFileService.loadFile with the passed parameters", async ()=>{
        await mediaFileCacheHandler.getCachedMediaFile(0,1,2, "jpeg");

        expect(mockMediaFileService.loadFile).toHaveBeenCalledTimes(1);
        expect(mockMediaFileService.loadFile).toHaveBeenCalledWith(0, 1,2, "jpeg");
    })

    it("should return what mediaFileService.loadFile returns", async ()=>{
        let data:Uint8Array = new Uint8Array([0x00, 0x11, 0xFF]);
        mockMediaFileService.loadFile.mockReturnValueOnce(data);

        const answer:Uint8Array|null = await mediaFileCacheHandler.getCachedMediaFile(0,1,2, "jpeg");

        expect(answer).toEqual(data);
    });
});

describe("deleteAllCachedMedia() ", ()=>{
    it("should delete all cached media files for the station and remove the station entry", async ()=>{
        const stationId = 9;
        const file = new File(["x"], "x", {type: "text/plain"});
        await mediaFileCacheHandler.cacheMedia(stationId, 101, 2, "jpeg", file);
        await mediaFileCacheHandler.cacheMedia(stationId, 102, 3, "mp4", file);

        mediaFileCacheHandler.deleteAllCachedMedia(stationId);

        expect(mockMediaFileService.deleteFile).toHaveBeenCalledTimes(2);
        expect(mockMediaFileService.deleteFile).toHaveBeenNthCalledWith(1, stationId, 101, 2, "jpeg");
        expect(mockMediaFileService.deleteFile).toHaveBeenNthCalledWith(2, stationId, 102, 3, "mp4");
        expect(mediaFileCacheHandler.getAllCachedMedia().get(stationId)).toBeUndefined();
    });

    it("should throw when no media is cached for the station", ()=>{
        const stationId = 4;

        expect(() => mediaFileCacheHandler.deleteAllCachedMedia(stationId))
            .toThrow("No media cached for mediastation with ID: 4");
        expect(mockMediaFileService.deleteFile).not.toHaveBeenCalled();
    });

    it("should handle an empty array by removing the station without calling deleteFile", async ()=>{
        const stationId = 11;
        mockMediaFileService.getAllCachedMedia.mockResolvedValueOnce([]);
        await mediaFileCacheHandler.hydrate(stationId);

        mediaFileCacheHandler.deleteAllCachedMedia(stationId);

        expect(mockMediaFileService.deleteFile).not.toHaveBeenCalled();
        expect(mediaFileCacheHandler.getAllCachedMedia().get(stationId)).toBeUndefined();
    });
});