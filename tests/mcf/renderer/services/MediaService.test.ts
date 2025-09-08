import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {
    MockMediaStationRepository
} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MockMediaManager} from "../../../__mocks__/mcf/renderer/dataManagers/MockMediaManager";
import {Image, Video} from "../../../../src/mcf/renderer/dataStructure/Media";
import {MediaService} from "../../../../src/mcf/renderer/services/MediaService";
import {MediaManager} from "../../../../src/mcf/renderer/dataManagers/MediaManager";

let mediaService: MediaService;
let mockMediaStationRepo: MockMediaStationRepository;
let mockMediaManager: MockMediaManager;

const mediaStationId: number = 0;
const contentId: number = 12;

beforeEach(() => {
    mockMediaStationRepo = new MockMediaStationRepository();
    mockMediaManager = new MockMediaManager();
    mediaService = new MediaService(mockMediaStationRepo, mockMediaManager);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("addImageAndCacheIt() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let image: Image = new Image();
    let fileExtension: string = MediaService.FILE_EXTENSION_IMAGE_JPEG;
    const fileContent = 'Hello, world!';
    const fileType = 'text/plain';
    const fileName:string = "testFileName.xy";

    // Create a mock File object
    const mockFile = new File([fileContent], fileName, { type: fileType });


    it("should call contentManager.createImage with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        await mediaService.addImageAndCacheIt(mediaStationId, contentId, 0, fileExtension, mockFile, fileName);

        expect(mockMediaManager.createImage).toHaveBeenCalledTimes(1);
        expect(mockMediaManager.createImage).toHaveBeenCalledWith(mockMediaStation, contentId, 0, fileName);
    });

    it("should call mediaStationRepository.updateMediaStation", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        await mediaService.addImageAndCacheIt(mediaStationId, contentId, 0, fileExtension, mockFile, fileName);

        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should call mediaStationRepository.cacheMedia with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        await mediaService.addImageAndCacheIt(mediaStationId, contentId, 0, fileExtension, mockFile, fileName);

        expect(mockMediaStationRepo.mediaCacheHandler.cacheMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.mediaCacheHandler.cacheMedia).toHaveBeenCalledWith(mediaStationId, contentId, 0, fileExtension, mockFile);
    });

    it("should throw an error if the passed fileExtension is not one of the MediaService.FILE_EXTENSION_IMAGE vars", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        await expect(mediaService.addImageAndCacheIt(mediaStationId, contentId, 0, "otherFileExtension", mockFile, fileName)).rejects.toThrow(new Error("Non-valid file-extension passed: otherFileExtension"));
    });
});

describe("addVideoAndCacheIt() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let video: Video = new Video();
    let fileExtension: string = MediaService.FILE_EXTENSION_VIDEO_MP4;
    const fileContent = 'Hello, world!';
    const fileType = 'text/plain';
    const fileName:string = "testFileName.xy";

    // Create a mock File object
    const mockFile = new File([fileContent], fileName, { type: fileType });

    it("should call contentManager.createVideo with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        await mediaService.addVideoAndCacheIt(mediaStationId, contentId, 0, 199, fileExtension, mockFile, fileName);

        expect(mockMediaManager.createVideo).toHaveBeenCalledTimes(1);
        expect(mockMediaManager.createVideo).toHaveBeenCalledWith(mockMediaStation, contentId, 0, 199, fileName);
    });

    it("should call mediaStationRepository.updateMediaStation", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        await mediaService.addVideoAndCacheIt(mediaStationId, contentId, 0, 199, fileExtension, mockFile, fileName);

        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should call mediaStationRepository.cacheMedia with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        await mediaService.addVideoAndCacheIt(mediaStationId, contentId, 0, 199, fileExtension, mockFile, fileName);

        expect(mockMediaStationRepo.mediaCacheHandler.cacheMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.mediaCacheHandler.cacheMedia).toHaveBeenCalledWith(mediaStationId, contentId, 0, fileExtension, mockFile);
    });

    it("should throw an error if the passed fileExtension is not one of the MediaService.FILE_EXTENSION_VIDEO vars", async() => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        await expect(mediaService.addVideoAndCacheIt(mediaStationId, contentId, 0, 150, "otherFileExtension", mockFile, fileName)).rejects.toThrow(new Error("Non-valid file-extension passed: otherFileExtension"));
    });
});

describe("getFileName() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call contentManager.getFileName with the correct arguments", () => {
        let answer: string;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.getFileName.mockReturnValueOnce("fileNameX");

        answer = mediaService.getFileName(mediaStationId, contentId, 0);

        expect(answer).toBe("fileNameX");
    });
});

describe("getMediaType() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call contentManager.getMediaType with the correct arguments", () => {
        let answer: string;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.getMediaType.mockReturnValueOnce(MediaManager.MEDIA_TYPE_IMAGE);

        answer = mediaService.getMediaType(mediaStationId, contentId, 0);

        expect(answer).toBe(MediaManager.MEDIA_TYPE_IMAGE);
    });
});

describe("deleteMedia() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call mediaManager.deleteMedia with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await mediaService.deleteMedia(mediaStationId, contentId, 0);

        expect(mockMediaManager.deleteMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaManager.deleteMedia).toHaveBeenCalledWith(mockMediaStation, contentId, 0);
    });

    it("should call mediaStationRepository.deleteCachedMedia if mediaStationRepository.isMediaCached is true", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStationRepo.mediaCacheHandler.isMediaCached.mockImplementation((msID: number, cID: number, mediaAppId: number) => {
            if (msID === mediaStationId && cID === contentId && mediaAppId === 0)
                return true;
            else
                return false;
        });

        await mediaService.deleteMedia(mediaStationId, contentId, 0);

        expect(mockMediaStationRepo.mediaCacheHandler.deleteCachedMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.mediaCacheHandler.deleteCachedMedia).toHaveBeenCalledWith(mediaStationId, contentId, 0);
    });

    it("should not call mediaStationRepository.deleteCachedMedia if mediaStationRepository.isMediaCached is false", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStationRepo.mediaCacheHandler.isMediaCached.mockImplementation((msID: number, cID: number, mediaAppId: number) => {
            if (msID === mediaStationId && cID === contentId && mediaAppId === 0)
                return false;
            else
                return true;
        });

        await mediaService.deleteMedia(mediaStationId, contentId, 0);

        expect(mockMediaStationRepo.mediaCacheHandler.deleteCachedMedia).toHaveBeenCalledTimes(0);
    });

    it("should call mediaStationRepository.markMediaIDtoDelete if mediaStationRepository.isMediaCached is false", async () => {
        const idOnMediaApp: number = 20;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStationRepo.mediaCacheHandler.isMediaCached.mockImplementation((msID: number, cID: number, mediaAppId: number) => {
            if (msID === mediaStationId && cID === contentId && mediaAppId === 0)
                return false;
            else
                return true;
        });

        mockMediaManager.getIdOnMediaApp.mockImplementation((mediaStation: MockMediaStation, cID: number, mediaAppId: number) => {
            if (mediaStation === mockMediaStation && cID === contentId && mediaAppId === 0)
                return idOnMediaApp;
            else
                return null;
        });

        await mediaService.deleteMedia(mediaStationId, contentId, 0);

        expect(mockMediaStationRepo.markMediaIDtoDelete).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.markMediaIDtoDelete).toHaveBeenCalledWith(mediaStationId, 0, idOnMediaApp);
    });

    it("should call mediaStationRepository.updateMediaStation", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await mediaService.deleteMedia(mediaStationId, contentId, 0);

        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });
});