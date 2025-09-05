import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {
    MockMediaStationRepository
} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MediaApp} from "../../../../src/mcf/renderer/dataStructure/MediaApp";
import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MockNetworkService} from "../../../__mocks__/mcf/renderer/services/MockNetworkService";
import {MediaAppConnectionService} from "@app/mcf/renderer/services/MediaAppConnectionService";

let mediaAppService: MediaAppConnectionService;
let mockMediaStationRepo: MockMediaStationRepository;
let mockNetworkService: MockNetworkService;

let ip1: string = "127.0.0.1";
let name1: string = "media-App X";
let role1: string = MediaApp.ROLE_CONTROLLER;

let ip2: string = "127.0.0.2";
let name2: string = "media-App 2";
let role2: string = MediaApp.ROLE_DEFAULT;


let mediaAppId: number = 0;
let mediaStation: MockMediaStation;
let mediaApp1: MediaApp;
let mediaApp2: MediaApp;

function setupMediaAppWithName(repoReturnsMediaStation: boolean, addMediaStation: boolean = true, mediaStationId: number = 0): MediaApp {
    mediaApp1 = new MediaApp(0);
    mediaApp2 = new MediaApp(1);
    mediaApp1 = new MediaApp(mediaAppId);
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
    mediaStation.getAllMediaApps.mockReturnValue(answerMap);

    if (addMediaStation) {
        mediaStation.getAllMediaApps.mockReturnValue(answerMap);
        mediaStation.getMediaApp.mockReturnValue(mediaApp1);
    }

    mockMediaStationRepo.findMediaStation.mockImplementation((id) => {
        return repoReturnsMediaStation ? mediaStation : null;
    });
    return mediaApp1;
}

