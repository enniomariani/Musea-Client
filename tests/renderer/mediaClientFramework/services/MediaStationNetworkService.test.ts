import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {MockNetworkService} from "../../../__mocks__/renderer/mediaClientFramework/services/MockNetworkService";
import {
    IOnSyncStep,
    MediaStationNetworkService
} from "../../../../src/js/renderer/mediaClientFramework/services/MediaStationNetworkService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";
import {
    ICachedMedia
} from "../../../../src/js/renderer/mediaClientFramework/dataStructure/MediaStationRepository";
import {MediaApp} from "../../../../src/js/renderer/mediaClientFramework/dataStructure/MediaApp";
import {MockFolder} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockFolder";
import {MockContent} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockContent";
import {Image} from "../../../../src/js/renderer/mediaClientFramework/dataStructure/Media";

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

describe("downloadOnlyMediaAppDataFromMediaStation() ", () => {
    let mockMediaStation: MockMediaStation ;
    let answer: string;
    const controllerIp: string = "127.0.0.1";
    const correctJSON: any = {name: "mediaStationX"};

    beforeEach(() => {
        answer = null;
        mockMediaStation = new MockMediaStation(0);

        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.getControllerIp.mockReturnValueOnce(controllerIp);
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.sendRegistration.mockReturnValueOnce(true);
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSON));
    });

    it("should call mediaStation.importFromJSON with the JSON passed from networkService.getContentFileFrom", async () => {
        //method to test
        answer = await mediaStationNetworkService.downloadOnlyMediaAppDataFromMediaStation(0);

        //tests
        expect(mockMediaStation.importMediaAppsFromJSON).toHaveBeenCalledTimes(1);
        expect(mockMediaStation.importMediaAppsFromJSON).toHaveBeenCalledWith(correctJSON);
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_SUCCESS + "0");
    });

    it("should disconnect from the controller and close the connection after it received the data", async () => {
        //method to test
        await mediaStationNetworkService.downloadOnlyMediaAppDataFromMediaStation(0);

        //tests
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(controllerIp);
    });


    it("should return an error if the connection to the controller could not be opened", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(false);

        //method to test
        answer = await mediaStationNetworkService.downloadOnlyMediaAppDataFromMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the app could not register itself in the controller", async () => {
        //setup
        mockNetworkService.sendRegistration = jest.fn();
        mockNetworkService.sendRegistration.mockReturnValueOnce(false);

        //method to test
        answer = await mediaStationNetworkService.downloadOnlyMediaAppDataFromMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the controller-app is not reachable within the timeout set in NetworkService", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(null);

        //method to test
        answer = await mediaStationNetworkService.downloadOnlyMediaAppDataFromMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the controller-app returned an empty JSON (which means there wasn't saved any before)", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce("{}");

        //method to test
        answer = await mediaStationNetworkService.downloadOnlyMediaAppDataFromMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER + controllerIp);
    });

    it("should call unregisterAndCloseConnection() at the end", async () => {
        //method to test
        answer = await mediaStationNetworkService.downloadOnlyMediaAppDataFromMediaStation(0);

        //tests
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledWith(controllerIp);
    });

    it("should return an error if there is no controller-ip specified", async () => {
        //setup
        mockMediaStation.getControllerIp = jest.fn();
        mockMediaStation.getControllerIp.mockReturnValueOnce(null);

        //method to test
        answer = await mediaStationNetworkService.downloadOnlyMediaAppDataFromMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation = jest.fn();
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => mediaStationNetworkService.downloadOnlyMediaAppDataFromMediaStation(0)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});

