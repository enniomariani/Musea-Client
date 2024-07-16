import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {
    IMediaPlayerData,
    MediaPlayerDataService
} from "renderer/services/MediaPlayerDataService.js";
import {
    MockMediaStationRepository
} from "mocks/renderer/dataStructure/MockMediaStationRepository.js";
import {MediaPlayer, MediaPlayerRole} from "renderer/dataStructure/MediaPlayer.js";
import {MockMediaStation} from "mocks/renderer/dataStructure/MockMediaStation.js";

let mediaPlayerService: MediaPlayerDataService;
let mockMediaStationRepo: MockMediaStationRepository;

let ip1: string = "127.0.0.1";
let name1: string = "Media-Player X";
let role1: MediaPlayerRole = MediaPlayerRole.CONTROLLER;

let ip2: string = "127.0.0.2";
let name2: string = "Media-Player 2";
let role2: MediaPlayerRole = MediaPlayerRole.DEFAULT;

let mediaPlayerId: number = 0;
let mediaStation: MockMediaStation;
let mediaPlayer1: MediaPlayer;
let mediaPlayer2: MediaPlayer;

function setupMediaPlayerWithName(addMediaStation: boolean = true, mediaStationId: number = 0): MediaPlayer {
    mediaPlayer1 = new MediaPlayer(0);
    mediaPlayer2 = new MediaPlayer(1);
    mediaPlayer1 = new MediaPlayer(mediaPlayerId);
    mediaStation = new MockMediaStation(mediaStationId);

    mediaPlayer1.ip = ip1;
    mediaPlayer1.name = name1;
    mediaPlayer1.role = role1;

    mediaPlayer2.ip = ip2;
    mediaPlayer2.name = name2;
    mediaPlayer2.role = role2;

    let answerMap: Map<number, MediaPlayer> = new Map();
    answerMap.set(0, mediaPlayer1);
    answerMap.set(1, mediaPlayer2);
    mediaStation.mediaPlayerRegistry.getAll.mockReturnValue(answerMap);

    if (addMediaStation) {
        mediaStation.mediaPlayerRegistry.getAll.mockReturnValue(answerMap);
        mediaStation.mediaPlayerRegistry.get.mockReturnValue(mediaPlayer1);
    }

    mockMediaStationRepo.requireMediaStation.mockImplementation((id) => {
        return  mediaStation;
    });
    return mediaPlayer1;
}

beforeEach(() => {
    mockMediaStationRepo = new MockMediaStationRepository()
    mediaPlayerService = new MediaPlayerDataService(mockMediaStationRepo);
    mediaPlayerId = 0;
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createMediaPlayer() ", () => {
    it("should add the newly created MediaPlayer object to the mediastation (passed by id)", () => {
        let mediaStation: MockMediaStation = new MockMediaStation(0);
        mediaStation.getNextMediaPlayerId.mockReturnValueOnce(mediaPlayerId);
        mockMediaStationRepo.requireMediaStation.mockImplementationOnce((id) => {
            return mediaStation;
        });

        mediaPlayerService.createMediaPlayer(0, name1, ip1);

        expect(mediaStation.mediaPlayerRegistry.add).toHaveBeenCalledTimes(1);
        expect(mediaStation.mediaPlayerRegistry.add).toHaveBeenCalledWith(mediaPlayerId, name1, ip1, MediaPlayerRole.CONTROLLER);
    });

    it("should call mediaStationRepository.updateAndSaveMediaStation if Media-Player ID is 0", () => {
        setupMediaPlayerWithName( true, 0);
        mediaStation.getNextMediaPlayerId.mockReturnValueOnce(0);
        mediaPlayerService.createMediaPlayer(0, name1, ip1);
        expect(mockMediaStationRepo.saveMediaStations).toHaveBeenCalledTimes(1);
    });

    it("should create a mediaPlayer with the role DEFAULT if the ID is higher than 0", () => {
        let mediaStation: MockMediaStation = new MockMediaStation(0);
        mediaPlayerId = 1;
        mediaStation.getNextMediaPlayerId.mockReturnValueOnce(mediaPlayerId);
        mockMediaStationRepo.requireMediaStation.mockImplementationOnce((id) => {
            return mediaStation;
        });

        mediaPlayerService.createMediaPlayer(0, name1, ip1);

        expect(mediaStation.mediaPlayerRegistry.add).toHaveBeenCalledTimes(1);
        expect(mediaStation.mediaPlayerRegistry.add).toHaveBeenCalledWith(mediaPlayerId, name1, ip1, MediaPlayerRole.DEFAULT);
    });

    it("should return the ID of the newly created mediaPlayer", async () => {
        let mediaStation: MockMediaStation = new MockMediaStation(0);
        let result: number;
        mediaStation.getNextMediaPlayerId.mockReturnValueOnce(mediaPlayerId);
        mockMediaStationRepo.requireMediaStation.mockImplementationOnce((id) => {
            if (id === mediaPlayerId)
                return mediaStation;
        });

        result = await mediaPlayerService.createMediaPlayer(0, ip1, name1);

        expect(result).toBe(mediaPlayerId);
    });
});

