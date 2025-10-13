import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {
    MockMediaStationRepository
} from "src/mcf/mocks/renderer/dataStructure/MockMediaStationRepository.js";
import {MediaApp, MediaAppRole} from "../../../../renderer/dataStructure/MediaApp.js";
import {MockMediaStation} from "src/mcf/mocks/renderer/dataStructure/MockMediaStation";
import {MockNetworkService} from "src/mcf/mocks/renderer/network/MockNetworkService.js";
import {MediaAppConnectionService} from "renderer/services/MediaAppConnectionService.js";
import {runPipeline} from "renderer/network/MediaAppConnectionSteps.js";
import * as Steps from "renderer/network/MediaAppConnectionSteps.js";


let service: MediaAppConnectionService;
let mockMediaStationRepo: MockMediaStationRepository;
let mockNetworkService: MockNetworkService;

let ip1: string = "127.0.0.1";
let name1: string = "media-App X";
let role1: MediaAppRole = MediaAppRole.CONTROLLER;

let ip2: string = "127.0.0.2";
let name2: string = "media-App 2";
let role2: MediaAppRole = MediaAppRole.DEFAULT;

let mediaAppId: number = 0;
let mediaStation: MockMediaStation;
let mediaApp1: MediaApp;
let mediaApp2: MediaApp;

function setupMediaAppWithName(addMediaStation: boolean = true, mediaStationId: number = 0): MediaApp {
    mediaApp1 = new MediaApp(mediaAppId);
    mediaApp2 = new MediaApp(1);
    mediaStation = new MockMediaStation(mediaStationId);

    mediaApp1.ip = ip1;
    mediaApp1.name = name1;
    mediaApp1.role = role1;

    mediaApp2.ip = ip2;
    mediaApp2.name = name2;
    mediaApp2.role = role2;

    let answerMap: Map<number, MediaApp> = new Map();
    answerMap.set(0, mediaApp1);
    answerMap.set(1, mediaApp2);
    mediaStation.mediaAppRegistry.getAll.mockReturnValue(answerMap);

    if (addMediaStation) {
        mediaStation.mediaAppRegistry.getAll.mockReturnValue(answerMap);
        mediaStation.mediaAppRegistry.get.mockReturnValue(mediaApp1);
    }

    mockMediaStationRepo.requireMediaStation.mockImplementation((id) => {
        return mediaStation;
    });
    return mediaApp1;
}

let runPipelineSpy: jest.SpiedFunction<typeof Steps.runPipeline>;

