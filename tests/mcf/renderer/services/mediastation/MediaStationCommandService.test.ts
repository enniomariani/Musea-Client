import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    MockMediaStationRepository
} from "mocks/renderer/dataStructure/MockMediaStationRepository.js";
import {MockMediaStation} from "mocks/renderer/dataStructure/MockMediaStation.js";
import {MockContentManager} from "mocks/renderer/dataManagers/MockContentManager.js";
import {MockContent} from "mocks/renderer/dataStructure/MockContent.js";
import {MediaApp} from "renderer/dataStructure/MediaApp.js";
import {
    MockMediaAppCommandService
} from "mocks/renderer/network/MockMediaAppCommandService.js";
import {Image, Video} from "renderer/dataStructure/Media.js";
import {MediaStationCommandService} from "renderer/services/mediastation/MediaStationCommandService.js";
import {MockNetworkService} from "mocks/renderer/network/MockNetworkService.js";

let service:MediaStationCommandService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockNetworkService:MockNetworkService;
let mockContentManager:MockContentManager;
let mockMediaAppCommandService:MockMediaAppCommandService;

const mediaStationId:number = 0;
const folderId:number = 10;

beforeEach(() => {
    mockMediaStationRepo = new MockMediaStationRepository();
    mockNetworkService = new MockNetworkService();
    mockContentManager = new MockContentManager();
    mockMediaAppCommandService = new MockMediaAppCommandService();
    service = new MediaStationCommandService(mockMediaStationRepo,mockNetworkService, mockMediaAppCommandService, mockContentManager);
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
    mockMediaStation.mediaAppRegistry.getAll.mockReturnValue(answerMap);

    mockMediaStation.mediaAppRegistry.get.mockImplementation((id) =>{
        if(id === 0)
            return mediaApp1;
        else if(id === 1)
            return mediaApp2;
    })

    const contentId:number = 22;

    it("should call contentNetworkService.sendCommandPlay for all media with an id not -1", async () => {
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandPlay(mediaStationId,contentId);

        expect(mockMediaAppCommandService.sendCommandPlay).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandPlay).toHaveBeenCalledWith(mediaApp2, image2.idOnMediaApp);
    });

    it("should call contentNetworkService.sendCommandPlay with null if no contentId was passed", async () => {
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(null);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandPlay(mediaStationId,null);

        expect(mockMediaAppCommandService.sendCommandPlay).toHaveBeenCalledTimes(2);
        expect(mockMediaAppCommandService.sendCommandPlay).toHaveBeenNthCalledWith(1, mediaApp1, null);
        expect(mockMediaAppCommandService.sendCommandPlay).toHaveBeenNthCalledWith(2, mediaApp2, null);
    });

    it("should call contentNetworkService.sendCommandStop for all media with an id EQUAL -1", async () => {
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandPlay(mediaStationId,contentId);

        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenCalledWith(mediaApp1);
    });

    it("should call contentNetworkService.sendCommandStop for all mediaApps where no media was defined", async () => {
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContent.media.delete(1);

        await service.sendCommandPlay(mediaStationId,contentId);

        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenCalledTimes(2);
        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenCalledWith(mediaApp1);
    });

    it("should call contentNetworkService.sendCommandLight with correct arguments", async () => {
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandPlay(mediaStationId,contentId);

        expect(mockMediaAppCommandService.sendCommandLight).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandLight).toHaveBeenCalledWith(answerMap, 2);
    });
});

describe("sendCommandStop() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    let mediaApp1:MediaApp = new MediaApp(0);
    let mediaApp2:MediaApp = new MediaApp(1);
    answerMap.set(0, mediaApp1);
    answerMap.set(1, mediaApp2);
    mockMediaStation.mediaAppRegistry.getAll.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandStop for every mediaApp defined in the mocked mediastation", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandStop(mediaStationId);

        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenCalledTimes(2);
        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenNthCalledWith(1, mediaApp1);
        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenNthCalledWith(2, mediaApp2);
    });

    it("should call contentNetworkService.sendCommandLight with correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandStop(mediaStationId);

        expect(mockMediaAppCommandService.sendCommandLight).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandLight).toHaveBeenCalledWith(answerMap, 2);
    });
});

describe("sendCommandPause() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, new MediaApp(0));
    answerMap.set(1, new MediaApp(1));
    mockMediaStation.mediaAppRegistry.getAll.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandPause with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandPause(mediaStationId);

        expect(mockMediaAppCommandService.sendCommandPause).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandPause).toHaveBeenCalledWith(answerMap);
    });
});

