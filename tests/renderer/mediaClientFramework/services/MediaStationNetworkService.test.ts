import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {MockNetworkService} from "../../../__mocks__/renderer/mediaClientFramework/services/MockNetworkService";
import {
    IOnSyncStep,
    MediaStationNetworkService
} from "../../../../public_html/js/renderer/mediaClientFramework/services/MediaStationNetworkService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";
import {
    ICachedMedia
} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaStationRepository";
import {MediaApp} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaApp";

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
        expect( () => mediaStationNetworkService.downloadContentsOfMediaStation(0)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});

describe("syncMediaStation() ", () => {
    const fileData:Uint8Array = new Uint8Array([0x00, 0xFF, 0xEE, 0xAA])
    let mockMediaStation: MockMediaStation = new MockMediaStation(0);
    let mediaApp1:MediaApp = new MediaApp(0);
    mediaApp1.name = "controller";
    mediaApp1.ip = "127.0.0.1";
    mediaApp1.role = MediaApp.ROLE_CONTROLLER;
    let mediaApp2:MediaApp = new MediaApp(1);
    mediaApp2.name = "second media app";
    mediaApp2.ip = "127.0.0.2";
    mediaApp2.role = MediaApp.ROLE_DEFAULT;

    mockMediaStation.getMediaApp.mockImplementation((id)=>{
        if(id === 0)
            return mediaApp1;
        else if(id === 1)
            return mediaApp2;
        else
            throw new Error("MOCK-ERROR: MEDIA APP ID NOT DEFINED!");
    })

    let mockCachedMedia:ICachedMedia[] = [
        {contentId: 0, mediaAppId: 0, fileExtension: "jpeg"},
        {contentId: 0, mediaAppId: 1, fileExtension: "mp4"},
        {contentId: 2, mediaAppId: 0, fileExtension: "jpeg"},
        {contentId: 3, mediaAppId: 1, fileExtension: "png"},
    ];

    //mock-data
    beforeEach(()=>{

        mockMediaStationRepo.getAllCachedMedia.mockImplementation(()=>{
            let map:Map<number, ICachedMedia[]> = new Map();
            map.set(0, mockCachedMedia);
            return map;
        });

        mockMediaStationRepo.getCachedMedia.mockImplementation((mediaStationId: number, contentId:number, mediaAppId:number, fileExtension:string):Uint8Array =>{
            if(mediaStationId === mockMediaStation.id){
                let passedCMedia:ICachedMedia = {contentId, mediaAppId, fileExtension};

                let foundCachedMedia:ICachedMedia = mockCachedMedia.find(function (cachedMedia:ICachedMedia) {
                    return cachedMedia.mediaAppId === passedCMedia.mediaAppId &&cachedMedia.contentId === passedCMedia.contentId &&cachedMedia.fileExtension === passedCMedia.fileExtension  ;
                });

                if(foundCachedMedia)
                    return fileData;
                else
                    return null;
            }else
                return null;
        });
    })


    it("should call the mockOnSyncStep with the text, that the connection is opening and if it succeeded or not", async() => {
        //setup
        let mockJSON: string = "{mock-json: 1}";
        let ip: string = "192.168.1.1";
        let mockOnSyncStep:IOnSyncStep = jest.fn();

        mockMediaStation.exportToJSON.mockReturnValueOnce(mockJSON);
        mockMediaStation.getControllerIp.mockReturnValueOnce(ip);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve)=>resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve)=>resolve(false)));

        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        expect(mockOnSyncStep).toHaveBeenCalledTimes(4);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(1,"Verbindung mit Medien-App wird aufgebaut: " + mediaApp1.name + "/" + mediaApp1.ip);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(2,"Verbindung mit Medien-App hergestellt!");
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(3,"Verbindung mit Medien-App wird aufgebaut: " + mediaApp2.name + "/" + mediaApp2.ip);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(4,"Verbindung mit Medien-App konnte nicht hergestellt werden!");
    });

    it("should pass the json-string and the controller-ip from the mediaStation object to the network-service", async() => {
        //setup
        let mockJSON: string = "{mock-json: 1}";
        let ip: string = "192.168.1.1";
        let mockOnSyncStep:IOnSyncStep = jest.fn();

        mockMediaStation.exportToJSON.mockReturnValueOnce(mockJSON);
        mockMediaStation.getControllerIp.mockReturnValueOnce(ip);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockNetworkService.openConnection.mockReturnValueOnce(true);

        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledWith(ip, mockJSON);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        let mockOnSyncStep:IOnSyncStep = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});