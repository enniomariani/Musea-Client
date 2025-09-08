import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockNetworkService} from "__mocks__/mcf/renderer/network/MockNetworkService";
import {
    MockMediaStationRepository
} from "__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MediaStationContentsService} from "src/mcf/renderer/services/mediastation/MediaStationContentsService";

let service: MediaStationContentsService;
let mockMediaStationRepo: MockMediaStationRepository;
let mockNetworkService: MockNetworkService;

beforeEach(() => {
    mockNetworkService = new MockNetworkService();
    mockMediaStationRepo = new MockMediaStationRepository();
    service = new MediaStationContentsService(mockNetworkService, mockMediaStationRepo);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("downloadContentsOfMediaStation() ", () => {
    let mockMediaStation: MockMediaStation;
    let answer: string;
    const controllerIp: string = "127.0.0.1";
    const correctJSON: any = {name: "mediaStationX"};

    beforeEach(() => {
        answer = null;
        mockMediaStation = new MockMediaStation(0);

        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.mediaAppRegistry.getControllerIp.mockReturnValueOnce(controllerIp);
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(true);
        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(true);
        mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("yes");
        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("yes");
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSON));
    });

    it("should call mediaStation.importFromJSON with the JSON passed from networkService.getContentFileFrom", async () => {

        answer = await service.downloadContentsOfMediaStation(0, true);

        expect(mockMediaStation.importFromJSON).toHaveBeenCalledTimes(1);
        expect(mockMediaStation.importFromJSON).toHaveBeenCalledWith(correctJSON, true);
        expect(answer).toBe(MediaStationContentsService.CONTENT_DOWNLOAD_SUCCESS + "0");
    });

    it("should return an error if the controller is not reachable with ping", async () => {
        mockNetworkService.pcRespondsToPing = jest.fn();
        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(false);

        answer = await service.downloadContentsOfMediaStation(0, false);

        expect(answer).toBe(MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the connection to the controller could not be opened", async () => {
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(false);

        answer = await service.downloadContentsOfMediaStation(0, false);

        expect(answer).toBe(MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the controller-app is not responding", async () => {
        mockNetworkService.isMediaAppOnline = jest.fn();
        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(false);

        answer = await service.downloadContentsOfMediaStation(0, false);

        expect(answer).toBe(MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the app could not register itself in the controller as admin-app", async () => {
        mockNetworkService.sendRegistrationAdminApp = jest.fn();
        mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce("no");

        answer = await service.downloadContentsOfMediaStation(0, false);

        expect(answer).toBe(MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the app could register itself in the controller as user-app, but is blocked", async () => {
        mockNetworkService.sendRegistrationUserApp = jest.fn();
        mockNetworkService.sendRegistrationUserApp.mockReturnValue("yes_blocked");

        answer = await service.downloadContentsOfMediaStation(0, false,"user");

        expect(answer).toBe(MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_APP_BLOCKED);
    });

    it("should return an error if the app could not register itself in the controller as user-app", async () => {
        mockNetworkService.sendRegistrationUserApp = jest.fn();
        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce("no");

        answer = await service.downloadContentsOfMediaStation(0, false,"user");

        expect(answer).toBe(MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should throw an error if a wrong role-type is passed", async () => {

        await expect(service.downloadContentsOfMediaStation(0, false,"wrongRole")).rejects.toThrowError("Role not valid: wrongRole");
    });

    it("should return an error if the content-file was not received within the timeout set in NetworkService", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(null);

        answer = await service.downloadContentsOfMediaStation(0, true);

        expect(answer).toBe(MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the controller-app returned an empty JSON (which means there wasn't saved any before)", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce("{}");

        answer = await service.downloadContentsOfMediaStation(0, false);

        expect(answer).toBe(MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER + controllerIp);
    });

    it("should return call mediaStation.reset if the controller-app returned an empty JSON", async () => {
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce("{}");

        answer = await service.downloadContentsOfMediaStation(0, false);

        expect(mockMediaStation.reset).toHaveBeenCalledTimes(1);
    });

    it("should return an error if there is no controller-ip specified", async () => {
        mockMediaStation.mediaAppRegistry.getControllerIp = jest.fn();
        mockMediaStation.mediaAppRegistry.getControllerIp.mockReturnValueOnce(null);

        answer = await service.downloadContentsOfMediaStation(0, false);

        expect(answer).toBe(MediaStationContentsService.CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP);
    });

    it("should NOT call unregisterAndCloseConnection() at the end", async () => {

        answer = await service.downloadContentsOfMediaStation(0, false);

        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(0);
    });
});