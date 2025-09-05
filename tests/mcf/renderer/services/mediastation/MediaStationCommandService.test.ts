import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {
    MockMediaStationRepository
} from "__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MockContentManager} from "__mocks__/mcf/renderer/dataManagers/MockContentManager";
import {MockContent} from "__mocks__/mcf/renderer/dataStructure/MockContent";
import {MediaApp} from "@app/mcf/renderer/dataStructure/MediaApp";
import {
    MockContentNetworkService
} from "__mocks__/mcf/renderer/services/MockContentNetworkService";
import {Image, Video} from "@app/mcf/renderer/dataStructure/Media";
import {MediaStationCommandService} from "@app/mcf/renderer/services/mediastation/MediaStationCommandService";

let service:MediaStationCommandService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockContentManager:MockContentManager;
let mockContentNetworkService:MockContentNetworkService;

const mediaStationId:number = 0;
const folderId:number = 10;
const contentId:number = 12;

beforeEach(() => {
    mockMediaStationRepo = new MockMediaStationRepository();
    mockContentManager = new MockContentManager();
    mockContentNetworkService = new MockContentNetworkService();
    service = new MediaStationCommandService(mockMediaStationRepo, mockContentNetworkService, mockContentManager);
});

afterEach(() => {
    jest.clearAllMocks();
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
        await service.sendCommandPlay(mediaStationId,contentId);

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
        await service.sendCommandPlay(mediaStationId,null);

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
        await service.sendCommandPlay(mediaStationId,contentId);

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
        await service.sendCommandPlay(mediaStationId,contentId);

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
        await service.sendCommandPlay(mediaStationId,contentId);

        //tests
        expect(mockContentNetworkService.sendCommandLight).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandLight).toHaveBeenCalledWith(answerMap, 2);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(service.sendCommandPlay(mediaStationId,contentId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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
        await service.sendCommandStop(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenCalledTimes(2);
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenNthCalledWith(1, mediaApp1);
        expect(mockContentNetworkService.sendCommandStop).toHaveBeenNthCalledWith(2, mediaApp2);
    });

    it("should call contentNetworkService.sendCommandLight with correct arguments", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandStop(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandLight).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandLight).toHaveBeenCalledWith(answerMap, 2);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(service.sendCommandStop(mediaStationId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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
        await service.sendCommandPause(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandPause).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandPause).toHaveBeenCalledWith(answerMap);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(service.sendCommandPause(mediaStationId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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
        await service.sendCommandFwd(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandFwd).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandFwd).toHaveBeenCalledWith(answerMap);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(service.sendCommandFwd(mediaStationId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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
        await service.sendCommandRew(mediaStationId);

        //tests
        expect(mockContentNetworkService.sendCommandRew).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandRew).toHaveBeenCalledWith(answerMap);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(service.sendCommandRew(mediaStationId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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
        await service.sendCommandSync(mediaStationId, 34,seekPos);

        //tests
        expect(mockContentNetworkService.sendCommandSync).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandSync).toHaveBeenCalledWith( mediaApp1, seekPos);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(service.sendCommandSync(mediaStationId, 23,  seekPos)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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
        await service.sendCommandSeek(mediaStationId, seekPos);

        //tests
        expect(mockContentNetworkService.sendCommandSeek).toHaveBeenCalledTimes(1);
        expect(mockContentNetworkService.sendCommandSeek).toHaveBeenCalledWith(answerMap,seekPos);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(service.sendCommandSeek(mediaStationId, seekPos)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});