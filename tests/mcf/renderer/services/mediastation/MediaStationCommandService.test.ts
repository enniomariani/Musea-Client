import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    MockMediaStationRepository
} from "mocks/renderer/dataStructure/MockMediaStationRepository.js";
import {MockMediaStation} from "mocks/renderer/dataStructure/MockMediaStation.js";
import {MockContentManager} from "mocks/renderer/dataManagers/MockContentManager.js";
import {MockContent} from "mocks/renderer/dataStructure/MockContent.js";
import {MediaPlayer} from "renderer/dataStructure/MediaPlayer.js";
import {
    MockMediaPlayerCommandService
} from "mocks/renderer/network/MockMediaPlayerCommandService.js";
import {Image, Video} from "renderer/dataStructure/Media.js";
import {MediaStationCommandService} from "renderer/services/mediastation/MediaStationCommandService.js";
import {MockNetworkService} from "mocks/renderer/network/MockNetworkService.js";

let service:MediaStationCommandService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockNetworkService:MockNetworkService;
let mockContentManager:MockContentManager;
let mockMediaPlayerCommandService:MockMediaPlayerCommandService;

const mediaStationId:number = 0;
const folderId:number = 10;

beforeEach(() => {
    mockMediaStationRepo = new MockMediaStationRepository();
    mockNetworkService = new MockNetworkService();
    mockContentManager = new MockContentManager();
    mockMediaPlayerCommandService = new MockMediaPlayerCommandService();
    service = new MediaStationCommandService(mockMediaStationRepo,mockNetworkService, mockMediaPlayerCommandService, mockContentManager);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("sendCommandPlay() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaPlayer> = new Map();
    let mediaPlayer1:MediaPlayer = new MediaPlayer(0);
    let mediaPlayer2:MediaPlayer = new MediaPlayer(1);
    let image1:Image = new Image();
    image1.idOnMediaPlayer = -1;
    image1.mediaPlayerId = 0;

    let image2:Image = new Image();
    image2.idOnMediaPlayer = 20;
    image2.mediaPlayerId = 1;

    let mockContent:MockContent = new MockContent(0, folderId);
    mockContent.media.set(0,image1);
    mockContent.media.set(1, image2);
    mockContent.lightIntensity = 2;

    answerMap.set(0, mediaPlayer1);
    answerMap.set(1, mediaPlayer2);
    mockMediaStation.mediaPlayerRegistry.getAll.mockReturnValue(answerMap);

    mockMediaStation.mediaPlayerRegistry.get.mockImplementation((id) =>{
        if(id === 0)
            return mediaPlayer1;
        else if(id === 1)
            return mediaPlayer2;
    })

    const contentId:number = 22;

    it("should call contentNetworkService.sendCommandPlay for all media with an id not -1", async () => {
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandPlay(mediaStationId,contentId);

        expect(mockMediaPlayerCommandService.sendCommandPlay).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandPlay).toHaveBeenCalledWith(mediaPlayer2, image2.idOnMediaPlayer);
    });

    it("should call contentNetworkService.sendCommandPlay with null if no contentId was passed", async () => {
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(null);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandPlay(mediaStationId,null);

        expect(mockMediaPlayerCommandService.sendCommandPlay).toHaveBeenCalledTimes(2);
        expect(mockMediaPlayerCommandService.sendCommandPlay).toHaveBeenNthCalledWith(1, mediaPlayer1, null);
        expect(mockMediaPlayerCommandService.sendCommandPlay).toHaveBeenNthCalledWith(2, mediaPlayer2, null);
    });

    it("should call contentNetworkService.sendCommandStop for all media with an id EQUAL -1", async () => {
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandPlay(mediaStationId,contentId);

        expect(mockMediaPlayerCommandService.sendCommandStop).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandStop).toHaveBeenCalledWith(mediaPlayer1);
    });

    it("should call contentNetworkService.sendCommandStop for all mediaPlayers where no media was defined", async () => {
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContent.media.delete(1);

        await service.sendCommandPlay(mediaStationId,contentId);

        expect(mockMediaPlayerCommandService.sendCommandStop).toHaveBeenCalledTimes(2);
        expect(mockMediaPlayerCommandService.sendCommandStop).toHaveBeenCalledWith(mediaPlayer1);
    });

    it("should call contentNetworkService.sendCommandLight with correct arguments", async () => {
        mockContentManager.getContent = jest.fn();
        mockContentManager.getContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandPlay(mediaStationId,contentId);

        expect(mockMediaPlayerCommandService.sendCommandLight).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandLight).toHaveBeenCalledWith(answerMap, 2);
    });
});

