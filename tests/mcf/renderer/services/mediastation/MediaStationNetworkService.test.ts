import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockNetworkService} from "__mocks__/mcf/renderer/services/MockNetworkService";
import {
    MediaStationNetworkService
} from "@app/mcf/renderer/services/mediastation/MediaStationNetworkService";
import {
    MockMediaStationRepository
} from "__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MediaApp} from "@app/mcf/renderer/dataStructure/MediaApp";

let service: MediaStationNetworkService;
let mockMediaStationRepo: MockMediaStationRepository;
let mockNetworkService: MockNetworkService;

beforeEach(() => {
    mockNetworkService = new MockNetworkService();
    mockMediaStationRepo = new MockMediaStationRepository();
    service = new MediaStationNetworkService(mockNetworkService, mockMediaStationRepo);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("checkOnlineStatusOfAllMediaApps() ", () => {
    let mockMediaStation: MockMediaStation;
    let answer: boolean;
    const controllerIp: string = "127.0.0.1";
    const correctJSON: any = {name: "mediaStationX"};
    const correctJSONwithTwoMediaApps = {
        name: "mediaStationX",
        mediaApps: [
            {
                id: 0,
                ip: "127.0.0.1",
                role: MediaApp.ROLE_CONTROLLER
            },
            {
                id: 1,
                ip: "127.0.0.1",
                role: MediaApp.ROLE_DEFAULT
            }
        ]
    };

    const correctJSONwithThreeMediaApps = {
        name: "mediaStationX",
        mediaApps: [
            {
                id: 0,
                ip: "127.0.0.1",
                role: MediaApp.ROLE_CONTROLLER
            },
            {
                id: 1,
                ip: "127.0.0.2",
                role: MediaApp.ROLE_DEFAULT
            },
            {
                id: 2,
                ip: "127.0.0.3",
                role: MediaApp.ROLE_DEFAULT
            }
        ]
    };

    beforeEach(() => {
        answer = null;
        mockMediaStation = new MockMediaStation(0);

        mockMediaStationRepo.findMediaStation.mockReturnValue(mockMediaStation);
        mockMediaStation.getControllerIp.mockReturnValue(controllerIp);
        mockNetworkService.openConnection.mockImplementation((ip:string) =>{
            if(ip === controllerIp || ip === correctJSONwithThreeMediaApps.mediaApps[1].ip || ip === correctJSONwithThreeMediaApps.mediaApps[2].ip)
                return true;
        });
        mockNetworkService.pcRespondsToPing.mockImplementation((ip:string) =>{
            if(ip === controllerIp || ip === correctJSONwithThreeMediaApps.mediaApps[1].ip || ip === correctJSONwithThreeMediaApps.mediaApps[2].ip)
                return true;
        });
        mockNetworkService.isMediaAppOnline.mockImplementation((ip:string) =>{
            if(ip === controllerIp || ip === correctJSONwithThreeMediaApps.mediaApps[1].ip || ip === correctJSONwithThreeMediaApps.mediaApps[2].ip)
                return true;
        });
        mockNetworkService.sendCheckRegistration.mockImplementation((ip:string) =>{
            if(ip === controllerIp || ip === correctJSONwithThreeMediaApps.mediaApps[1].ip || ip === correctJSONwithThreeMediaApps.mediaApps[2].ip)
                return true;
        });
        mockNetworkService.getContentFileFrom.mockReturnValue(JSON.stringify(correctJSON));
    });

    it("should return false if the controller is not reachable with ping", async () => {
        //setup
        mockNetworkService.pcRespondsToPing = jest.fn();
        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("should return false if the connection to the controller could not be opened", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("should false if the controller-app is not responding", async () => {
        //setup
        mockNetworkService.isMediaAppOnline = jest.fn();
        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("should return false if the controller-app is not reachable within the timeout set in NetworkService", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(null);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("should return false if the controller-app has already another app registered to it", async () => {
        //setup
        mockNetworkService.sendCheckRegistration = jest.fn();
        mockNetworkService.sendCheckRegistration.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("with two media-apps (controller + 1 media-app): should return true if everything is reachable", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithTwoMediaApps));

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(true);
    });

    it("with two media-apps (controller + 1 media-app): should return false if the second mediaApp-pc is not reachable with ping", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithTwoMediaApps));
        mockNetworkService.pcRespondsToPing = jest.fn();
        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(true);
        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("with two media-apps (controller + 1 media-app): should return false if the connection to the second mediaApp-pc is not possible", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithTwoMediaApps));

        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.openConnection.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("with two media-apps (controller + 1 media-app): should return false if the second mediaApp-pc is not responding", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithTwoMediaApps));

        mockNetworkService.isMediaAppOnline = jest.fn();
        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(true);
        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("with two media-apps (controller + 1 media-app): should return false if the second mediaApp-pc has already an admin-app registered", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithTwoMediaApps));
        mockNetworkService.sendCheckRegistration = jest.fn();
        mockNetworkService.sendCheckRegistration.mockReturnValueOnce(true);
        mockNetworkService.sendCheckRegistration.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("with three media-apps (controller + 2 media-apps): should return true if everything is reachable", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithThreeMediaApps));

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(true);
    });

    it("with three media-apps (controller + 2 media-apps): should return false if the third mediaApp-pc is not reachable with ping", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithThreeMediaApps));
        mockNetworkService.pcRespondsToPing = jest.fn();
        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(true);
        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(true);
        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("with three media-apps (controller + 2 media-apps): should return false if the connection to the third mediaApp-pc is not possible", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithThreeMediaApps));

        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.openConnection.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("with three media-apps (controller + 2 media-apps): should return false if the third mediaApp-pc is not responding", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithThreeMediaApps));

        mockNetworkService.isMediaAppOnline = jest.fn();
        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(true);
        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("with three media-apps (controller + 2 media-apps): should return false if the third mediaApp-pc has already another admin-app registered", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSONwithThreeMediaApps));

        mockNetworkService.sendCheckRegistration = jest.fn();
        mockNetworkService.sendCheckRegistration.mockReturnValueOnce(true);
        mockNetworkService.sendCheckRegistration.mockReturnValueOnce(false);

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(false);
    });

    it("should return true if the controller-app returned an empty JSON (which means there wasn't saved anything before, so no other media-apps)", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce("{}");

        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(answer).toBe(true);
    });

    it("should disconnect from the controller and close the connection after it received the data", async () => {
        //method to test
        await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(controllerIp);
    });

    it("should call unregisterAndCloseConnection() at the end", async () => {
        //method to test
        answer = await service.checkOnlineStatusOfAllMediaApps(0);

        //tests
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(controllerIp);
    });

    it("should throw an error if the mediaStationId could not be found", async () => {
        //setup
        mockMediaStationRepo.findMediaStation = jest.fn();
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(service.checkOnlineStatusOfAllMediaApps(0)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});