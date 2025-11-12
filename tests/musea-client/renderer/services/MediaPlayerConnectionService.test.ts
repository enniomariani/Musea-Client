import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {
    MockMediaStationRepository
} from "mocks/renderer/dataStructure/MockMediaStationRepository.js";
import {MediaPlayer, MediaPlayerRole} from "renderer/dataStructure/MediaPlayer.js";
import {MockMediaStation} from "mocks/renderer/dataStructure/MockMediaStation.js";
import {MockNetworkService} from "mocks/renderer/network/MockNetworkService.js";
import {MediaPlayerConnectionService} from "renderer/services/MediaPlayerConnectionService.js";
import {runPipeline} from "renderer/network/MediaPlayerConnectionSteps.js";
import * as Steps from "renderer/network/MediaPlayerConnectionSteps.js";


let service: MediaPlayerConnectionService;
let mockMediaStationRepo: MockMediaStationRepository;
let mockNetworkService: MockNetworkService;

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
    mediaPlayer1 = new MediaPlayer(mediaPlayerId);
    mediaPlayer2 = new MediaPlayer(1);
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
        return mediaStation;
    });
    return mediaPlayer1;
}

let runPipelineSpy: jest.SpiedFunction<typeof Steps.runPipeline>;

beforeEach(() => {
    mockNetworkService = new MockNetworkService()
    mockMediaStationRepo = new MockMediaStationRepository()
    service = new MediaPlayerConnectionService(mockMediaStationRepo, mockNetworkService);
    mediaPlayerId = 0;
    runPipelineSpy = jest.spyOn(Steps, "runPipeline");
    runPipelineSpy.mockReset();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("checkConnection()", () => {
    it("calls runPipeline with 3 steps for user role and returns its result", async () => {
        setupMediaPlayerWithName();
        const mockedRunPipeline = runPipeline as jest.MockedFunction<typeof runPipeline>;

        mockedRunPipeline.mockResolvedValueOnce(Steps.MediaPlayerConnectionStatus.Online);

        const onProgress = jest.fn();
        const result:Steps.MediaPlayerConnectionStatus = await service.checkConnection(ip1, { role: "user", onProgress });

        expect(result).toBe(Steps.MediaPlayerConnectionStatus.Online);
        expect(runPipeline).toHaveBeenCalledTimes(1);

        const [ipArg, stepsArg, optsArg] = mockedRunPipeline.mock.calls[0] as Parameters<typeof runPipeline>;

        // IP resolved from repository
        expect(ipArg).toBe(ip1);

        // 3 steps: ICMP -> TCP -> WS
        expect(Array.isArray(stepsArg)).toBe(true);
        expect(stepsArg).toHaveLength(3);
        expect(stepsArg[0].step).toBe(Steps.ConnectionStep.IcmpPing);
        expect(stepsArg[1].step).toBe(Steps.ConnectionStep.TcpConnect);
        expect(stepsArg[2].step).toBe(Steps.ConnectionStep.WsPing);

        // Fail statuses aligned
        expect(stepsArg[0].failStatus).toBe(Steps.MediaPlayerConnectionStatus.IcmpPingFailed);
        expect(stepsArg[1].failStatus).toBe(Steps.MediaPlayerConnectionStatus.TcpConnectionFailed);
        expect(stepsArg[2].failStatus).toBe(Steps.MediaPlayerConnectionStatus.WebSocketPingFailed);

        // Functions bound as provided by NetworkService (identity is fine to check)
        expect(typeof stepsArg[0].run).toBe("function");
        expect(typeof stepsArg[1].run).toBe("function");
        expect(typeof stepsArg[2].run).toBe("function");

        // Options forwarded (including onProgress)
        expect(optsArg.role).toBe("user");
        expect(optsArg.onProgress).toBe(onProgress);
    });

    it("calls runPipeline with 4 steps for admin role (including Register) and returns its result", async () => {
        setupMediaPlayerWithName();
        const mockedRunPipeline = runPipeline as jest.MockedFunction<typeof runPipeline>;

        mockedRunPipeline.mockResolvedValueOnce(Steps.MediaPlayerConnectionStatus.RegistrationFailed);

        const onProgress = jest.fn();
        const result = await service.checkConnection(ip1,{ role: "admin", onProgress });

        expect(result).toBe(Steps.MediaPlayerConnectionStatus.RegistrationFailed);
        expect(runPipeline).toHaveBeenCalledTimes(1);

        const [ipArg, stepsArg, optsArg] = mockedRunPipeline.mock.calls[0] as Parameters<typeof runPipeline>;

        expect(ipArg).toBe(ip1);

        // 4 steps: ICMP -> TCP -> WS -> REGISTER
        expect(stepsArg).toHaveLength(4);
        expect(stepsArg[0].step).toBe(Steps.ConnectionStep.IcmpPing);
        expect(stepsArg[1].step).toBe(Steps.ConnectionStep.TcpConnect);
        expect(stepsArg[2].step).toBe(Steps.ConnectionStep.WsPing);
        expect(stepsArg[3].step).toBe(Steps.ConnectionStep.Register);
        expect(stepsArg[3].failStatus).toBe(Steps.MediaPlayerConnectionStatus.RegistrationFailed);
        expect(typeof stepsArg[3].run).toBe("function");

        expect(optsArg.role).toBe("admin");
        expect(optsArg.onProgress).toBe(onProgress);
    });
});


describe("connectAndRegisterToMediaPlayer() ", () => {

    describe("check register admin-app: ", () => {
        it("should call networkService.openConnection and sendRegistrationAdminApp if appType is admin", async () => {
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("yes");
            setupMediaPlayerWithName();

            await service.connectAndRegisterToMediaPlayer(0, mediaPlayerId, "admin");

            expect(mockNetworkService.openConnection).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.openConnection).toHaveBeenCalledWith(ip1);

            expect(mockNetworkService.sendRegistrationAdminApp).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.sendRegistrationAdminApp).toHaveBeenCalledWith(ip1);
        });

        it("should return true if the connection could be established and the registration was accepted", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("yes");
            setupMediaPlayerWithName();

            answer = await service.connectAndRegisterToMediaPlayer(0, mediaPlayerId, "admin");

            expect(answer).toBe(true);
        });

        it("should return false if the connection could not been established", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(false);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("yes");
            setupMediaPlayerWithName();

            answer = await service.connectAndRegisterToMediaPlayer(0, mediaPlayerId, "admin");

            expect(answer).toBe(false);
        });

        it("should return false if the connection could be established but the registration was rejected", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("no");
            setupMediaPlayerWithName();

            answer = await service.connectAndRegisterToMediaPlayer(0, mediaPlayerId, "admin");

            expect(answer).toBe(false);
        });
    });

    describe("check register user-app: ", () => {
        it("should call networkService.openConnection and sendRegistrationUserApp if appType is user", async () => {
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes");
            setupMediaPlayerWithName();

            await service.connectAndRegisterToMediaPlayer(0, mediaPlayerId, "user");

            expect(mockNetworkService.openConnection).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.openConnection).toHaveBeenCalledWith(ip1);

            expect(mockNetworkService.sendRegistrationUserApp).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.sendRegistrationUserApp).toHaveBeenCalledWith(ip1);
        });

        it("should return true if the connection could be established and the registration was accepted", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes");
            setupMediaPlayerWithName();

            answer = await service.connectAndRegisterToMediaPlayer(0, mediaPlayerId, "user");

            expect(answer).toBe(true);
        });

        it("should return true if the connection could be established and the registration was accepted, but blocked", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes_block");
            setupMediaPlayerWithName();

            answer = await service.connectAndRegisterToMediaPlayer(0, mediaPlayerId, "user");

            expect(answer).toBe(true);
        });

        it("should return false if the connection could not been established", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(false);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes");
            setupMediaPlayerWithName();

            answer = await service.connectAndRegisterToMediaPlayer(0, mediaPlayerId, "user");

            expect(answer).toBe(false);
        });

        it("should return false if the connection could be established but the registration was rejected", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("no");
            setupMediaPlayerWithName();

            answer = await service.connectAndRegisterToMediaPlayer(0, mediaPlayerId, "user");

            expect(answer).toBe(false);
        });
    });

    it("should throw an error if the MediaPlayer ID could not be found", async () => {
        setupMediaPlayerWithName(false);
        await expect(service.connectAndRegisterToMediaPlayer(0, mediaPlayerId, "admin")).rejects.toThrow(Error("Media-Player with this ID does not exist: 0"));
    });
});

