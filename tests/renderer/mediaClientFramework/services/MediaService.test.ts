import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {ContentService} from "../../../../public_html/js/renderer/mediaClientFramework/services/ContentService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";
import {MockContentManager} from "../../../__mocks__/renderer/mediaClientFramework/dataManagers/MockContentManager";
import {MockContent} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockContent";
import {MediaApp} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaApp";
import {
    MockContentNetworkService
} from "../../../__mocks__/renderer/mediaClientFramework/services/MockContentNetworkService";
import {MockMediaManager} from "../../../__mocks__/renderer/mediaClientFramework/dataManagers/MockMediaManager";
import {Image, Video} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/Media";
import {MediaService} from "../../../../public_html/js/renderer/mediaClientFramework/services/MediaService";
import {MediaManager} from "../../../../public_html/js/renderer/mediaClientFramework/dataManagers/MediaManager";

let mediaService:MediaService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockMediaManager:MockMediaManager;

const mediaStationId:number = 0;
const contentId:number = 12;
let mockContent:MockContent;

beforeEach(() => {
    mockContent = new MockContent(contentId);
    mockMediaStationRepo = new MockMediaStationRepository();
    mockMediaManager = new MockMediaManager();
    mediaService = new MediaService(mockMediaStationRepo, mockMediaManager);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("addImage() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let image:Image = new Image();
    it("should call contentManager.createImage with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        //method to test
        mediaService.addImage(mediaStationId,contentId,0);

        //tests
        expect(mockMediaManager.createImage).toHaveBeenCalledTimes(1);
        expect(mockMediaManager.createImage).toHaveBeenCalledWith(mockMediaStation,contentId, 0);
    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(image);

        //method to test
        mediaService.addImage(mediaStationId,contentId,0);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> mediaService.addImage(mediaStationId,contentId,0)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("addVideo() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let video:Video = new Video();
    it("should call contentManager.createImage with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        //method to test
        mediaService.addVideo(mediaStationId,contentId,0, 199);

        //tests
        expect(mockMediaManager.createVideo).toHaveBeenCalledTimes(1);
        expect(mockMediaManager.createVideo).toHaveBeenCalledWith(mockMediaStation,contentId, 0, 199);
    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaManager.createImage.mockReturnValueOnce(video);

        //method to test
        mediaService.addVideo(mediaStationId,contentId,0, 199);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> mediaService.addVideo(mediaStationId,contentId,0, 199)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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