describe("downloadContentsOfMediaStation() ", () => {
    let mockMediaStation: MockMediaStation ;
    let answer: string;
    const controllerIp: string = "127.0.0.1";
    const correctJSON: any = {name: "mediaStationX"};

    beforeEach(() => {
        answer = null;
        mockMediaStation = new MockMediaStation(0);

        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.getControllerIp.mockReturnValueOnce(controllerIp);
        mockNetworkService.openConnection.mockReturnValueOnce(true);
        mockNetworkService.sendRegistration.mockReturnValueOnce(true);
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(JSON.stringify(correctJSON));
    });

    it("should call mediaStation.importFromJSON with the JSON passed from networkService.getContentFileFrom", async () => {
        //method to test
        answer = await mediaStationNetworkService.downloadContentsOfMediaStation(0);

        //tests
        expect(mockMediaStation.importFromJSON).toHaveBeenCalledTimes(1);
        expect(mockMediaStation.importFromJSON).toHaveBeenCalledWith(correctJSON);
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_SUCCESS + "0");
    });

    it("should return an error if the connection to the controller could not be opened", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(false);

        //method to test
        answer = await mediaStationNetworkService.downloadContentsOfMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the app could not register itself in the controller", async () => {
        //setup
        mockNetworkService.sendRegistration = jest.fn();
        mockNetworkService.sendRegistration.mockReturnValueOnce(false);

        //method to test
        answer = await mediaStationNetworkService.downloadContentsOfMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the content-file was not received within the timeout set in NetworkService", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce(null);

        //method to test
        answer = await mediaStationNetworkService.downloadContentsOfMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM + controllerIp);
    });

    it("should return an error if the controller-app returned an empty JSON (which means there wasn't saved any before)", async () => {
        //setup
        mockNetworkService.getContentFileFrom = jest.fn();
        mockNetworkService.getContentFileFrom.mockReturnValueOnce("{}");

        //method to test
        answer = await mediaStationNetworkService.downloadContentsOfMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER + controllerIp);
    });

    it("should return an error if there is no controller-ip specified", async () => {
        //setup
        mockMediaStation.getControllerIp = jest.fn();
        mockMediaStation.getControllerIp.mockReturnValueOnce(null);

        //method to test
        answer = await mediaStationNetworkService.downloadContentsOfMediaStation(0);

        //tests
        expect(answer).toBe(MediaStationNetworkService.CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP);
    });

    it("should NOT call unregisterAndCloseConnection() at the end", async () => {
        //setup

        //method to test
        answer = await mediaStationNetworkService.downloadContentsOfMediaStation(0);

        //tests
        expect(mockNetworkService.unregisterAndCloseConnection).toHaveBeenCalledTimes(0);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation = jest.fn();
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => mediaStationNetworkService.downloadContentsOfMediaStation(0)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});

