import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {MediaAppService} from "../../../../public_html/js/renderer/mediaClientFramework/services/MediaAppService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MediaApp} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaApp";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";
import {MockNetworkService} from "../../../__mocks__/renderer/mediaClientFramework/services/MockNetworkService";

let mediaAppService:MediaAppService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockNetworkService:MockNetworkService;

let ip:string = "127.0.0.1";
let name:string = "media-App X";
let mediaAppId: number = 0;
let mediaStation: MockMediaStation;
let mediaApp: MediaApp;

function setupMediaAppWithName(repoReturnsMediaStation:boolean, addMediaStation:boolean = true, mediaStationId:number = 0): MediaApp {
    mediaApp = new MediaApp(mediaAppId);
    mediaStation = new MockMediaStation(mediaStationId);

    let answerMap:Map<number, MediaApp> = new Map();
    answerMap.set(0, new MediaApp(0));
    answerMap.set(1, new MediaApp(1));
    mediaStation.getAllMediaApps.mockReturnValue(answerMap);

    mediaApp.ip = ip;
    mediaApp.name = name;

    if(addMediaStation){
        mediaStation.getAllMediaApps.mockReturnValue(answerMap);
        mediaStation.getMediaApp.mockReturnValue(mediaApp);
    }

    mockMediaStationRepo.findMediaStation.mockImplementation((id) => {
        return repoReturnsMediaStation? mediaStation: null;
    });
    return mediaApp;
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
        mediaAppService.createMediaApp(0, ip, name);

        //tests
        expect(mediaStation.addMediaApp).toHaveBeenCalledTimes(1);
        expect(mediaStation.addMediaApp).toHaveBeenCalledWith(mediaAppId,name, ip, MediaApp.ROLE_CONTROLLER);

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
        mediaAppService.createMediaApp(0, ip, name);

        //tests
        expect(mediaStation.addMediaApp).toHaveBeenCalledTimes(1);
        expect(mediaStation.addMediaApp).toHaveBeenCalledWith(mediaAppId,name, ip, MediaApp.ROLE_DEFAULT);
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
        result = mediaAppService.createMediaApp(0, ip, name);

        //tests
        expect(result).toBe(mediaAppId);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        let result:boolean = false;
        mockMediaStationRepo.findMediaStation.mockImplementationOnce((id)=>{
            return null;
        });

        //method to test
        try{
            mediaAppService.createMediaApp(0, ip, name);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
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
        expect(returnValue).toBe(name);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        let result:boolean = false;
        setupMediaAppWithName(false);

        //method to test
        try{
            mediaAppService.getName(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
    });

    it("should throw an error if the MediaApp ID could not be found", ()=>{
        //setup
        let result:boolean = false;
        setupMediaAppWithName(true, false);

        //method to test
        try{
            mediaAppService.getName(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
    });
});

describe("changeName() ", ()=> {
    let newName:string = "newName";
    it("should change the name of the mediaApp", () => {
        //setup
        setupMediaAppWithName(true);

        //method to test
        mediaAppService.changeName(0, mediaAppId, newName);

        console.log("media-app: ", mediaApp)

        //tests
        expect(mediaApp.name).toBe(newName);
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
        let result:boolean = false;
        setupMediaAppWithName(false);

        //method to test
        try{
            mediaAppService.changeName(0, mediaAppId, newName);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
    });

    it("should throw an error if the MediaApp ID could not be found", ()=>{
        //setup
        let result:boolean = false;
        setupMediaAppWithName(true, false);

        //method to test
        try{
            mediaAppService.changeName(0, mediaAppId, newName);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
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
        expect(returnValue).toBe(ip);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        let result:boolean = false;
        setupMediaAppWithName(false);

        //method to test
        try{
            mediaAppService.getIp(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
    });

    it("should throw an error if the MediaApp ID could not be found", ()=>{
        //setup
        let result:boolean = false;
        setupMediaAppWithName(true, false);

        //method to test
        try{
            mediaAppService.getIp(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
    });
});

describe("changeIp() ", ()=> {
    let newIp:string = "newName";
    it("should change the name of the mediaApp", () => {
        //setup
        setupMediaAppWithName(true);

        //method to test
        mediaAppService.changeIp(0, mediaAppId, newIp);

        console.log("media-app: ", mediaApp)

        //tests
        expect(mediaApp.ip).toBe(newIp);
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
        let result:boolean = false;
        setupMediaAppWithName(false);

        //method to test
        try{
            mediaAppService.changeIp(0, mediaAppId, newIp);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
    });

    it("should throw an error if the MediaApp ID could not be found", ()=>{
        //setup
        let result:boolean = false;
        setupMediaAppWithName(true, false);

        //method to test
        try{
            mediaAppService.changeIp(0, mediaAppId, newIp);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
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
        expect(mockNetworkService.openConnection).toHaveBeenCalledWith(ip);

        expect(mockNetworkService.sendRegistration).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendRegistration).toHaveBeenCalledWith(ip);
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
        let result:boolean = false;
        setupMediaAppWithName(false);

        //method to test
        try{
            await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
    });

    it("should throw an error if the MediaApp ID could not be found", async ()=>{
        //setup
        let result:boolean = false;
        setupMediaAppWithName(true, false);

        //method to test
        try{
            await mediaAppService.connectAndRegisterToMediaApp(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
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
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(ip);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        let result:boolean = false;
        setupMediaAppWithName(false);

        //method to test
        try{
            await mediaAppService.unregisterAndCloseMediaApp(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
    });

    it("should throw an error if the MediaApp ID could not be found", async ()=>{
        //setup
        let result:boolean = false;
        setupMediaAppWithName(true, false);

        //method to test
        try{
            await mediaAppService.unregisterAndCloseMediaApp(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
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
        let result:boolean = false;
        setupMediaAppWithName(false);

        //method to test
        try{
            await mediaAppService.isOnline(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
    });

    it("should throw an error if the MediaApp ID could not be found", async ()=>{
        //setup
        let result:boolean = false;
        setupMediaAppWithName(true, false);

        //method to test
        try{
            await mediaAppService.isOnline(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
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
        let result:boolean = false;
        setupMediaAppWithName(false);

        //method to test
        try{
            await mediaAppService.pcRespondsToPing(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
    });

    it("should throw an error if the MediaApp ID could not be found", async ()=>{
        //setup
        let result:boolean = false;
        setupMediaAppWithName(true, false);

        //method to test
        try{
            await mediaAppService.pcRespondsToPing(0, mediaAppId);
        }catch(error){
            result = true;
        }

        //tests
        expect(result).toBe(true);
    });
});