beforeEach(() => {
    mockNetworkService = new MockNetworkService()
    mockMediaStationRepo = new MockMediaStationRepository()
    mediaAppService = new MediaAppConnectionService(mockMediaStationRepo, mockNetworkService);
    mediaAppId = 0;
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("connectAndRegisterToMediaApp() ", () => {

    describe("check connection to admin-app: ", () => {
        it("should call networkService.openConnection and sendRegistrationAdminApp if appType is admin", async () => {
            //setup
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("yes");
            setupMediaAppWithName(true);

            //method to test
            await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "admin");

            //tests
            expect(mockNetworkService.openConnection).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.openConnection).toHaveBeenCalledWith(ip1);

            expect(mockNetworkService.sendRegistrationAdminApp).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.sendRegistrationAdminApp).toHaveBeenCalledWith(ip1);
        });

        it("should return true if the connection could be established and the registration was accepted", async () => {
            //setup
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("yes");
            setupMediaAppWithName(true);

            //method to test
            answer = await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "admin");

            //tests
            expect(answer).toBe(true);
        });

        it("should return false if the connection could not been established", async () => {
            //setup
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(false);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("yes");
            setupMediaAppWithName(true);

            //method to test
            answer = await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "admin");

            //tests
            expect(answer).toBe(false);
        });

        it("should return false if the connection could be established but the registration was rejected", async () => {
            //setup
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("no");
            setupMediaAppWithName(true);

            //method to test
            answer = await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "admin");

            //tests
            expect(answer).toBe(false);
        });
    });

    describe("check connection to user-app: ", () => {
        it("should call networkService.openConnection and sendRegistrationUserApp if appType is user", async () => {
            //setup
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes");
            setupMediaAppWithName(true);

            //method to test
            await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "user");

            //tests
            expect(mockNetworkService.openConnection).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.openConnection).toHaveBeenCalledWith(ip1);

            expect(mockNetworkService.sendRegistrationUserApp).toHaveBeenCalledTimes(1);
            expect(mockNetworkService.sendRegistrationUserApp).toHaveBeenCalledWith(ip1);
        });

        it("should return true if the connection could be established and the registration was accepted", async () => {
            //setup
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes");
            setupMediaAppWithName(true);

            //method to test
            answer = await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "user");

            //tests
            expect(answer).toBe(true);
        });

        it("should return true if the connection could be established and the registration was accepted, but blocked", async () => {
            //setup
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes_block");
            setupMediaAppWithName(true);

            //method to test
            answer = await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "user");

            //tests
            expect(answer).toBe(true);
        });

        it("should return false if the connection could not been established", async () => {
            //setup
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(false);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes");
            setupMediaAppWithName(true);

            //method to test
            answer = await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "user");

            //tests
            expect(answer).toBe(false);
        });

        it("should return false if the connection could be established but the registration was rejected", async () => {
            //setup
            let answer: boolean;
            mockNetworkService.openConnection.mockReturnValueOnce(true);
            mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("no");
            setupMediaAppWithName(true);

            //method to test
            answer = await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "user");

            //tests
            expect(answer).toBe(false);
        });
    });

    it("should throw an error if the app-type is not valid", async () => {
        //setup
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("no");
        setupMediaAppWithName(true);

        //method to test
        await expect(mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "not-valid")).rejects.toThrow(Error("App-Type is not valid: not-valid"));
    });

    it("should throw an error if the mediaStationId could not be found", async () => {
        //setup
        setupMediaAppWithName(false);

        //tests
        await expect(mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "admin")).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));
    });

    it("should throw an error if the MediaApp ID could not be found", async () => {
        //setup
        setupMediaAppWithName(true, false);

        //tests
        await expect(mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId, "admin")).rejects.toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("unregisterAndCloseMediaApp() ", () => {

    it("should call networkService.openConnection and sendRegistration", async () => {
        //setup
        mockNetworkService.unregisterAndCloseConnection.mockReturnValueOnce(true);
        setupMediaAppWithName(true);

        //method to test
        await mediaAppService.unregisterAndCloseMediaApp(0, mediaAppId);

        //tests
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(ip1);
    });

    it("should throw an error if the mediaStationId could not be found", async () => {
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(mediaAppService.unregisterAndCloseMediaApp(0, mediaAppId)).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));

    });

    it("should throw an error if the MediaApp ID could not be found", async () => {
        //setup
        setupMediaAppWithName(true, false);

        //tests
        expect(mediaAppService.unregisterAndCloseMediaApp(0, mediaAppId)).rejects.toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("isOnline() ", () => {

    it("should call networkService.openConnection", async () => {
        //setup
        let returnValue: boolean;
        setupMediaAppWithName(true);

        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(true);

        //method to test
        await mediaAppService.isOnline(0, mediaAppId);

        //tests
        expect(mockNetworkService.openConnection).toHaveBeenCalledTimes(1);
    });

    it("should return false if networkService.openConnection returns false", async () => {
        //setup
        let returnValue: boolean;
        setupMediaAppWithName(true);

        mockNetworkService.openConnection.mockReturnValueOnce(false);
        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(true);

        //method to test
        returnValue = await mediaAppService.isOnline(0, mediaAppId);

        //tests
        expect(returnValue).toBe(false);
    });

    it("should return true if networkService.isMediaAppOnline returns true", async () => {
        //setup
        let returnValue: boolean;
        setupMediaAppWithName(true);

        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(true);

        //method to test
        returnValue = await mediaAppService.isOnline(0, mediaAppId);

        //tests
        expect(returnValue).toBe(true);
    });

    it("should return false if networkService.isMediaAppOnline returns false", async () => {
        //setup
        let returnValue: boolean;
        setupMediaAppWithName(true);

        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(false);

        //method to test
        returnValue = await mediaAppService.isOnline(0, mediaAppId);

        //tests
        expect(returnValue).toBe(false);
    });

    it("should throw an error if the mediaStationId could not be found", async () => {
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(mediaAppService.isOnline(0, mediaAppId)).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));
    });

    it("should throw an error if the MediaApp ID could not be found", async () => {
        //setup
        setupMediaAppWithName(true, false);

        //tests
        expect(mediaAppService.isOnline(0, mediaAppId)).rejects.toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("pcRespondsToPing() ", () => {

    it("should return true if networkService.pcRespondsToPing returns true", async () => {
        //setup
        let returnValue: boolean;
        setupMediaAppWithName(true);

        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(true);

        //method to test
        returnValue = await mediaAppService.pcRespondsToPing(0, mediaAppId);

        //tests
        expect(returnValue).toBe(true);
    });

    it("should return true if networkService.pcRespondsToPing returns false", async () => {
        //setup
        let returnValue: boolean;
        setupMediaAppWithName(true);

        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(false);

        //method to test
        returnValue = await mediaAppService.pcRespondsToPing(0, mediaAppId);

        //tests
        expect(returnValue).toBe(false);
    });

    it("should throw an error if the mediaStationId could not be found", async () => {
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(mediaAppService.pcRespondsToPing(0, mediaAppId)).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));
    });

    it("should throw an error if the MediaApp ID could not be found", async () => {
        //setup
        setupMediaAppWithName(true, false);

        //tests
        expect(mediaAppService.pcRespondsToPing(0, mediaAppId)).rejects.toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});