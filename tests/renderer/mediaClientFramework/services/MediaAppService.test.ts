import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {
    IMediaAppData,
    MediaAppService
} from "../../../../src/js/renderer/mediaClientFramework/services/MediaAppService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MediaApp} from "../../../../src/js/renderer/mediaClientFramework/dataStructure/MediaApp";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";
import {MockNetworkService} from "../../../__mocks__/renderer/mediaClientFramework/services/MockNetworkService";

let mediaAppService:MediaAppService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockNetworkService:MockNetworkService;

let ip1:string = "127.0.0.1";
let name1:string = "media-App X";
let role1:string = MediaApp.ROLE_CONTROLLER;

let ip2:string = "127.0.0.2";
let name2:string = "media-App 2";
let role2:string = MediaApp.ROLE_DEFAULT;


let mediaAppId: number = 0;
let mediaStation: MockMediaStation;
let mediaApp1: MediaApp;
let mediaApp2: MediaApp;

function setupMediaAppWithName(repoReturnsMediaStation:boolean, addMediaStation:boolean = true, mediaStationId:number = 0): MediaApp {
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

    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, mediaApp1);
    answerMap.set(1, mediaApp2);
    mediaStation.getAllMediaApps.mockReturnValue(answerMap);

    if(addMediaStation){
        mediaStation.getAllMediaApps.mockReturnValue(answerMap);
        mediaStation.getMediaApp.mockReturnValue(mediaApp1);
    }

    mockMediaStationRepo.findMediaStation.mockImplementation((id) => {
        return repoReturnsMediaStation? mediaStation: null;
    });
    return mediaApp1;
}

beforeEach(() => {
    mockNetworkService = new MockNetworkService()
    mockMediaStationRepo = new MockMediaStationRepository()
    mediaAppService = new MediaAppService(mockMediaStationRepo, mockNetworkService);
    mediaAppId = 0;
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createMediaApp() ", ()=>{
    it("should add the newly created MediaApp object to the mediastation (passed by id)", ()=>{
        //setup
        let mediaStation:MockMediaStation = new MockMediaStation(0);
        mediaStation.getNextMediaAppId.mockReturnValueOnce(mediaAppId);
        mockMediaStationRepo.findMediaStation.mockImplementationOnce((id)=>{
            return mediaStation;
        });

        //method to test
        mediaAppService.createMediaApp(0, name1, ip1);

        //tests
        expect(mediaStation.addMediaApp).toHaveBeenCalledTimes(1);
        expect(mediaStation.addMediaApp).toHaveBeenCalledWith(mediaAppId,name1, ip1, MediaApp.ROLE_CONTROLLER);

        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mediaStation);
    });

    it("should create a mediaApp with the role DEFAULT if the ID is higher than 0", ()=>{
        //setup
        let mediaStation:MockMediaStation = new MockMediaStation(0);
        mediaAppId = 1;
        mediaStation.getNextMediaAppId.mockReturnValueOnce(mediaAppId);
        mockMediaStationRepo.findMediaStation.mockImplementationOnce((id)=>{
            return mediaStation;
        });

        //method to test
        mediaAppService.createMediaApp(0, name1, ip1);

        //tests
        expect(mediaStation.addMediaApp).toHaveBeenCalledTimes(1);
        expect(mediaStation.addMediaApp).toHaveBeenCalledWith(mediaAppId,name1, ip1, MediaApp.ROLE_DEFAULT);
    });

    it("should return the ID of the newly created mediaApp", ()=>{
        //setup
        let mediaStation:MockMediaStation = new MockMediaStation(0);
        let result:number;
        mediaStation.getNextMediaAppId.mockReturnValueOnce(mediaAppId);
        mockMediaStationRepo.findMediaStation.mockImplementationOnce((id)=>{
            if(id === mediaAppId)
                return mediaStation;
        });

        //method to test
        result = mediaAppService.createMediaApp(0, ip1, name1);

        //tests
        expect(result).toBe(mediaAppId);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockImplementationOnce((id)=>{
            return null;
        });

        //tests
        expect(()=>mediaAppService.createMediaApp(0, ip1, name1)).toThrow(Error("Mediastation with this ID does not exist: 0"));
    });
});

