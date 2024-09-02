import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {
    MockMediaStationRepository
} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MockMediaManager} from "../../../__mocks__/mcf/renderer/dataManagers/MockMediaManager";
import {Image, Video} from "../../../../src/js/mcf/renderer/dataStructure/Media";
import {MediaService} from "../../../../src/js/mcf/renderer/services/MediaService";
import {MediaManager} from "../../../../src/js/mcf/renderer/dataManagers/MediaManager";

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
    let payload: Uint8Array = new Uint8Array([0x00, 0xFF, 0x12, 0xEF]);
    const fileName:string = "testFileName.xy";

    it("should call contentManager.createImage with the correct arguments", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        //method to test
        await mediaService.addImageAndCacheIt(mediaStationId, contentId, 0, fileExtension, payload, fileName);

        //tests
        expect(mockMediaManager.createImage).toHaveBeenCalledTimes(1);
        expect(mockMediaManager.createImage).toHaveBeenCalledWith(mockMediaStation, contentId, 0, fileName);
    });

    it("should call mediaStationRepository.updateMediaStation", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        //method to test
        await mediaService.addImageAndCacheIt(mediaStationId, contentId, 0, fileExtension, payload, fileName);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should call mediaStationRepository.cacheMedia with the correct arguments", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        //method to test
        await mediaService.addImageAndCacheIt(mediaStationId, contentId, 0, fileExtension, payload, fileName);

        //tests
        expect(mockMediaStationRepo.cacheMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.cacheMedia).toHaveBeenCalledWith(mediaStationId, contentId, 0, fileExtension, payload);
    });

    it("should throw an error if the mediaStationId could not be found", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(mediaService.addImageAndCacheIt(mediaStationId, contentId, 0, fileExtension, payload, fileName)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });

    it("should throw an error if the passed fileExtension is not one of the MediaService.FILE_EXTENSION_IMAGE vars", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        //tests
        await expect(mediaService.addImageAndCacheIt(mediaStationId, contentId, 0, "otherFileExtension", payload, fileName)).rejects.toThrow(new Error("Non-valid file-extension passed: otherFileExtension"));
    });
});

describe("addVideoAndCacheIt() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let video: Video = new Video();
    let fileExtension: string = MediaService.FILE_EXTENSION_VIDEO_MP4;
    let payload: Uint8Array = new Uint8Array([0x00, 0xFF, 0x12, 0xEF]);
    const fileName:string = "testFileName.xy";

    it("should call contentManager.createVideo with the correct arguments", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        //method to test
        await mediaService.addVideoAndCacheIt(mediaStationId, contentId, 0, 199, fileExtension, payload, fileName);

        //tests
        expect(mockMediaManager.createVideo).toHaveBeenCalledTimes(1);
        expect(mockMediaManager.createVideo).toHaveBeenCalledWith(mockMediaStation, contentId, 0, 199, fileName);
    });

    it("should call mediaStationRepository.updateMediaStation", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        //method to test
        await mediaService.addVideoAndCacheIt(mediaStationId, contentId, 0, 199, fileExtension, payload, fileName);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should call mediaStationRepository.cacheMedia with the correct arguments", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        //method to test
        await mediaService.addVideoAndCacheIt(mediaStationId, contentId, 0, 199, fileExtension, payload, fileName);

        //tests
        expect(mockMediaStationRepo.cacheMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.cacheMedia).toHaveBeenCalledWith(mediaStationId, contentId, 0, fileExtension, payload);
    });

    it("should throw an error if the mediaStationId could not be found", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(mediaService.addVideoAndCacheIt(mediaStationId, contentId, 0, 199, fileExtension, payload,fileName)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });

    it("should throw an error if the passed fileExtension is not one of the MediaService.FILE_EXTENSION_VIDEO vars", async() => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        //tests
        await expect(mediaService.addVideoAndCacheIt(mediaStationId, contentId, 0, 150, "otherFileExtension", payload, fileName)).rejects.toThrow(new Error("Non-valid file-extension passed: otherFileExtension"));
    });
});

describe("getFileName() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call contentManager.getFileName with the correct arguments", () => {
        //setup
        let answer: string;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.getFileName.mockReturnValueOnce("fileNameX");

        //method to test
        answer = mediaService.getFileName(mediaStationId, contentId, 0);

        //tests
        expect(answer).toBe("fileNameX");
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => mediaService.getFileName(mediaStationId, contentId, 0)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("getMediaType() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call contentManager.getMediaType with the correct arguments", () => {
        //setup
        let answer: string;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.getMediaType.mockReturnValueOnce(MediaManager.MEDIA_TYPE_IMAGE);

        //method to test
        answer = mediaService.getMediaType(mediaStationId, contentId, 0);

        //tests
        expect(answer).toBe(MediaManager.MEDIA_TYPE_IMAGE);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => mediaService.getMediaType(mediaStationId, contentId, 0)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("deleteMedia() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call mediaManager.deleteMedia with the correct arguments", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await mediaService.deleteMedia(mediaStationId, contentId, 0);

        //tests
        expect(mockMediaManager.deleteMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaManager.deleteMedia).toHaveBeenCalledWith(mockMediaStation, contentId, 0);
    });

    it("should call mediaStationRepository.deleteCachedMedia if mediaStationRepository.isMediaCached is true", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStationRepo.isMediaCached.mockImplementation((msID: number, cID: number, mediaAppId: number) => {
            if (msID === mediaStationId && cID === contentId && mediaAppId === 0)
                return true;
            else
                return false;
        });

        //method to test
        await mediaService.deleteMedia(mediaStationId, contentId, 0);

        //tests
        expect(mockMediaStationRepo.deleteCachedMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.deleteCachedMedia).toHaveBeenCalledWith(mediaStationId, contentId, 0);
    });

    it("should not call mediaStationRepository.deleteCachedMedia if mediaStationRepository.isMediaCached is false", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStationRepo.isMediaCached.mockImplementation((msID: number, cID: number, mediaAppId: number) => {
            if (msID === mediaStationId && cID === contentId && mediaAppId === 0)
                return false;
            else
                return true;
        });

        //method to test
        await mediaService.deleteMedia(mediaStationId, contentId, 0);

        //tests
        expect(mockMediaStationRepo.deleteCachedMedia).toHaveBeenCalledTimes(0);
    });

    it("should call mediaStationRepository.markMediaIDtoDelete if mediaStationRepository.isMediaCached is false", async () => {
        //setup
        const idOnMediaApp: number = 20;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStationRepo.isMediaCached.mockImplementation((msID: number, cID: number, mediaAppId: number) => {
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

        //method to test
        await mediaService.deleteMedia(mediaStationId, contentId, 0);

        //tests
        expect(mockMediaStationRepo.markMediaIDtoDelete).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.markMediaIDtoDelete).toHaveBeenCalledWith(mediaStationId, 0, idOnMediaApp);
    });

    it("should throw an error if the mediaStationId could not be found", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(mediaService.deleteMedia(mediaStationId, contentId, 0)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});