describe("sendCommandStop() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaPlayer> = new Map();
    let mediaPlayer1:MediaPlayer = new MediaPlayer(0);
    let mediaPlayer2:MediaPlayer = new MediaPlayer(1);
    answerMap.set(0, mediaPlayer1);
    answerMap.set(1, mediaPlayer2);
    mockMediaStation.mediaPlayerRegistry.getAll.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandStop for every mediaPlayer defined in the mocked mediastation", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandStop(mediaStationId);

        expect(mockMediaPlayerCommandService.sendCommandStop).toHaveBeenCalledTimes(2);
        expect(mockMediaPlayerCommandService.sendCommandStop).toHaveBeenNthCalledWith(1, mediaPlayer1);
        expect(mockMediaPlayerCommandService.sendCommandStop).toHaveBeenNthCalledWith(2, mediaPlayer2);
    });

    it("should call contentNetworkService.sendCommandLight with correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandStop(mediaStationId);

        expect(mockMediaPlayerCommandService.sendCommandLight).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandLight).toHaveBeenCalledWith(answerMap, 2);
    });
});

describe("sendCommandPause() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaPlayer> = new Map();
    answerMap.set(0, new MediaPlayer(0));
    answerMap.set(1, new MediaPlayer(1));
    mockMediaStation.mediaPlayerRegistry.getAll.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandPause with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandPause(mediaStationId);

        expect(mockMediaPlayerCommandService.sendCommandPause).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandPause).toHaveBeenCalledWith(answerMap);
    });
});

describe("sendCommandFwd() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaPlayer> = new Map();
    answerMap.set(0, new MediaPlayer(0));
    answerMap.set(1, new MediaPlayer(1));
    mockMediaStation.mediaPlayerRegistry.getAll.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandFwd with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandFwd(mediaStationId);

        expect(mockMediaPlayerCommandService.sendCommandFwd).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandFwd).toHaveBeenCalledWith(answerMap);
    });
});

describe("sendCommandRew() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaPlayer> = new Map();
    answerMap.set(0, new MediaPlayer(0));
    answerMap.set(1, new MediaPlayer(1));
    mockMediaStation.mediaPlayerRegistry.getAll.mockReturnValue(answerMap);

    it("should call contentNetworkService.sendCommandRew with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandRew(mediaStationId);

        expect(mockMediaPlayerCommandService.sendCommandRew).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandRew).toHaveBeenCalledWith(answerMap);
    });
});

describe("sendCommandSync() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaPlayer> = new Map();
    let mediaPlayer1:MediaPlayer = new MediaPlayer(0);
    let mediaPlayer2:MediaPlayer = new MediaPlayer(1);
    let video1:Video = new Video();
    video1.idOnMediaPlayer = -1;
    video1.mediaPlayerId = 0;

    let image2:Image = new Image();
    image2.idOnMediaPlayer = 20;
    image2.mediaPlayerId = 1;

    let mockContent:MockContent = new MockContent(0, folderId);
    mockContent.media.set(0,video1);
    mockContent.media.set(1, image2);
    mockContent.lightIntensity = 2;

    answerMap.set(0, mediaPlayer1);
    answerMap.set(1, mediaPlayer2);
    mockMediaStation.mediaPlayerRegistry.getAll.mockReturnValue(answerMap);

    mockMediaStation.mediaPlayerRegistry.get.mockImplementation((id) =>{
        if(id === 0)
            return mediaPlayer1;
        else if(id === 1)
            return mediaPlayer2;
    })

    const seekPos:number = 200;

    it("should call contentNetworkService.sendCommandSync for every mediaPlayer defined in the mocked mediastation", async () => {
        mockContentManager.requireContent = jest.fn();
        mockContentManager.requireContent.mockReturnValue(mockContent);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandSync(mediaStationId, 34,seekPos);

        expect(mockMediaPlayerCommandService.sendCommandSync).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandSync).toHaveBeenCalledWith( mediaPlayer1, seekPos);
    });
});

