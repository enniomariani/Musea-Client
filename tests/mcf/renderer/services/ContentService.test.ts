import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {ContentService} from "../../../../src/js/mcf/renderer/services/ContentService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MockContentManager} from "../../../__mocks__/mcf/renderer/dataManagers/MockContentManager";
import {MockContent} from "../../../__mocks__/mcf/renderer/dataStructure/MockContent";
import {MediaApp} from "../../../../src/js/mcf/renderer/dataStructure/MediaApp";
import {
    MockContentNetworkService
} from "../../../__mocks__/mcf/renderer/services/MockContentNetworkService";
import {Image, Video} from "../../../../src/js/mcf/renderer/dataStructure/Media";
import {MockMediaService} from "../../../__mocks__/mcf/renderer/services/MockMediaService";

let contentService:ContentService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockContentManager:MockContentManager;
let mockContentNetworkService:MockContentNetworkService;
let mockMediaService:MockMediaService;

const mediaStationId:number = 0;
const folderId:number = 10;
const contentId:number = 12;
let mockContent:MockContent;

beforeEach(() => {
    mockContent = new MockContent(contentId, folderId);
    mockMediaStationRepo = new MockMediaStationRepository();
    mockContentManager = new MockContentManager();
    mockContentNetworkService = new MockContentNetworkService();
    mockMediaService = new MockMediaService();
    contentService = new ContentService(mockMediaStationRepo, mockContentNetworkService, mockMediaService, mockContentManager);
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

describe("getLightIntensity() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the lightIntensity of the content", () => {
        //setup
        mockContent.lightIntensity = 33;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockImplementation(( mediaStation, id)=>{
            if(mediaStation === mockMediaStation && id === contentId)
                return mockContent;
        });

        //method to test
        let answer:number = contentService.getLightIntensity(mediaStationId,contentId);

        //tests
        expect(answer).toEqual(mockContent.lightIntensity);
    });

    it("should throw an error if the contentId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockReturnValue(null);

        //tests
        expect(()=> contentService.getLightIntensity(mediaStationId,contentId)).toThrow(new Error("Content with this ID does not exist: " + contentId));
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.getLightIntensity(mediaStationId,contentId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("getFolderId() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the folderId of the content", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockImplementation(( mediaStation, id)=>{
            if(mediaStation === mockMediaStation && id === contentId)
                return mockContent;
        });

        //method to test
        let answer:number = contentService.getFolderId(mediaStationId,contentId);

        //tests
        expect(answer).toEqual(folderId);
    });

    it("should throw an error if the contentId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockReturnValue(null);

        //tests
        expect(()=> contentService.getFolderId(mediaStationId,contentId)).toThrow(new Error("Content with this ID does not exist: " + contentId));
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.getFolderId(mediaStationId,contentId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("getDuration() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the lightIntensity of the content", () => {
        //setup
        mockContent.getMaxDuration.mockReturnValue( 221);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockImplementation(( mediaStation, id)=>{
            if(mediaStation === mockMediaStation && id === contentId)
                return mockContent;
        });

        //method to test
        let answer:number = contentService.getMaxDuration(mediaStationId,contentId);

        //tests
        expect(answer).toEqual(221);
    });

    it("should throw an error if the contentId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockReturnValue(null);

        //tests
        expect(()=> contentService.getMaxDuration(mediaStationId,contentId)).toThrow(new Error("Content with this ID does not exist: " + contentId));
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.getMaxDuration(mediaStationId,contentId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("changeLightIntensity() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let newIntensity:number = 33;

    it("should call contentManager.changeLightIntensity with the correct arguments", () => {
        //setup
        mockContent.lightIntensity = 0;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        contentService.changeLightIntensity(mediaStationId,contentId,newIntensity);

        //tests
        expect(mockContentManager.changeLightIntensity).toHaveBeenCalledTimes(1);
        expect(mockContentManager.changeLightIntensity).toHaveBeenCalledWith(mockMediaStation, contentId, newIntensity);
    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        contentService.changeLightIntensity(mediaStationId,contentId,newIntensity);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.changeLightIntensity(mediaStationId,contentId,newIntensity)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("deleteContent() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    const allMediaApps:Map<number, MediaApp> = new Map();
    allMediaApps.set(0, new MediaApp(0));
    allMediaApps.set(1, new MediaApp(1));
    mockMediaStation.getAllMediaApps.mockReturnValue(allMediaApps);

    it("should call contentManager.deleteContent with the correct arguments", async () => {
        //setup
        mockMediaService.getMediaType.mockReturnValue("image");
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.deleteContent(mediaStationId,folderId, contentId);

        //tests
        expect(mockContentManager.deleteContent).toHaveBeenCalledTimes(1);
        expect(mockContentManager.deleteContent).toHaveBeenCalledWith(mockMediaStation, folderId, contentId);
    });

    it("should call mediaService.deleteMedia for each mediaApp defined with the correct arguments", async () => {
        //setup
        mockMediaService.getMediaType.mockReturnValue("image");
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.deleteContent(mediaStationId,folderId, contentId);

        //tests
        expect(mockMediaService.deleteMedia).toHaveBeenCalledTimes(2);
        expect(mockMediaService.deleteMedia).toHaveBeenNthCalledWith(1, mediaStationId, contentId, 0);
        expect(mockMediaService.deleteMedia).toHaveBeenNthCalledWith(2, mediaStationId, contentId, 1);
    });

    it("should NOT call mediaService.deleteMedia if mediaService.getMediaType returns null for all media-Apps", async ()=>{
        //setup
        mockMediaService.getMediaType.mockReturnValue(null);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.deleteContent(mediaStationId,folderId, contentId);

        //tests
        expect(mockMediaService.deleteMedia).toHaveBeenCalledTimes(0);
    });

    it("should call mediaStationRepository.updateMediaStation", async ()=>{
        //setup
        mockMediaService.getMediaType.mockReturnValue("image");
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        await contentService.deleteContent(mediaStationId,folderId, contentId);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaService.getMediaType.mockReturnValue("image");
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(contentService.deleteContent(mediaStationId,folderId, contentId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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

    let mockContent:MockContent = new MockContent(0, folderId);
    mockContent.media.set(0,image1);
    mockContent.media.set(1, image2);
    mockContent.lightIntensity = 2;

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

    it("should call contentNetworkService.sendCommandPlay for all media with an id not -1", async () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.sendCommandPlay(mediaStationId,contentId);

        //tests
        expect(mockContentNetworkService.sendCommandPlay).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandPlay).toHaveBeenCalledWith(mediaApp2, image2.idOnMediaApp);
    });

    it("should call contentNetworkService.sendCommandPlay with null if no contentId was passed", async () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(null);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.sendCommandPlay(mediaStationId,null);

        //tests
        expect(mockContentNetworkService.sendCommandPlay).toHaveBeenCalledTimes(2);
        expect(mockContentNetworkService.sendCommandPlay).toHaveBeenNthCalledWith(1, mediaApp1, null);
        expect(mockContentNetworkService.sendCommandPlay).toHaveBeenNthCalledWith(2, mediaApp2, null);
    });

    it("should call contentNetworkService.sendCommandStop for all media with an id EQUAL -1", async () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.sendCommandPlay(mediaStationId,contentId);

        //tests
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenCalledWith(mediaApp1);
    });

    it("should call contentNetworkService.sendCommandStop for all mediaApps where no media was defined", async () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContent.media.set(1, null)

        //method to test
        await contentService.sendCommandPlay(mediaStationId,contentId);

        //tests
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenCalledTimes(2);
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenCalledWith(mediaApp1);
    });

    it("should call contentNetworkService.sendCommandLight with correct arguments", async () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.sendCommandPlay(mediaStationId,contentId);

        //tests
        expect(mockContentNetworkService.sendCommandLight).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandLight).toHaveBeenCalledWith(answerMap, 2);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(contentService.sendCommandPlay(mediaStationId,contentId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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

    it("should call contentNetworkService.sendCommandStop for every mediaApp defined in the mocked mediastation", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.sendCommandStop(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenCalledTimes(2);
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenNthCalledWith(1, mediaApp1);
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenNthCalledWith(2, mediaApp2);
    });

    it("should call contentNetworkService.sendCommandLight with correct arguments", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.sendCommandStop(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandLight).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandLight).toHaveBeenCalledWith(answerMap, 2);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(contentService.sendCommandStop(mediaStationId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("sendCommandPause() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, new MediaApp(0));
    answerMap.set(1, new MediaApp(1));
    mockMediaStation.getAllMediaApps.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandPause with the correct arguments", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.sendCommandPause(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandPause).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandPause).toHaveBeenCalledWith(answerMap);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(contentService.sendCommandPause(mediaStationId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("sendCommandFwd() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, new MediaApp(0));
    answerMap.set(1, new MediaApp(1));
    mockMediaStation.getAllMediaApps.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandFwd with the correct arguments", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.sendCommandFwd(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandFwd).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandFwd).toHaveBeenCalledWith(answerMap);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(contentService.sendCommandFwd(mediaStationId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("sendCommandRew() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, new MediaApp(0));
    answerMap.set(1, new MediaApp(1));
    mockMediaStation.getAllMediaApps.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandRew with the correct arguments", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.sendCommandRew(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandRew).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandRew).toHaveBeenCalledWith(answerMap);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(contentService.sendCommandRew(mediaStationId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("sendCommandSync() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    let mediaApp1:MediaApp = new MediaApp(0);
    let mediaApp2:MediaApp = new MediaApp(1);
    let video1:Video = new Video();
    video1.idOnMediaApp = -1;
    video1.mediaAppId = 0;

    let image2:Image = new Image();
    image2.idOnMediaApp = 20;
    image2.mediaAppId = 1;

    let mockContent:MockContent = new MockContent(0, folderId);
    mockContent.media.set(0,video1);
    mockContent.media.set(1, image2);
    mockContent.lightIntensity = 2;

    answerMap.set(0, mediaApp1);
    answerMap.set(1, mediaApp2);
    mockMediaStation.getAllMediaApps.mockReturnValue(answerMap);

    mockMediaStation.getMediaApp.mockImplementation((id) =>{
        if(id === 0)
            return mediaApp1;
        else if(id === 1)
            return mediaApp2;
    })

    const seekPos:number = 200;

    it("should call contentNetworkService.sendCommandSync for every mediaApp defined in the mocked mediastation", async () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.sendCommandSync(mediaStationId, seekPos);

        //tests
        expect(mockContentNetworkService.sendCommandSync).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandSync).toHaveBeenCalledWith( mediaApp1, seekPos);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(contentService.sendCommandSync(mediaStationId, seekPos)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("sendCommandSeek() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, new MediaApp(0));
    answerMap.set(1, new MediaApp(1));
    mockMediaStation.getAllMediaApps.mockReturnValue(answerMap);
    const seekPos:number = 200;

    it("should call contentNetworkService.sendCommandSeek with the correct arguments", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.sendCommandSeek(mediaStationId, seekPos);

        //tests
        expect(mockContentNetworkService.sendCommandSeek).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandSeek).toHaveBeenCalledWith(answerMap,seekPos);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(contentService.sendCommandSeek(mediaStationId, seekPos)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});