describe("syncMediaStation() ", () => {
    //it's a complex method, so a lot of setup is necesary!!!

    const fileData: Uint8Array = new Uint8Array([0x00, 0xFF, 0xEE, 0xAA])
    let mockMediaStation: MockMediaStation = new MockMediaStation(0);
    let controllerIp: string = "192.168.1.1";
    let mockJSON: string = "{mock-json: 1}";
    let mockOnSyncStep: IOnSyncStep;
    let mockContent0: MockContent;
    let mockContent2: MockContent;
    let image1: Image;
    let image2: Image;
    let mocksCalled:string[];

    let mediaApp1: MediaApp = new MediaApp(0);
    mediaApp1.name = "controller";
    mediaApp1.ip = "127.0.0.1";
    let mediaApp2: MediaApp = new MediaApp(1);
    mediaApp2.name = "second media app";
    mediaApp2.ip = "127.0.0.2";

    mockMediaStation.getMediaApp.mockImplementation((id) => {
        if (id === 0) return mediaApp1;
        else if (id === 1) return mediaApp2;
        else throw new Error("MOCK-ERROR: MEDIA APP ID NOT DEFINED!");
    });

    let mockCachedMedia: ICachedMedia[] = [
        {contentId: 0, mediaAppId: 0, fileExtension: "jpeg"},
        {contentId: 0, mediaAppId: 1, fileExtension: "mp4"},
        {contentId: 2, mediaAppId: 0, fileExtension: "jpeg"},
        {contentId: 3, mediaAppId: 1, fileExtension: "png"},
    ];

    //mock-data
    beforeEach(() => {
        mocksCalled = [];
        mockOnSyncStep = jest.fn();

        mockMediaStationRepo.getAllCachedMedia.mockImplementation(() => {
            mocksCalled.push("mockMediaStationRepo.getAllCachedMedia");
            let map: Map<number, ICachedMedia[]> = new Map();
            map.set(0, mockCachedMedia);
            return map;
        });

        mockMediaStationRepo.getCachedMediaFile.mockImplementation((mediaStationId: number, contentId: number, mediaAppId: number, fileExtension: string): Uint8Array => {
            mocksCalled.push("mockMediaStationRepo.getCachedMediaFile");
            if (mediaStationId === mockMediaStation.id) {
                let passedCMedia: ICachedMedia = {contentId, mediaAppId, fileExtension};

                let foundCachedMedia: ICachedMedia = mockCachedMedia.find(function (cachedMedia: ICachedMedia) {
                    return cachedMedia.mediaAppId === passedCMedia.mediaAppId && cachedMedia.contentId === passedCMedia.contentId && cachedMedia.fileExtension === passedCMedia.fileExtension;
                });

                if (foundCachedMedia) return fileData;
                else return null;
            } else
                return null;
        });

        mockMediaStationRepo.getCachedMediaFile.mockImplementation((mediaStationId: number, contentId: number, mediaAppId: number, fileExtension: string): Promise<Uint8Array | null> => {
            mocksCalled.push("mockMediaStationRepo.getCachedMediaFile");
            let foundCachedMedia: ICachedMedia = mockCachedMedia.find(function (cachedMedia: ICachedMedia) {
                return cachedMedia.mediaAppId === mediaAppId && cachedMedia.contentId === contentId && cachedMedia.fileExtension === fileExtension;
            });
            if (mediaStationId === 0 && foundCachedMedia)
                return new Promise((resolve) => resolve(fileData));
            else
                return new Promise((resolve) => resolve(null));
        });
        let counter:number = 0;
        mockNetworkService.sendMediaFileToIp.mockImplementation(() => {
            mocksCalled.push("mockNetworkService.sendMediaFileToIp");
            if(counter === 0){
                counter++;
                return 99;
            }else
                return null;
        });

        image1 = new Image();
        image1.idOnMediaApp = -1;
        image2 = new Image();
        image2.idOnMediaApp = -1;

        mockContent0 = new MockContent(0);
        mockContent2 = new MockContent(2);
        mockContent0.media.set(0, image1)
        mockContent2.media.set(0, image2)
        mockMediaStation.rootFolder = new MockFolder(0);

        mockMediaStation.rootFolder.findContent.mockImplementation((contentId: number) => {
            mocksCalled.push("mockMediaStation.rootFolder.findContent");
            if (contentId === 0) return mockContent0;
            else if (contentId === 2) return mockContent2;
            else return null;
        });

        mockMediaStation.exportToJSON.mockImplementation(()=>{
            mocksCalled.push("mockMediaStation.exportToJSON");
            return mockJSON
        });

        mockMediaStationRepo.findMediaStation.mockReturnValue(mockMediaStation);
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(false)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));

        mockMediaStation.getControllerIp.mockReturnValueOnce(controllerIp);
    });

    it("should call the callback mockOnSyncStep with the text, that the connection is opening and if it succeeded or not", async () => {
        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(1, "Verbindung mit Medien-App wird aufgebaut: " + mediaApp1.name + "/" + mediaApp1.ip);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(2, "Verbindung mit Medien-App hergestellt.");
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(7, "Verbindung mit Medien-App wird aufgebaut: " + mediaApp2.name + "/" + mediaApp2.ip);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(8, "Verbindung mit Medien-App konnte nicht hergestellt werden!");
    });

    it("should send the file-data to the media-app if the connection is open", async () => {
        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        expect(mockNetworkService.sendMediaFileToIp).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendMediaFileToIp).toHaveBeenNthCalledWith(1, mediaApp1.ip, mockCachedMedia[0].fileExtension, fileData);
        expect(mockNetworkService.sendMediaFileToIp).toHaveBeenNthCalledWith(2, mediaApp1.ip, mockCachedMedia[2].fileExtension, fileData);
    });

    it("if it got a media-ID back from the media-App, set the ID of the media-object to this ID", async () => {
        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        expect(image1.idOnMediaApp).toBe(99);
        expect(image2.idOnMediaApp).toBe(-1);
    });

    it("it should NOT throw if mediaStationRepo.getAllCachedMedia() returns an empty Map", async () => {
        //setup
        mockMediaStationRepo.getAllCachedMedia = jest.fn();
        mockMediaStationRepo.getAllCachedMedia.mockImplementation(() => {
            let map: Map<number, ICachedMedia[]> = new Map();
            return map;
        });
        //test
        await expect(mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep)).resolves.not.toThrow();
    });

    it("should call the callback mockOnSyncStep with the text, that it is trying to send a media and if it succeeded or not", async () => {
        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(3, "Medium wird gesendet: " + mockCachedMedia[0].fileExtension);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(4, "Medium erfolgreich gesendet.");
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(5, "Medium wird gesendet: " + mockCachedMedia[2].fileExtension);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(6, "Medium konnte nicht gesendet oder empfangen werden!");
    });

    it("call mediaStationRepo.deleteCachedMedia for every media that got succesfully sent to the media-app", async () => {
        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        expect(mockMediaStationRepo.deleteCachedMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.deleteCachedMedia).toHaveBeenCalledWith( 0,0, 0);
    })

    it("should call the callback mockOnSyncStep with the text, that it is trying to send data to the controller", async () => {
        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(9, "Sende contents.json an Controller-App: " + controllerIp);
    });

    it("should call the callback mockOnSyncStep with a text if the connection to the controller could not be opened", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        //mock that no connection could be opened
        mockNetworkService.openConnection.mockReturnValue(new Promise((resolve) => resolve(false)));

        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(6, "Controller-App nicht erreichbar!");
    });

    it("should call the callback mockOnSyncStep with a text if the connection to the controller could be opened", async () => {
        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(10, "Verbindung mit Controller-App hergestellt. Sende Daten...");
    });

    it("should pass the json-string and the controller-ip from the mediaStation object to the network-service, if controller is reachable", async () => {
        //setup

        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledWith(controllerIp, mockJSON);
    });

    it("sending the JSON should be the last thing to do in the method", async () => {
        //method to test
        await mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep);

        //tests
        console.log("mock calls: ",mocksCalled)
        expect(mocksCalled.indexOf("mockMediaStation.exportToJSON")).toBe(mocksCalled.length - 1);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation = jest.fn();
        mockMediaStationRepo.findMediaStation.mockReturnValue(null);

        //tests
        expect(() => mediaStationNetworkService.syncMediaStation(0, mockOnSyncStep)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});