describe("sendCommandSeek() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let answerMap:Map<number, MediaPlayer> = new Map();
    answerMap.set(0, new MediaPlayer(0));
    answerMap.set(1, new MediaPlayer(1));
    mockMediaStation.mediaPlayerRegistry.getAll.mockReturnValue(answerMap);
    const seekPos:number = 200;

    it("should call contentNetworkService.sendCommandSeek with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await service.sendCommandSeek(mediaStationId, seekPos);

        expect(mockMediaPlayerCommandService.sendCommandSeek).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandSeek).toHaveBeenCalledWith(answerMap,seekPos);
    });
});

describe("sendCommandSetVolume() ", () => {
    let mediaPlayer1: MediaPlayer = new MediaPlayer(0);
    mediaPlayer1.ip = "127.0.0.1"
    let mediaPlayer2: MediaPlayer = new MediaPlayer(1);
    mediaPlayer2.ip = "127.0.0.2"
    let mediaPlayerMap: Map<number, MediaPlayer> = new Map();
    mediaPlayerMap.set(0, mediaPlayer1);
    mediaPlayerMap.set(1, mediaPlayer2);

    let mockMediaStation: MockMediaStation = new MockMediaStation(0);
    mockMediaStation.mediaPlayerRegistry.getAll.mockReturnValue(mediaPlayerMap);

    it("should call sendCommandSetVolume for the mediaPlayer with the correct parameter", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);

        await service.sendCommandSetVolume(0, 0.3);

        expect(mockMediaPlayerCommandService.sendCommandSetVolume).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandSetVolume).toHaveBeenNthCalledWith(1, mediaPlayerMap, 0.3);
    });
});

describe("sendCommandMute() ", () => {
    let mediaPlayer1: MediaPlayer = new MediaPlayer(0);
    mediaPlayer1.ip = "127.0.0.1"
    let mediaPlayer2: MediaPlayer = new MediaPlayer(1);
    mediaPlayer2.ip = "127.0.0.2"
    let mediaPlayerMap: Map<number, MediaPlayer> = new Map();
    mediaPlayerMap.set(0, mediaPlayer1);
    mediaPlayerMap.set(1, mediaPlayer2);

    let mockMediaStation: MockMediaStation = new MockMediaStation(0);
    mockMediaStation.mediaPlayerRegistry.getAll.mockReturnValue(mediaPlayerMap);

    it("should call sendCommandMute for the mediaPlayer with the correct parameter", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);

        await service.sendCommandMute(0);

        expect(mockMediaPlayerCommandService.sendCommandMute).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandMute).toHaveBeenNthCalledWith(1, mediaPlayerMap);
    });
});
describe("sendCommandUnmute() ", () => {
    let mediaPlayer1: MediaPlayer = new MediaPlayer(0);
    mediaPlayer1.ip = "127.0.0.1"
    let mediaPlayer2: MediaPlayer = new MediaPlayer(1);
    mediaPlayer2.ip = "127.0.0.2"
    let mediaPlayerMap: Map<number, MediaPlayer> = new Map();
    mediaPlayerMap.set(0, mediaPlayer1);
    mediaPlayerMap.set(1, mediaPlayer2);

    let mockMediaStation: MockMediaStation = new MockMediaStation(0);
    mockMediaStation.mediaPlayerRegistry.getAll.mockReturnValue(mediaPlayerMap);

    it("should call sendCommandUnmute for the mediaPlayer with the correct parameter", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);

        await service.sendCommandUnmute(0);

        expect(mockMediaPlayerCommandService.sendCommandUnmute).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerCommandService.sendCommandUnmute).toHaveBeenNthCalledWith(1, mediaPlayerMap);
    });
});