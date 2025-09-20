import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {
    IMediaAppData,
    MediaAppDataService
} from "src/mcf/renderer/services/MediaAppDataService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MediaApp} from "../../../../src/mcf/renderer/dataStructure/MediaApp";
import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";

let mediaAppService: MediaAppDataService;
let mockMediaStationRepo: MockMediaStationRepository;

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

function setupMediaAppWithName(addMediaStation: boolean = true, mediaStationId: number = 0): MediaApp {
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
    mediaStation.mediaAppRegistry.getAll.mockReturnValue(answerMap);

    if (addMediaStation) {
        mediaStation.mediaAppRegistry.getAll.mockReturnValue(answerMap);
        mediaStation.mediaAppRegistry.get.mockReturnValue(mediaApp1);
    }

    mockMediaStationRepo.requireMediaStation.mockImplementation((id) => {
        return  mediaStation;
    });
    return mediaApp1;
}

beforeEach(() => {
    mockMediaStationRepo = new MockMediaStationRepository()
    mediaAppService = new MediaAppDataService(mockMediaStationRepo);
    mediaAppId = 0;
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createMediaApp() ", () => {
    it("should add the newly created MediaApp object to the mediastation (passed by id)", () => {
        let mediaStation: MockMediaStation = new MockMediaStation(0);
        mediaStation.getNextMediaAppId.mockReturnValueOnce(mediaAppId);
        mockMediaStationRepo.requireMediaStation.mockImplementationOnce((id) => {
            return mediaStation;
        });

        mediaAppService.createMediaApp(0, name1, ip1);

        expect(mediaStation.mediaAppRegistry.add).toHaveBeenCalledTimes(1);
        expect(mediaStation.mediaAppRegistry.add).toHaveBeenCalledWith(mediaAppId, name1, ip1, MediaApp.ROLE_CONTROLLER);
    });

    it("should call mediaStationRepository.updateAndSaveMediaStation if media-App ID is 0", () => {
        setupMediaAppWithName( true, 0);
        mediaStation.getNextMediaAppId.mockReturnValueOnce(0);

        mediaAppService.createMediaApp(0, name1, ip1);

        expect(mockMediaStationRepo.updateAndSaveMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateAndSaveMediaStation).toHaveBeenCalledWith(mediaStation);
    });

    it("should call mediaStationRepository.updateMediaStation if media-App ID is higher than 0", () => {
        setupMediaAppWithName( true, 0);
        mediaStation.getNextMediaAppId.mockReturnValueOnce(2);

        mediaAppService.createMediaApp(0, name1, ip1);

        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mediaStation);
    });

    it("should create a mediaApp with the role DEFAULT if the ID is higher than 0", () => {
        let mediaStation: MockMediaStation = new MockMediaStation(0);
        mediaAppId = 1;
        mediaStation.getNextMediaAppId.mockReturnValueOnce(mediaAppId);
        mockMediaStationRepo.requireMediaStation.mockImplementationOnce((id) => {
            return mediaStation;
        });

        mediaAppService.createMediaApp(0, name1, ip1);

        expect(mediaStation.mediaAppRegistry.add).toHaveBeenCalledTimes(1);
        expect(mediaStation.mediaAppRegistry.add).toHaveBeenCalledWith(mediaAppId, name1, ip1, MediaApp.ROLE_DEFAULT);
    });

    it("should return the ID of the newly created mediaApp", async () => {
        let mediaStation: MockMediaStation = new MockMediaStation(0);
        let result: number;
        mediaStation.getNextMediaAppId.mockReturnValueOnce(mediaAppId);
        mockMediaStationRepo.requireMediaStation.mockImplementationOnce((id) => {
            if (id === mediaAppId)
                return mediaStation;
        });

        result = await mediaAppService.createMediaApp(0, ip1, name1);

        expect(result).toBe(mediaAppId);
    });
});

describe("getAllMediaApps() ", () => {
    it("should call mediaStation.getAllMediaApps and convert ip, name and role to a map", () => {
        let returnValue: Map<number, IMediaAppData>;
        setupMediaAppWithName();

        returnValue = mediaAppService.getAllMediaApps(0);

        expect(returnValue.size).toBe(2);
        expect(returnValue.get(0).name).toBe(name1);
        expect(returnValue.get(0).ip).toBe(ip1);
        expect(returnValue.get(0).isController).toBe(true);

        expect(returnValue.get(1).name).toBe(name2);
        expect(returnValue.get(1).ip).toBe(ip2);
        expect(returnValue.get(1).isController).toBe(false);
    });
});

describe("getName() ", () => {
    it("should return the name of the mediaApp", () => {
        let returnValue: string;
        setupMediaAppWithName();

        returnValue = mediaAppService.getName(0, mediaAppId);

        expect(returnValue).toBe(name1);
    });

    it("should throw an error if the MediaApp ID could not be found", () => {
        setupMediaAppWithName( false);

        expect(() => mediaAppService.getName(0, mediaAppId)).toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("changeName() ", () => {
    let newName: string = "newName";
    it("should change the name of the mediaApp", () => {
        setupMediaAppWithName();

        mediaAppService.changeName(0, mediaAppId, newName);

        expect(mediaApp1.name).toBe(newName);
    });

    it("should call mediaStationRepository.updateMediaStation", () => {
        setupMediaAppWithName();

        mediaAppService.changeName(0, mediaAppId, newName);

        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mediaStation);
    });

    it("should throw an error if the MediaApp ID could not be found", () => {
        setupMediaAppWithName(false);

        expect(() => mediaAppService.changeName(0, mediaAppId, newName)).toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("getIp() ", () => {

    it("should return the ip of the mediaApp", () => {
        let returnValue: string;
        setupMediaAppWithName();

        returnValue = mediaAppService.getIp(0, mediaAppId);

        expect(returnValue).toBe(ip1);
    });

    it("should throw an error if the MediaApp ID could not be found", () => {
        setupMediaAppWithName(false);

        expect(() => mediaAppService.getIp(0, mediaAppId)).toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("changeIp() ", () => {
    let newIp: string = "newName";
    it("should change the name of the mediaApp", () => {
        setupMediaAppWithName();

        mediaAppService.changeIp(0, mediaAppId, newIp);

        console.log("media-app: ", mediaApp1)

        expect(mediaApp1.ip).toBe(newIp);
    });

    it("should call mediaStationRepository.updateAndSaveMediaStation if media-App ID is 0", () => {
        setupMediaAppWithName();

        mediaAppService.changeIp(0, mediaAppId, newIp);

        expect(mockMediaStationRepo.updateAndSaveMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateAndSaveMediaStation).toHaveBeenCalledWith(mediaStation);
    });

    it("should call mediaStationRepository.updateMediaStation if media-App ID is higher than 0", () => {
        setupMediaAppWithName( true, 0);
        mediaStation.getMediaApp.mockReturnValue(new MediaApp(1));

        mediaAppService.changeIp(0, 1, newIp);

        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mediaStation);
    });

    it("should throw an error if the MediaApp ID could not be found", async () => {
        setupMediaAppWithName(false);

        await expect(mediaAppService.changeIp(0, mediaAppId, newIp)).rejects.toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});