describe("getAllMediaPlayers() ", () => {
    it("should call mediaStation.getAllMediaPlayers and convert ip, name and role to a map", () => {
        let returnValue: Map<number, IMediaPlayerData>;
        setupMediaPlayerWithName();

        returnValue = mediaPlayerService.getAllMediaPlayers(0);

        expect(returnValue.size).toBe(2);
        expect(returnValue.get(0)).not.toBeNull();
        expect(returnValue.get(0)?.name).toBe(name1);
        expect(returnValue.get(0)?.ip).toBe(ip1);
        expect(returnValue.get(0)?.isController).toBe(true);

        expect(returnValue.get(1)).not.toBeNull();
        expect(returnValue.get(1)?.name).toBe(name2);
        expect(returnValue.get(1)?.ip).toBe(ip2);
        expect(returnValue.get(1)?.isController).toBe(false);
    });
});

describe("getName() ", () => {
    it("should return the name of the mediaPlayer", () => {
        setupMediaPlayerWithName();
        const returnValue: string = mediaPlayerService.getName(0, mediaPlayerId);
        expect(returnValue).toBe(name1);
    });

    it("should throw an error if the MediaPlayer ID could not be found", () => {
        setupMediaPlayerWithName( false);
        expect(() => mediaPlayerService.getName(0, mediaPlayerId)).toThrow(Error("Media-Player with this ID does not exist: 0"));
    });
});

describe("changeName() ", () => {
    const newName: string = "newName";
    it("should change the name of the mediaPlayer", () => {
        setupMediaPlayerWithName();
        mediaPlayerService.changeName(0, mediaPlayerId, newName);
        expect(mediaPlayer1.name).toBe(newName);
    });

    it("should throw an error if the MediaPlayer ID could not be found", () => {
        setupMediaPlayerWithName(false);
        expect(() => mediaPlayerService.changeName(0, mediaPlayerId, newName)).toThrow(Error("Media-Player with this ID does not exist: 0"));
    });
});

describe("getIp() ", () => {
    it("should return the ip of the mediaPlayer", () => {
        setupMediaPlayerWithName();
        const returnValue:string = mediaPlayerService.getIp(0, mediaPlayerId);
        expect(returnValue).toBe(ip1);
    });

    it("should throw an error if the MediaPlayer ID could not be found", () => {
        setupMediaPlayerWithName(false);
        expect(() => mediaPlayerService.getIp(0, mediaPlayerId)).toThrow(Error("Media-Player with this ID does not exist: 0"));
    });
});

describe("changeIp() ", () => {
    const newIp: string = "newName";
    it("should change the name of the mediaPlayer", () => {
        setupMediaPlayerWithName();
        mediaPlayerService.changeIp(0, mediaPlayerId, newIp);
        expect(mediaPlayer1.ip).toBe(newIp);
    });

    it("should call mediaStationRepository.updateAndSaveMediaStation if Media-Player ID is 0", () => {
        setupMediaPlayerWithName();
        mediaPlayerService.changeIp(0, mediaPlayerId, newIp);
        expect(mockMediaStationRepo.saveMediaStations).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if the MediaPlayer ID could not be found", async () => {
        setupMediaPlayerWithName(false);
        await expect(mediaPlayerService.changeIp(0, mediaPlayerId, newIp)).rejects.toThrow(Error("Media-Player with this ID does not exist: 0"));
    });
});