describe("getAllMediaApps() ", ()=> {
    it("should call mediaStation.getAllMediaApps and convert ip, name and role to a map", () => {
        //setup
        let returnValue:Map<number, IMediaAppData>;
        setupMediaAppWithName(true);

        //method to test
        returnValue = mediaAppService.getAllMediaApps(0);

        //tests
        expect(returnValue.size).toBe(2);
        expect(returnValue.get(0).name).toBe(name1);
        expect(returnValue.get(0).ip).toBe(ip1);
        expect(returnValue.get(0).isController).toBe(true);

        expect(returnValue.get(1).name).toBe(name2);
        expect(returnValue.get(1).ip).toBe(ip2);
        expect(returnValue.get(1).isController).toBe(false);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(()=>mediaAppService.getAllMediaApps(0)).toThrow(Error("Mediastation with this ID does not exist: 0"));
    });
});

describe("getName() ", ()=> {
    it("should return the name of the mediaApp", () => {
        //setup
        let returnValue:string;
        setupMediaAppWithName(true);

        //method to test
        returnValue = mediaAppService.getName(0, mediaAppId);

        //tests
        expect(returnValue).toBe(name1);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(()=>mediaAppService.getName(0, mediaAppId)).toThrow(Error("Mediastation with this ID does not exist: 0"));
    });

    it("should throw an error if the MediaApp ID could not be found", ()=>{
        //setup
        setupMediaAppWithName(true, false);

        //tests
        expect(()=>mediaAppService.getName(0, mediaAppId)).toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("changeName() ", ()=> {
    let newName:string = "newName";
    it("should change the name of the mediaApp", () => {
        //setup
        setupMediaAppWithName(true);

        //method to test
        mediaAppService.changeName(0, mediaAppId, newName);

        console.log("media-app: ", mediaApp1)

        //tests
        expect(mediaApp1.name).toBe(newName);
    });

    it("should call mediaStationRepository.updateMediaStation", () => {
        //setup
        setupMediaAppWithName(true);

        //method to test
        mediaAppService.changeName(0, mediaAppId, newName);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(()=>mediaAppService.changeName(0, mediaAppId, newName)).toThrow(Error("Mediastation with this ID does not exist: 0"));

    });

    it("should throw an error if the MediaApp ID could not be found", ()=>{
        //setup
        setupMediaAppWithName(true, false);

        //tests
        expect(()=>mediaAppService.changeName(0, mediaAppId, newName)).toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("getIp() ", ()=> {

    it("should return the ip of the mediaApp", () => {
        //setup
        let returnValue:string;
        setupMediaAppWithName(true);

        //method to test
        returnValue = mediaAppService.getIp(0, mediaAppId);

        //tests
        expect(returnValue).toBe(ip1);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(()=>mediaAppService.getIp(0, mediaAppId)).toThrow(Error("Mediastation with this ID does not exist: 0"));
    });

    it("should throw an error if the MediaApp ID could not be found", ()=>{
        //setup
        setupMediaAppWithName(true, false);

        //tests
        expect(()=>mediaAppService.getIp(0, mediaAppId)).toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("changeIp() ", ()=> {
    let newIp:string = "newName";
    it("should change the name of the mediaApp", () => {
        //setup
        setupMediaAppWithName(true);

        //method to test
        mediaAppService.changeIp(0, mediaAppId, newIp);

        console.log("media-app: ", mediaApp1)

        //tests
        expect(mediaApp1.ip).toBe(newIp);
    });

    it("should call mediaStationRepository.updateAndSaveMediaStation if media-App ID is 0", () => {
        //setup
        setupMediaAppWithName(true);

        //method to test
        mediaAppService.changeIp(0, mediaAppId, newIp);

        //tests
        expect(mockMediaStationRepo.updateAndSaveMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateAndSaveMediaStation).toHaveBeenCalledWith(mediaStation);
    });

    it("should call mediaStationRepository.updateMediaStation if media-App ID is higher than 0", () => {
        //setup
        setupMediaAppWithName(true, true, 0);
        mediaStation.getMediaApp.mockReturnValue(new MediaApp(1));

        //method to test
        mediaAppService.changeIp(0, 1, newIp);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(()=>mediaAppService.changeIp(0, mediaAppId, newIp)).toThrow(Error("Mediastation with this ID does not exist: 0"));
    });

    it("should throw an error if the MediaApp ID could not be found", ()=>{
        //setup
        setupMediaAppWithName(true, false);

        //tests
        expect(()=>mediaAppService.changeIp(0, mediaAppId, newIp)).toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("connectAndRegisterToMediaApp() ", ()=> {

    it("should call networkService.openConnection and sendRegistration", async () => {
        //setup
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.sendRegistration.mockReturnValueOnce(true);
        setupMediaAppWithName(true);

        //method to test
        await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId);

        //tests
        expect(mockNetworkService.openConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.openConnection).toHaveBeenCalledWith(ip1);

        expect(mockNetworkService.sendRegistration).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendRegistration).toHaveBeenCalledWith(ip1);
    });

    it("should return true if the connection could be established and the registration was accepted", async () => {
        //setup
        let answer:boolean;
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.sendRegistration.mockReturnValueOnce(true);
        setupMediaAppWithName(true);

        //method to test
        answer = await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId);

        //tests
        expect(answer).toBe(true);
    });

    it("should return false if the connection could not been established", async () => {
        //setup
        let answer:boolean;
        mockNetworkService.openConnection.mockReturnValueOnce(false);
        mockNetworkService.sendRegistration.mockReturnValueOnce(true);
        setupMediaAppWithName(true);

        //method to test
        answer = await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId);

        //tests
        expect(answer).toBe(false);
    });

    it("should return false if the connection could be established but the registration was rejected", async () => {
        //setup
        let answer:boolean;
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.sendRegistration.mockReturnValueOnce(false);
        setupMediaAppWithName(true);

        //method to test
        answer = await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId);

        //tests
        expect(answer).toBe(false);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId)).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));
    });

    it("should throw an error if the MediaApp ID could not be found", async ()=>{
        //setup
        setupMediaAppWithName(true, false);

        //tests
        expect(mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId)).rejects.toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("unregisterAndCloseMediaApp() ", ()=> {

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

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(mediaAppService.unregisterAndCloseMediaApp(0, mediaAppId)).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));

    });

    it("should throw an error if the MediaApp ID could not be found", async ()=>{
        //setup
        setupMediaAppWithName(true, false);

        //tests
        expect(mediaAppService.unregisterAndCloseMediaApp(0, mediaAppId)).rejects.toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("isOnline() ", ()=> {

    it("should return true if networkService.isMediaAppOnline returns true", async () => {
        //setup
        let returnValue:boolean;
        setupMediaAppWithName(true);

        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(true);

        //method to test
        returnValue = await mediaAppService.isOnline(0, mediaAppId);

        //tests
        expect(returnValue).toBe(true);
    });

    it("should return true if networkService.isMediaAppOnline returns false", async () => {
        //setup
        let returnValue:boolean;
        setupMediaAppWithName(true);

        mockNetworkService.isMediaAppOnline.mockReturnValueOnce(false);

        //method to test
        returnValue = await mediaAppService.isOnline(0, mediaAppId);

        //tests
        expect(returnValue).toBe(false);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(mediaAppService.isOnline(0, mediaAppId)).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));
    });

    it("should throw an error if the MediaApp ID could not be found", async ()=>{
        //setup
        setupMediaAppWithName(true, false);

        //tests
        expect(mediaAppService.isOnline(0, mediaAppId)).rejects.toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});

describe("pcRespondsToPing() ", ()=> {

    it("should return true if networkService.pcRespondsToPing returns true", async () => {
        //setup
        let returnValue:boolean;
        setupMediaAppWithName(true);

        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(true);

        //method to test
        returnValue = await mediaAppService.pcRespondsToPing(0, mediaAppId);

        //tests
        expect(returnValue).toBe(true);
    });

    it("should return true if networkService.pcRespondsToPing returns false", async () => {
        //setup
        let returnValue:boolean;
        setupMediaAppWithName(true);

        mockNetworkService.pcRespondsToPing.mockReturnValueOnce(false);

        //method to test
        returnValue = await mediaAppService.pcRespondsToPing(0, mediaAppId);

        //tests
        expect(returnValue).toBe(false);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        setupMediaAppWithName(false);

        //tests
        expect(mediaAppService.pcRespondsToPing(0, mediaAppId)).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));
    });

    it("should throw an error if the MediaApp ID could not be found", async ()=>{
        //setup
        setupMediaAppWithName(true, false);

        //tests
        expect(mediaAppService.pcRespondsToPing(0, mediaAppId)).rejects.toThrow(Error("Media-App with this ID does not exist: 0"));
    });
});