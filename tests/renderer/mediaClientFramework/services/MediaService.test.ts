import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";
import {MockMediaManager} from "../../../__mocks__/renderer/mediaClientFramework/dataManagers/MockMediaManager";
import {Image, Video} from "../../../../src/js/mcf/renderer/dataStructure/Media";
import {MediaService} from "../../../../src/js/mcf/renderer/services/MediaService";
import {MediaManager} from "../../../../src/js/mcf/renderer/dataManagers/MediaManager";

let mediaService:MediaService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockMediaManager:MockMediaManager;

const mediaStationId:number = 0;
const contentId:number = 12;

beforeEach(() => {
    mockMediaStationRepo = new MockMediaStationRepository();
    mockMediaManager = new MockMediaManager();
    mediaService = new MediaService(mockMediaStationRepo, mockMediaManager);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("addImageAndCacheIt() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let image:Image = new Image();
    let fileExtension:string = MediaService.FILE_EXTENSION_IMAGE_JPEG;
    let payload:Uint8Array = new Uint8Array([0x00, 0xFF, 0x12, 0xEF]);

    it("should call contentManager.createImage with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        //method to test
        mediaService.addImageAndCacheIt(mediaStationId,contentId,0, fileExtension, payload);

        //tests
        expect(mockMediaManager.createImage).toHaveBeenCalledTimes(1);
        expect(mockMediaManager.createImage).toHaveBeenCalledWith(mockMediaStation,contentId, 0);
    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        //method to test
        mediaService.addImageAndCacheIt(mediaStationId,contentId,0, fileExtension, payload);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should call mediaStationRepository.cacheMedia with the correct arguments", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        //method to test
        mediaService.addImageAndCacheIt(mediaStationId,contentId,0, fileExtension, payload);

        //tests
        expect(mockMediaStationRepo.cacheMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.cacheMedia).toHaveBeenCalledWith(mediaStationId,contentId,0, fileExtension, payload);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> mediaService.addImageAndCacheIt(mediaStationId,contentId,0, fileExtension, payload)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });

    it("should throw an error if the passed fileExtension is not one of the MediaService.FILE_EXTENSION_IMAGE vars", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        //tests
        expect(()=> mediaService.addImageAndCacheIt(mediaStationId,contentId,0, "otherFileExtension", payload)).toThrow(new Error("Non-valid file-extension passed: otherFileExtension"));
    });
});

describe("addVideoAndCacheIt() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let video:Video = new Video();
    let fileExtension:string = MediaService.FILE_EXTENSION_VIDEO_MP4;
    let payload:Uint8Array = new Uint8Array([0x00, 0xFF, 0x12, 0xEF]);

    it("should call contentManager.createVideo with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        //method to test
        mediaService.addVideoAndCacheIt(mediaStationId,contentId,0, 199, fileExtension, payload);

        //tests
        expect(mockMediaManager.createVideo).toHaveBeenCalledTimes(1);
        expect(mockMediaManager.createVideo).toHaveBeenCalledWith(mockMediaStation,contentId, 0, 199);
    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        //method to test
        mediaService.addVideoAndCacheIt(mediaStationId,contentId,0, 199, fileExtension, payload);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should call mediaStationRepository.cacheMedia with the correct arguments", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        //method to test
        mediaService.addVideoAndCacheIt(mediaStationId,contentId,0, 199, fileExtension, payload);

        //tests
        expect(mockMediaStationRepo.cacheMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.cacheMedia).toHaveBeenCalledWith(mediaStationId,contentId,0, fileExtension, payload);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> mediaService.addVideoAndCacheIt(mediaStationId,contentId,0, 199, fileExtension, payload)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });

    it("should throw an error if the passed fileExtension is not one of the MediaService.FILE_EXTENSION_VIDEO vars", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        //tests
        expect(()=> mediaService.addVideoAndCacheIt(mediaStationId,contentId,0, 150,"otherFileExtension", payload)).toThrow(new Error("Non-valid file-extension passed: otherFileExtension"));
    });
});

describe("getMediaType() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call contentManager.getMediaType with the correct arguments", () => {
        //setup
        let answer:string;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.getMediaType.mockReturnValueOnce(MediaManager.MEDIA_TYPE_IMAGE);

        //method to test
        answer = mediaService.getMediaType(mediaStationId,contentId,0);

        //tests
        expect(answer).toBe(MediaManager.MEDIA_TYPE_IMAGE);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> mediaService.getMediaType(mediaStationId,contentId,0)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});