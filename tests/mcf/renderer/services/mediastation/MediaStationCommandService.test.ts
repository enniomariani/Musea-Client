import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    MockMediaStationRepository
} from "__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MockContentManager} from "__mocks__/mcf/renderer/dataManagers/MockContentManager";
import {MockContent} from "__mocks__/mcf/renderer/dataStructure/MockContent";
import {MediaApp} from "@app/mcf/renderer/dataStructure/MediaApp";
import {
    MockMediaAppCommandService
} from "__mocks__/mcf/renderer/network/MockMediaAppCommandService";
import {Image, Video} from "@app/mcf/renderer/dataStructure/Media";
import {MediaStationCommandService} from "@app/mcf/renderer/services/mediastation/MediaStationCommandService";
import {MockNetworkService} from "__mocks__/mcf/renderer/network/MockNetworkService";

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
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandPlay(mediaStationId,contentId);

        //tests
        expect(mockMediaAppCommandService.sendCommandPlay).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandPlay).toHaveBeenCalledWith(mediaApp2, image2.idOnMediaApp);
    });

    it("should call contentNetworkService.sendCommandPlay with null if no contentId was passed", async () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(null);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandPlay(mediaStationId,null);

        //tests
        expect(mockMediaAppCommandService.sendCommandPlay).toHaveBeenCalledTimes(2);
        expect(mockMediaAppCommandService.sendCommandPlay).toHaveBeenNthCalledWith(1, mediaApp1, null);
        expect(mockMediaAppCommandService.sendCommandPlay).toHaveBeenNthCalledWith(2, mediaApp2, null);
    });

    it("should call contentNetworkService.sendCommandStop for all media with an id EQUAL -1", async () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandPlay(mediaStationId,contentId);

        //tests
        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenCalledWith(mediaApp1);
    });

    it("should call contentNetworkService.sendCommandStop for all mediaApps where no media was defined", async () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContent.media.set(1, null)

        //method to test
        await service.sendCommandPlay(mediaStationId,contentId);

        //tests
        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenCalledTimes(2);
        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenCalledWith(mediaApp1);
    });

    it("should call contentNetworkService.sendCommandLight with correct arguments", async () => {
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandPlay(mediaStationId,contentId);

        //tests
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
        //setup
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandStop(mediaStationId);

        //tests
        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenCalledTimes(2);
        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenNthCalledWith(1, mediaApp1);
        expect(mockMediaAppCommandService.sendCommandStop).toHaveBeenNthCalledWith(2, mediaApp2);
    });

    it("should call contentNetworkService.sendCommandLight with correct arguments", async () => {
        //setup
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandStop(mediaStationId);

        //tests
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
        //setup
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandPause(mediaStationId);

        //tests
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
        //setup
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandFwd(mediaStationId);

        //tests
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
        //setup
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandRew(mediaStationId);

        //tests
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
        //setup
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandSync(mediaStationId, 34,seekPos);

        //tests
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
        //setup
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await service.sendCommandSeek(mediaStationId, seekPos);

        //tests
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
        //setup
        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);

        //method to test
        await service.sendCommandSetVolume(0, 0.3);

        //tests
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
        //setup
        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);

        //method to test
        await service.sendCommandMute(0);

        //tests
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
        //setup
        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);

        //method to test
        await service.sendCommandUnmute(0);

        //tests
        expect(mockMediaAppCommandService.sendCommandUnmute).toHaveBeenCalledTimes(1);
        expect(mockMediaAppCommandService.sendCommandUnmute).toHaveBeenNthCalledWith(1, mediaAppMap);
    });
});