describe("sendCommandFwd() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, new MediaApp(0));
    answerMap.set(1, new MediaApp(1));
    mockMediaStation.mediaAppRegistry.getAll.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandFwd with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandFwd(mediaStationId);

        expect(mockMediaAppCommandService.sendCommandFwd).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandFwd).toHaveBeenCalledWith(answerMap);
    });
});

describe("sendCommandRew() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, new MediaApp(0));
    answerMap.set(1, new MediaApp(1));
    mockMediaStation.mediaAppRegistry.getAll.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandRew with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandRew(mediaStationId);

        expect(mockMediaAppCommandService.sendCommandRew).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandRew).toHaveBeenCalledWith(answerMap);
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
    mockMediaStation.mediaAppRegistry.getAll.mockReturnValue(answerMap);

    mockMediaStation.mediaAppRegistry.get.mockImplementation((id) =>{
        if(id === 0)
            return mediaApp1;
        else if(id === 1)
            return mediaApp2;
    })

    const seekPos:number = 200;

    it("should call contentNetworkService.sendCommandSync for every mediaApp defined in the mocked mediastation", async () => {
        mockContentManager.requireContent = jest.fn();
        mockContentManager.requireContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandSync(mediaStationId, 34,seekPos);

        expect(mockMediaAppCommandService.sendCommandSync).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandSync).toHaveBeenCalledWith( mediaApp1, seekPos);
    });
});

describe("sendCommandSeek() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, new MediaApp(0));
    answerMap.set(1, new MediaApp(1));
    mockMediaStation.mediaAppRegistry.getAll.mockReturnValue(answerMap);
    const seekPos:number = 200;

    it("should call contentNetworkService.sendCommandSeek with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandSeek(mediaStationId, seekPos);

        expect(mockMediaAppCommandService.sendCommandSeek).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandSeek).toHaveBeenCalledWith(answerMap,seekPos);
    });
});

describe("sendCommandSetVolume() ", () => {
    let mediaApp1: MediaApp = new MediaApp(0);
    mediaApp1.ip = "127.0.0.1"
    let mediaApp2: MediaApp = new MediaApp(1);
    mediaApp2.ip = "127.0.0.2"
    let mediaAppMap: Map<number, MediaApp> = new Map();
    mediaAppMap.set(0, mediaApp1);
    mediaAppMap.set(1, mediaApp2);

    let mockMediaStation: MockMediaStation = new MockMediaStation(0);
    mockMediaStation.mediaAppRegistry.getAll.mockReturnValue(mediaAppMap);

    it("should call sendCommandSetVolume for the mediaApp with the correct parameter", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);

        await service.sendCommandSetVolume(0, 0.3);

        expect(mockMediaAppCommandService.sendCommandSetVolume).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandSetVolume).toHaveBeenNthCalledWith(1, mediaAppMap, 0.3);
    });
});

describe("sendCommandMute() ", () => {
    let mediaApp1: MediaApp = new MediaApp(0);
    mediaApp1.ip = "127.0.0.1"
    let mediaApp2: MediaApp = new MediaApp(1);
    mediaApp2.ip = "127.0.0.2"
    let mediaAppMap: Map<number, MediaApp> = new Map();
    mediaAppMap.set(0, mediaApp1);
    mediaAppMap.set(1, mediaApp2);

    let mockMediaStation: MockMediaStation = new MockMediaStation(0);
    mockMediaStation.mediaAppRegistry.getAll.mockReturnValue(mediaAppMap);

    it("should call sendCommandMute for the mediaApp with the correct parameter", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);

        await service.sendCommandMute(0);

        expect(mockMediaAppCommandService.sendCommandMute).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandMute).toHaveBeenNthCalledWith(1, mediaAppMap);
    });
});
describe("sendCommandUnmute() ", () => {
    let mediaApp1: MediaApp = new MediaApp(0);
    mediaApp1.ip = "127.0.0.1"
    let mediaApp2: MediaApp = new MediaApp(1);
    mediaApp2.ip = "127.0.0.2"
    let mediaAppMap: Map<number, MediaApp> = new Map();
    mediaAppMap.set(0, mediaApp1);
    mediaAppMap.set(1, mediaApp2);

    let mockMediaStation: MockMediaStation = new MockMediaStation(0);
    mockMediaStation.mediaAppRegistry.getAll.mockReturnValue(mediaAppMap);

    it("should call sendCommandUnmute for the mediaApp with the correct parameter", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);

        await service.sendCommandUnmute(0);

        expect(mockMediaAppCommandService.sendCommandUnmute).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandUnmute).toHaveBeenNthCalledWith(1, mediaAppMap);
    });
});