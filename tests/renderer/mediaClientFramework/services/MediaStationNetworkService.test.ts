import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {MockNetworkService} from "../../../__mocks__/renderer/mediaClientFramework/services/MockNetworkService";
import {
    MediaStationNetworkService
} from "../../../../public_html/js/renderer/mediaClientFramework/services/MediaStationNetworkService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";

let mediaStationNetworkService: MediaStationNetworkService;
let mockMediaStationRepo: MockMediaStationRepository;
let mockNetworkService: MockNetworkService;

beforeEach(() => {
    mockNetworkService = new MockNetworkService();
    mockMediaStationRepo = new MockMediaStationRepository();
    mediaStationNetworkService = new MediaStationNetworkService(mockNetworkService, mockMediaStationRepo);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("downloadContentsOfMediaStation() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(0);

    it("should call mediaStation.importFromJSON with the JSON passed from networkService.getContentFileFrom", async () => {
        //setup
        let answer: string;
        const controllerIp:string = "127.0.0.1";
        const correctJSON:any = {name: "mediaStationX"};
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.getControllerIp.mockReturnValueOnce(controllerIp);
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSON));

        //method to test
        answer = await mediaStationNetworkService.downloadContentsOfMediaStation(0);

        //tests
        expect(mockMediaStation.importFromJSON).toHaveBeenCalledTimes(1);
        expect(mockMediaStation.importFromJSON).toHaveBeenCalledWith(correctJSON);
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_SUCCESS + "0");
    });

    it("should return an error if the controller-app is not reachable within the timeout set in NetworkService", async () => {
        //setup
        let answer: string;
        const controllerIp:string = "127.0.0.1";
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.getControllerIp.mockReturnValueOnce(controllerIp);
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(null);

        //method to test
        answer = await mediaStationNetworkService.downloadContentsOfMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the controller-app returned an empty JSON (which means there wasn't saved any before)", async () => {
        //setup
        let answer: string;
        const controllerIp:string = "127.0.0.1";
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.getControllerIp.mockReturnValueOnce(controllerIp);
        mockNetworkService.getContentFileFrom.mockReturnValueOnce("{}");

        //method to test
        answer = await mediaStationNetworkService.downloadContentsOfMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER + controllerIp);
    });

    it("should return an error if there is no controller-ip specified", async () => {
        //setup
        let answer: string;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.getControllerIp.mockReturnValueOnce(null);

        //method to test
        answer = await mediaStationNetworkService.downloadContentsOfMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect( () => mediaStationNetworkService.syncMediaStation(0)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});

describe("syncMediaStation() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(0);
    it("should pass the json-string and the controller-ip from the mediaStation object to the network-service", async() => {
        //setup
        let mockJSON: string = "{mock-json: 1}";
        let ip: string = "192.168.1.1";

        mockMediaStation.exportToJSON.mockReturnValueOnce(mockJSON);
        mockMediaStation.getControllerIp.mockReturnValueOnce(ip);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockNetworkService.openConnection.mockReturnValueOnce(true);

        //method to test
        await mediaStationNetworkService.syncMediaStation(0);

        //tests
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledWith(ip, mockJSON);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => mediaStationNetworkService.syncMediaStation(0)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});