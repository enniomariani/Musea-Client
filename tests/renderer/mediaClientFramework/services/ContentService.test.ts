import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {ContentService} from "../../../../src/js/mcf/renderer/services/ContentService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";
import {MockContentManager} from "../../../__mocks__/renderer/mediaClientFramework/dataManagers/MockContentManager";
import {MockContent} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockContent";
import {MediaApp} from "../../../../src/js/mcf/renderer/dataStructure/MediaApp";
import {
    MockContentNetworkService
} from "../../../__mocks__/renderer/mediaClientFramework/services/MockContentNetworkService";
import {Image} from "../../../../src/js/mcf/renderer/dataStructure/Media";

let contentService:ContentService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockContentManager:MockContentManager;
let mockContentNetworkService:MockContentNetworkService;

const mediaStationId:number = 0;
const folderId:number = 10;
const contentId:number = 12;
let mockContent:MockContent;

beforeEach(() => {
    mockContent = new MockContent(contentId);
    mockMediaStationRepo = new MockMediaStationRepository();
    mockContentManager = new MockContentManager();
    mockContentNetworkService = new MockContentNetworkService();
    contentService = new ContentService(mockMediaStationRepo, mockContentNetworkService, mockContentManager);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createContent() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call contentManager.createContent with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        contentService.createContent(mediaStationId,folderId,"testName");

        //tests
        expect(mockContentManager.createContent).toHaveBeenCalledTimes(1);
        expect(mockContentManager.createContent).toHaveBeenCalledWith(mockMediaStation, "testName", folderId);
    });

    it("should return the ID of the created content", () => {
        //setup
        let returnValue:number;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        returnValue = contentService.createContent(mediaStationId,folderId,"testName");

        //tests
        expect(returnValue).toBe(contentId);

    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        contentService.createContent(mediaStationId,folderId,"testName")

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.createContent(mediaStationId,folderId,"testName")).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("changeName() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let newName:string = "newName";

    it("should call contentManager.changeName with the correct arguments", () => {
        //setup
        mockContent.name = "firstName";
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        contentService.changeName(mediaStationId,folderId,newName);

        //tests
        expect(mockContentManager.changeName).toHaveBeenCalledTimes(1);
        expect(mockContentManager.changeName).toHaveBeenCalledWith(mockMediaStation, folderId, newName);
    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        contentService.changeName(mediaStationId,folderId,newName);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.changeName(mediaStationId,folderId,newName)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("sendCommandPlay() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    let mediaApp1:MediaApp = new MediaApp(0);
    let mediaApp2:MediaApp = new MediaApp(1);
    let image1:Image = new Image();
    image1.idOnMediaApp = -1;
    image1.mediaAppId = 0;

    let image2:Image = new Image();
    image2.idOnMediaApp = 20;
    image2.mediaAppId = 1;

    let mockContent:MockContent = new MockContent(0);
    mockContent.media.set(0,image1)
    mockContent.media.set(1, image2)

    answerMap.set(0, mediaApp1);
    answerMap.set(1, mediaApp2);
    mockMediaStation.getAllMediaApps.mockReturnValue(answerMap);

    mockMediaStation.getMediaApp.mockImplementation((id) =>{
        if(id === 0)
            return mediaApp1;
        else if(id === 1)
            return mediaApp2;
    })

    const contentId:number = 22;

    it("should call contentNetworkService.sendCommandPlay for all media with an id not -1", () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        contentService.sendCommandPlay(mediaStationId,contentId);

        //tests
        expect(mockContentNetworkService.sendCommandPlay).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandPlay).toHaveBeenCalledWith(mediaApp2, image2.idOnMediaApp);
    });

    it("should call contentNetworkService.sendCommandStop for all media with an id EQUAL -1", () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        contentService.sendCommandPlay(mediaStationId,contentId);

        //tests
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenCalledWith(mediaApp1);
    });

    it("should call contentNetworkService.sendCommandStop for all mediaApps where no media was defined", () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContent.media.set(1, null)

        //method to test
        contentService.sendCommandPlay(mediaStationId,contentId);

        //tests
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenCalledTimes(2);
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenCalledWith(mediaApp1);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.sendCommandPlay(mediaStationId,contentId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("sendCommandStop() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    let mediaApp1:MediaApp = new MediaApp(0);
    let mediaApp2:MediaApp = new MediaApp(1);
    answerMap.set(0, mediaApp1);
    answerMap.set(1, mediaApp2);
    mockMediaStation.getAllMediaApps.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandStop for every mediaApp defined in the mocked mediastation", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        contentService.sendCommandStop(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenCalledTimes(2);
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenNthCalledWith(1, mediaApp1);
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenNthCalledWith(2, mediaApp2);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.sendCommandStop(mediaStationId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("sendCommandPause() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, new MediaApp(0));
    answerMap.set(1, new MediaApp(1));
    mockMediaStation.getAllMediaApps.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandPause with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        contentService.sendCommandPause(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandPause).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandPause).toHaveBeenCalledWith(answerMap);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.sendCommandPause(mediaStationId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("sendCommandSeek() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, new MediaApp(0));
    answerMap.set(1, new MediaApp(1));
    mockMediaStation.getAllMediaApps.mockReturnValue(answerMap);
    const seekPos:number = 200;

    it("should call contentNetworkService.sendCommandSeek with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        contentService.sendCommandSeek(mediaStationId, seekPos);

        //tests
        expect(mockContentNetworkService.sendCommandSeek).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandSeek).toHaveBeenCalledWith(answerMap,seekPos);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.sendCommandSeek(mediaStationId, seekPos)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});