describe("unregisterAndCloseMediaPlayer() ", () => {

    it("should call networkService.openConnection and sendRegistration", async () => {
        mockNetworkService.unregisterAndCloseConnection.mockReturnValueOnce(true);
        setupMediaPlayerWithName();

        await service.unregisterAndCloseMediaPlayer(0, mediaPlayerId);

        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(ip1);
    });

    it("should throw an error if the MediaPlayer ID could not be found", async () => {
        setupMediaPlayerWithName(false);

        expect(service.unregisterAndCloseMediaPlayer(0, mediaPlayerId)).rejects.toThrow(Error("Media-Player with this ID does not exist: 0"));
    });
});

describe("checkOnlineStatusOfAllMediaPlayers() ", () => {
    let mockMediaStation: MockMediaStation;
    let answer: boolean | null;
    const controllerIp: string = "127.0.0.1";
    const correctJSON: any = {name: "mediaStationX"};
    const correctJSONwithTwoMediaPlayers = {
        name: "mediaStationX",
        mediaPlayers: [
            {id: 0, ip: "127.0.0.1", role: MediaPlayerRole.CONTROLLER},
            {id: 1, ip: "127.0.0.2", role: MediaPlayerRole.DEFAULT}
        ]
    };

    const correctJSONwithThreeMediaPlayers = {
        name: "mediaStationX",
        mediaPlayers: [
            {id: 0, ip: "127.0.0.1", role: MediaPlayerRole.CONTROLLER},
            {id: 1, ip: "127.0.0.2", role: MediaPlayerRole.DEFAULT},
            {id: 2, ip: "127.0.0.3", role: MediaPlayerRole.DEFAULT}
        ]
    };

    beforeEach(() => {
        let controllerApp:MediaPlayer = new MediaPlayer(0);
        controllerApp.ip = controllerIp;
        answer = null;
        mockMediaStation = new MockMediaStation(0);

        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);
        mockMediaStation.mediaPlayerRegistry.get.mockReturnValue(controllerApp);

        jest.spyOn(service, "checkConnection").mockResolvedValue(Steps.MediaPlayerConnectionStatus.Online);

        mockNetworkService.getContentFileFrom.mockReturnValue(JSON.stringify(correctJSON));
    });

    it("should return false if the controller is not reachable", async () => {
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaPlayerConnectionStatus.RegistrationFailed);
        answer = await service.checkOnlineStatusOfAllMediaPlayers(0);
        expect(answer).toBe(false);
    });

    it("should return false if the controller-app returns no contents.json-file", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(null);

        answer = await service.checkOnlineStatusOfAllMediaPlayers(0);

        expect(answer).toBe(false);
    });

    it("with two media-players (controller + 1 media-player): should return true if everything is reachable", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithTwoMediaPlayers));

        answer = await service.checkOnlineStatusOfAllMediaPlayers(0);

        expect(answer).toBe(true);
    });

    it("with two media-players (controller + 1 media-player): should call checkConnection for both with the correct parameter", async () => {
        const checkConnSpy = jest.spyOn(service, "checkConnection");

        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithTwoMediaPlayers));

        answer = await service.checkOnlineStatusOfAllMediaPlayers(0);

        expect(checkConnSpy).toHaveBeenCalledTimes(2);
        expect(checkConnSpy).toHaveBeenNthCalledWith(1, ip1, { role: "admin" });
        expect(checkConnSpy).toHaveBeenNthCalledWith(2, ip2, { role: "admin" });
    });

    it("with two media-players (controller + 1 media-player): should return false if the second mediaPlayer-pc is not reachable", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithTwoMediaPlayers));
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaPlayerConnectionStatus.Online);
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaPlayerConnectionStatus.RegistrationFailed);

        answer = await service.checkOnlineStatusOfAllMediaPlayers(0);

        expect(answer).toBe(false);
    });

    it("with three media-players (controller + 2 media-players): should return true if everything is reachable", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithThreeMediaPlayers));

        answer = await service.checkOnlineStatusOfAllMediaPlayers(0);

        expect(answer).toBe(true);
    });

    it("with three media-players (controller + 2 media-players): should return false if the third mediaPlayer-pc is not reachable", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithThreeMediaPlayers));
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaPlayerConnectionStatus.Online);
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaPlayerConnectionStatus.Online);
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaPlayerConnectionStatus.RegistrationFailed);

        answer = await service.checkOnlineStatusOfAllMediaPlayers(0);

        expect(answer).toBe(false);
    });

    it("should return true if the controller-app returned an empty JSON (which means there wasn't saved anything before, so no other media-players)", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce("{}");

        answer = await service.checkOnlineStatusOfAllMediaPlayers(0);

        expect(answer).toBe(true);
    });

    it("should disconnect from the controller and close the connection after it received the data", async () => {

        await service.checkOnlineStatusOfAllMediaPlayers(0);

        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(controllerIp);
    });

    it("should call unregisterAndCloseConnection() at the end", async () => {

        answer = await service.checkOnlineStatusOfAllMediaPlayers(0);

        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(controllerIp);
    });
});