beforeEach(() => {
    mockNetworkService = new MockNetworkService()
    mockMediaStationRepo = new MockMediaStationRepository()
    service = new MediaAppConnectionService(mockMediaStationRepo, mockNetworkService);
    mediaAppId = 0;
    runPipelineSpy = jest.spyOn(Steps, "runPipeline");
    runPipelineSpy.mockReset();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("checkConnection()", () => {
    it("calls runPipeline with 3 steps for user role and returns its result", async () => {
        setupMediaAppWithName();
        const mockedRunPipeline = runPipeline as jest.MockedFunction<typeof runPipeline>;

        mockedRunPipeline.mockResolvedValueOnce(Steps.MediaAppConnectionStatus.Online);

        const onProgress = jest.fn();
        const result:Steps.MediaAppConnectionStatus = await service.checkConnection(ip1, { role: "user", onProgress });

        expect(result).toBe(Steps.MediaAppConnectionStatus.Online);
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
        expect(stepsArg[0].failStatus).toBe(Steps.MediaAppConnectionStatus.IcmpPingFailed);
        expect(stepsArg[1].failStatus).toBe(Steps.MediaAppConnectionStatus.TcpConnectionFailed);
        expect(stepsArg[2].failStatus).toBe(Steps.MediaAppConnectionStatus.WebSocketPingFailed);

        // Functions bound as provided by NetworkService (identity is fine to check)
        expect(typeof stepsArg[0].run).toBe("function");
        expect(typeof stepsArg[1].run).toBe("function");
        expect(typeof stepsArg[2].run).toBe("function");

        // Options forwarded (including onProgress)
        expect(optsArg.role).toBe("user");
        expect(optsArg.onProgress).toBe(onProgress);
    });

    it("calls runPipeline with 4 steps for admin role (including Register) and returns its result", async () => {
        setupMediaAppWithName();
        const mockedRunPipeline = runPipeline as jest.MockedFunction<typeof runPipeline>;

        mockedRunPipeline.mockResolvedValueOnce(Steps.MediaAppConnectionStatus.RegistrationFailed);

        const onProgress = jest.fn();
        const result = await service.checkConnection(ip1,{ role: "admin", onProgress });

        expect(result).toBe(Steps.MediaAppConnectionStatus.RegistrationFailed);
        expect(runPipeline).toHaveBeenCalledTimes(1);

        const [ipArg, stepsArg, optsArg] = mockedRunPipeline.mock.calls[0] as Parameters<typeof runPipeline>;

        expect(ipArg).toBe(ip1);

        // 4 steps: ICMP -> TCP -> WS -> REGISTER
        expect(stepsArg).toHaveLength(4);
        expect(stepsArg[0].step).toBe(Steps.ConnectionStep.IcmpPing);
        expect(stepsArg[1].step).toBe(Steps.ConnectionStep.TcpConnect);
        expect(stepsArg[2].step).toBe(Steps.ConnectionStep.WsPing);
        expect(stepsArg[3].step).toBe(Steps.ConnectionStep.Register);
        expect(stepsArg[3].failStatus).toBe(Steps.MediaAppConnectionStatus.RegistrationFailed);
        expect(typeof stepsArg[3].run).toBe("function");

        expect(optsArg.role).toBe("admin");
        expect(optsArg.onProgress).toBe(onProgress);
    });
});


describe("connectAndRegisterToMediaApp() ", () => {

    describe("check register admin-app: ", () => {
        it("should call networkService.openConnection and sendRegistrationAdminApp if appType is admin", async () => {
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("yes");
            setupMediaAppWithName();

            await service.connectAndRegisterToMediaApp(0, mediaAppId, "admin");

            expect(mockNetworkService.openConnection).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.openConnection).toHaveBeenCalledWith(ip1);

            expect(mockNetworkService.sendRegistrationAdminApp).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.sendRegistrationAdminApp).toHaveBeenCalledWith(ip1);
        });

        it("should return true if the connection could be established and the registration was accepted", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("yes");
            setupMediaAppWithName();

            answer = await service.connectAndRegisterToMediaApp(0, mediaAppId, "admin");

            expect(answer).toBe(true);
        });

        it("should return false if the connection could not been established", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(false);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("yes");
            setupMediaAppWithName();

            answer = await service.connectAndRegisterToMediaApp(0, mediaAppId, "admin");

            expect(answer).toBe(false);
        });

        it("should return false if the connection could be established but the registration was rejected", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("no");
            setupMediaAppWithName();

            answer = await service.connectAndRegisterToMediaApp(0, mediaAppId, "admin");

            expect(answer).toBe(false);
        });
    });

    describe("check register user-app: ", () => {
        it("should call networkService.openConnection and sendRegistrationUserApp if appType is user", async () => {
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes");
            setupMediaAppWithName();

            await service.connectAndRegisterToMediaApp(0, mediaAppId, "user");

            expect(mockNetworkService.openConnection).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.openConnection).toHaveBeenCalledWith(ip1);

            expect(mockNetworkService.sendRegistrationUserApp).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.sendRegistrationUserApp).toHaveBeenCalledWith(ip1);
        });

        it("should return true if the connection could be established and the registration was accepted", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes");
            setupMediaAppWithName();

            answer = await service.connectAndRegisterToMediaApp(0, mediaAppId, "user");

            expect(answer).toBe(true);
        });

        it("should return true if the connection could be established and the registration was accepted, but blocked", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes_block");
            setupMediaAppWithName();

            answer = await service.connectAndRegisterToMediaApp(0, mediaAppId, "user");

            expect(answer).toBe(true);
        });

        it("should return false if the connection could not been established", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(false);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes");
            setupMediaAppWithName();

            answer = await service.connectAndRegisterToMediaApp(0, mediaAppId, "user");

            expect(answer).toBe(false);
        });

        it("should return false if the connection could be established but the registration was rejected", async () => {
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("no");
            setupMediaAppWithName();

            answer = await service.connectAndRegisterToMediaApp(0, mediaAppId, "user");

            expect(answer).toBe(false);
        });
    });

    it("should throw an error if the MediaApp ID could not be found", async () => {
        setupMediaAppWithName(false);
        await expect(service.connectAndRegisterToMediaApp(0, mediaAppId, "admin")).rejects.toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("unregisterAndCloseMediaApp() ", () => {

    it("should call networkService.openConnection and sendRegistration", async () => {
        mockNetworkService.unregisterAndCloseConnection.mockReturnValueOnce(true);
        setupMediaAppWithName();

        await service.unregisterAndCloseMediaApp(0, mediaAppId);

        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(ip1);
    });

    it("should throw an error if the MediaApp ID could not be found", async () => {
        setupMediaAppWithName(false);

        expect(service.unregisterAndCloseMediaApp(0, mediaAppId)).rejects.toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("checkOnlineStatusOfAllMediaApps() ", () => {
    let mockMediaStation: MockMediaStation;
    let answer: boolean | null;
    const controllerIp: string = "127.0.0.1";
    const correctJSON: any = {name: "mediaStationX"};
    const correctJSONwithTwoMediaApps = {
        name: "mediaStationX",
        mediaApps: [
            {id: 0, ip: "127.0.0.1", role: MediaAppRole.CONTROLLER},
            {id: 1, ip: "127.0.0.2", role: MediaAppRole.DEFAULT}
        ]
    };

    const correctJSONwithThreeMediaApps = {
        name: "mediaStationX",
        mediaApps: [
            {id: 0, ip: "127.0.0.1", role: MediaAppRole.CONTROLLER},
            {id: 1, ip: "127.0.0.2", role: MediaAppRole.DEFAULT},
            {id: 2, ip: "127.0.0.3", role: MediaAppRole.DEFAULT}
        ]
    };

    beforeEach(() => {
        let controllerApp:MediaApp = new MediaApp(0);
        controllerApp.ip = controllerIp;
        answer = null;
        mockMediaStation = new MockMediaStation(0);

        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);
        mockMediaStation.mediaAppRegistry.get.mockReturnValue(controllerApp);

        jest.spyOn(service, "checkConnection").mockResolvedValue(Steps.MediaAppConnectionStatus.Online);

        mockNetworkService.getContentFileFrom.mockReturnValue(JSON.stringify(correctJSON));
    });

    it("should return false if the controller is not reachable", async () => {
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaAppConnectionStatus.RegistrationFailed);
        answer = await service.checkOnlineStatusOfAllMediaApps(0);
        expect(answer).toBe(false);
    });

    it("should return false if the controller-app returns no contents.json-file", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(null);

        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        expect(answer).toBe(false);
    });

    it("with two media-apps (controller + 1 media-app): should return true if everything is reachable", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithTwoMediaApps));

        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        expect(answer).toBe(true);
    });

    it("with two media-apps (controller + 1 media-app): should call checkConnection for both with the correct parameter", async () => {
        const checkConnSpy = jest.spyOn(service, "checkConnection");

        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithTwoMediaApps));

        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        expect(checkConnSpy).toHaveBeenCalledTimes(2);
        expect(checkConnSpy).toHaveBeenNthCalledWith(1, ip1, { role: "admin" });
        expect(checkConnSpy).toHaveBeenNthCalledWith(2, ip2, { role: "admin" });
    });

    it("with two media-apps (controller + 1 media-app): should return false if the second mediaApp-pc is not reachable", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithTwoMediaApps));
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaAppConnectionStatus.Online);
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaAppConnectionStatus.RegistrationFailed);

        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        expect(answer).toBe(false);
    });

    it("with three media-apps (controller + 2 media-apps): should return true if everything is reachable", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithThreeMediaApps));

        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        expect(answer).toBe(true);
    });

    it("with three media-apps (controller + 2 media-apps): should return false if the third mediaApp-pc is not reachable", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithThreeMediaApps));
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaAppConnectionStatus.Online);
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaAppConnectionStatus.Online);
        jest.spyOn(service, "checkConnection").mockResolvedValueOnce(Steps.MediaAppConnectionStatus.RegistrationFailed);

        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        expect(answer).toBe(false);
    });

    it("should return true if the controller-app returned an empty JSON (which means there wasn't saved anything before, so no other media-apps)", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce("{}");

        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        expect(answer).toBe(true);
    });

    it("should disconnect from the controller and close the connection after it received the data", async () => {

        await service.checkOnlineStatusOfAllMediaApps(0);

        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(controllerIp);
    });

    it("should call unregisterAndCloseConnection() at the end", async () => {

        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(controllerIp);
    });
});