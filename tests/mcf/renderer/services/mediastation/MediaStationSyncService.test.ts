import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockNetworkService} from "__mocks__/mcf/renderer/services/MockNetworkService";
import {
    MockMediaStationRepository
} from "__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {
    ICachedMedia
} from "@app/mcf/renderer/dataStructure/MediaStationRepository";
import {MediaApp} from "@app/mcf/renderer/dataStructure/MediaApp";
import {MockFolder} from "__mocks__/mcf/renderer/dataStructure/MockFolder";
import {MockContent} from "__mocks__/mcf/renderer/dataStructure/MockContent";
import {Image} from "@app/mcf/renderer/dataStructure/Media";
import {IOnSyncStep, MediaStationSyncService} from "@app/mcf/renderer/services/mediastation/MediaStationSyncService";

let service: MediaStationSyncService;
let mockMediaStationRepo: MockMediaStationRepository;
let mockNetworkService: MockNetworkService;

beforeEach(() => {
    mockNetworkService = new MockNetworkService();
    mockMediaStationRepo = new MockMediaStationRepository();
    service = new MediaStationSyncService(mockNetworkService, mockMediaStationRepo);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("sync() ", () => {
    //it's a complex method, so a lot of setup is necesary!!!

    const fileData: Uint8Array = new Uint8Array([0x00, 0xFF, 0xEE, 0xAA])
    let mockMediaStation: MockMediaStation = new MockMediaStation(0);
    let controllerIp: string = "192.168.1.1";
    let mockJSON: string = "{mock-json: 1}";
    let mockOnSyncStep: IOnSyncStep;
    let mockContent0: MockContent;
    let mockContent2: MockContent;
    let mockContent3: MockContent;
    let image1: Image;
    let image2: Image;
    let mocksCalled: string[];

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

        mockMediaStationRepo.getAllMediaIDsToDelete.mockImplementation(() => {
            mocksCalled.push("mockMediaStationRepo.getAllMediaIDsToDelete");
            let map: Map<number, number[]> = new Map();
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
        let counter: number = 0;
        mockNetworkService.sendMediaFileToIp.mockImplementation(() => {
            mocksCalled.push("mockNetworkService.sendMediaFileToIp");
            if (counter === 0) {
                counter++;
                return 99;
            } else
                return null;
        });

        image1 = new Image();
        image1.idOnMediaApp = -1;
        image2 = new Image();
        image2.idOnMediaApp = -1;

        mockContent0 = new MockContent(0, 0);
        mockContent2 = new MockContent(2, 1);
        mockContent3 = new MockContent(3, 1);
        mockContent0.media.set(0, image1)
        mockContent0.media.set(1, image1);

        mockContent2.media.set(0, image2)
        mockContent2.media.set(1, image2);

        mockContent3.media.set(0, image1)
        mockContent3.media.set(1, image1);

        mockMediaStation.rootFolder = new MockFolder(0);

        mockMediaStation.rootFolder.findContent.mockImplementation((contentId: number) => {
            mocksCalled.push("mockMediaStation.rootFolder.findContent");
            if (contentId === 0) return mockContent0;
            else if (contentId === 2) return mockContent2;
            else if (contentId === 3) return mockContent3;
            else return null;
        });

        mockMediaStation.exportToJSON.mockImplementation(() => {
            mocksCalled.push("mockMediaStation.exportToJSON");
            return mockJSON
        });

        mockMediaStationRepo.removeCachedMediaStation.mockImplementation(() => {
            mocksCalled.push("mockContentFileService.deleteFile");
        });

        mockMediaStationRepo.requireMediaStation.mockReturnValue(mockMediaStation);
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(false)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));

        mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));
        mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));
        mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));

        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));
        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));
        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));

        mockMediaStation.getControllerIp.mockReturnValueOnce(controllerIp);
    });

    it("should call the callback mockOnSyncStep with the text, that the connection is opening and if it succeeded or not", async () => {
        //method to test
        let answer: boolean = await service.sync(0, mockOnSyncStep);

        //tests
        expect(answer).toBe(false)
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(1, "Verbindung mit Medien-App wird aufgebaut: " + mediaApp1.name + "/" + mediaApp1.ip);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(2, "Verbindung mit Medien-App hergestellt.");
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(9, "Verbindung mit Medien-App wird aufgebaut: " + mediaApp2.name + "/" + mediaApp2.ip);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(10, "Verbindung mit Medien-App konnte nicht hergestellt werden!");
    });

    it("should send the file-data to the media-app if the connection is open", async () => {
        //method to test
        await service.sync(0, mockOnSyncStep);

        //tests
        expect(mockNetworkService.sendMediaFileToIp).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendMediaFileToIp).toHaveBeenNthCalledWith(1, mediaApp1.ip, mockCachedMedia[0].fileExtension, fileData, 240000, mockOnSyncStep);
        expect(mockNetworkService.sendMediaFileToIp).toHaveBeenNthCalledWith(2, mediaApp1.ip, mockCachedMedia[2].fileExtension, fileData, 240000, mockOnSyncStep);
    });

    it("if it got a media-ID back from the media-App, set the ID of the media-object to this ID", async () => {
        //method to test
        await service.sync(0, mockOnSyncStep);

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
        await expect(service.sync(0, mockOnSyncStep)).resolves.not.toThrow();
    });

    it("should call the callback mockOnSyncStep with the text, that it is trying to send a media and if it succeeded or not", async () => {
        //method to test
        let answer: boolean = await service.sync(0, mockOnSyncStep);

        //tests
        expect(answer).toBe(false);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(3, "Lade Medium: " + mockCachedMedia[0].fileExtension);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(4, "Medium geladen, sende...");
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(5, "Medium erfolgreich gesendet.");
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(6, "Lade Medium: " + mockCachedMedia[0].fileExtension);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(7, "Medium geladen, sende...");
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(8, "Medium konnte nicht gesendet oder empfangen werden!");
    });

    it("should call the callback mockOnSyncStep with a text that the registration failed, if it failed for a media-app as admin-app", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.sendRegistrationAdminApp = jest.fn();
        mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));
        mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce(new Promise((resolve) => resolve("no")));
        mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));


        //method to test
        let answer: boolean = await service.sync(0, mockOnSyncStep);

        //tests
        expect(answer).toBe(false);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(10, "Medien-App ist erreichbar, aber von einer anderen App blockiert.");
    });

    it("should call the callback mockOnSyncStep with a text that the registration failed, if it failed for a media-app as USER-app", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.sendRegistrationUserApp = jest.fn();
        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));
        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce(new Promise((resolve) => resolve("no")));
        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));

        //method to test
        let answer: boolean = await service.sync(0, mockOnSyncStep, "user");

        //tests
        expect(answer).toBe(false);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(10, "Medien-App ist erreichbar, aber von einer anderen App blockiert.");
    });

    it("call mediaStationRepo.deleteCachedMedia for every media that got succesfully sent to the media-app", async () => {
        //method to test
        await service.sync(0, mockOnSyncStep);

        //tests
        expect(mockMediaStationRepo.deleteCachedMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.deleteCachedMedia).toHaveBeenCalledWith(0, 0, 0);
    })

    it("call networkService.sendDeleteMediaTo for every id that is marked to delete in the mediastation repo", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));

        mockMediaStationRepo.getAllMediaIDsToDelete = jest.fn();
        mockMediaStationRepo.getAllMediaIDsToDelete.mockImplementation(() => {
            mocksCalled.push("mockMediaStationRepo.getAllMediaIDsToDelete");
            let map: Map<number, number[]> = new Map();
            map.set(0, [3, 0]);
            map.set(1, [6]);
            return map;
        });

        //method to test
        await service.sync(0, mockOnSyncStep);

        //tests
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, 3);
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenNthCalledWith(2, mediaApp1.ip, 0);
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenNthCalledWith(3, mediaApp2.ip, 6);
    })

    it("call mediaStationRepo.deleteStoredMediaID for every id that is marked to delete in the mediastation repo", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));

        mockMediaStationRepo.getAllMediaIDsToDelete = jest.fn();
        mockMediaStationRepo.getAllMediaIDsToDelete.mockImplementation(() => {
            mocksCalled.push("mockMediaStationRepo.getAllMediaIDsToDelete");
            let map: Map<number, number[]> = new Map();
            map.set(0, [3, 0]);
            map.set(1, [6]);
            return map;
        });

        //method to test
        await service.sync(0, mockOnSyncStep);

        //tests
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenCalledTimes(3);
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenNthCalledWith(1, 0, mediaApp1.id, 3);
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenNthCalledWith(2, 0, mediaApp1.id, 0);
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenNthCalledWith(3, 0, mediaApp2.id, 6);
    })

    it("should call the callback mockOnSyncStep with the text, that it is trying to send data to the controller, if all mediaApps have been synced", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));

        mockNetworkService.sendMediaFileToIp = jest.fn();
        mockNetworkService.sendMediaFileToIp.mockReturnValue(44);

        //method to test
        await service.sync(0, mockOnSyncStep);

        //tests
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(17, "Sende contents.json an Controller-App: " + controllerIp);
    });

    it("should call the callback mockOnSyncStep with a text if the connection to the controller could not be opened, if all mediaApps have been synced", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(false)));

        mockNetworkService.sendMediaFileToIp = jest.fn();
        mockNetworkService.sendMediaFileToIp.mockReturnValue(44);

        //method to test
        let answer: boolean = await service.sync(0, mockOnSyncStep);

        //tests
        expect(answer).toBe(false);
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(18, "Controller-App nicht erreichbar!");
    });

    it("should call the callback mockOnSyncStep with a text if the connection to the controller could be opened, if all mediaApps have been synced", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));

        mockNetworkService.sendMediaFileToIp = jest.fn();
        mockNetworkService.sendMediaFileToIp.mockReturnValue(44);

        //method to test
        let answer: boolean = await service.sync(0, mockOnSyncStep);

        //tests
        expect(answer).toBe(true)
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(18, "Verbindung mit Controller-App hergestellt. Sende Registrierungs-Anfrage...");
    });

    it("should call the callback mockOnSyncStep with a text if the connection to the controller could be opened but the registration failed", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.sendRegistrationAdminApp = jest.fn();
        mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));
        mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));
        mockNetworkService.sendRegistrationAdminApp.mockReturnValueOnce(new Promise((resolve) => resolve("no")));

        mockNetworkService.sendMediaFileToIp = jest.fn();
        mockNetworkService.sendMediaFileToIp.mockReturnValue(44);


        //method to test
        let answer: boolean = await service.sync(0, mockOnSyncStep);

        //tests
        expect(answer).toBe(false)
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(19, "Controller-App ist erreichbar, aber von einer anderen App blockiert.");
    });

    it("should call the callback mockOnSyncStep with a text if the connection to the controller could be opened but the registration failed as USER-app", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.sendRegistrationUserApp = jest.fn();
        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));
        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce(new Promise((resolve) => resolve("yes")));
        mockNetworkService.sendRegistrationUserApp.mockReturnValueOnce(new Promise((resolve) => resolve("no")));

        mockNetworkService.sendMediaFileToIp = jest.fn();
        mockNetworkService.sendMediaFileToIp.mockReturnValue(44);


        //method to test
        let answer: boolean = await service.sync(0, mockOnSyncStep, "user");

        //tests
        expect(answer).toBe(false)
        expect(mockOnSyncStep).toHaveBeenNthCalledWith(19, "Controller-App ist erreichbar, aber von einer anderen App blockiert.");
    });

    it("should throw an error if a wrong role is passed", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));

        mockNetworkService.sendMediaFileToIp = jest.fn();
        mockNetworkService.sendMediaFileToIp.mockReturnValue(44);

        //method to test
        await expect(service.sync(0, mockOnSyncStep, "wrongRole")).rejects.toThrowError("Role not valid: wrongRole");
    });

    it("should pass the json-string and the controller-ip from the mediaStation object to the network-service, if controller is reachable and , if all mediaApps have been synced", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));

        mockNetworkService.sendMediaFileToIp = jest.fn();
        mockNetworkService.sendMediaFileToIp.mockReturnValue(44);

        //method to test
        await service.sync(0, mockOnSyncStep);

        //tests
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledWith(controllerIp, mockJSON);
    });

    it("saving the JSON should have been done after every time a media-app has succesfully been synced", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));

        mockNetworkService.sendMediaFileToIp = jest.fn();
        mockNetworkService.sendMediaFileToIp.mockReturnValue(44);

        //method to test
        await service.sync(0, mockOnSyncStep);

        //tests
        expect(mockMediaStationRepo.cacheMediaStation).toHaveBeenCalledTimes(2);
        expect(mockMediaStationRepo.cacheMediaStation).toHaveBeenCalledWith(0);
    });

    it("deleting the cached mediastation-file should be the last thing to do in the method, if everything else passed", async () => {
        //setup
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));

        mockNetworkService.sendMediaFileToIp = jest.fn();
        mockNetworkService.sendMediaFileToIp.mockReturnValue(44);

        //method to test
        await service.sync(0, mockOnSyncStep);

        //tests
        console.log("mock calls: ", mocksCalled)
        expect(mockMediaStationRepo.removeCachedMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.removeCachedMediaStation).toHaveBeenCalledWith(0);
        expect(mocksCalled.indexOf("mockContentFileService.deleteFile")).toBe(mocksCalled.length - 1);
    });

    it("deleting the cached mediastation-file should not be done, if one media-app could not be synced", async () => {
        //method to test
        mockNetworkService.openConnection = jest.fn();
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(false)));
        mockNetworkService.openConnection.mockReturnValueOnce(new Promise((resolve) => resolve(true)));

        let answer: boolean = await service.sync(0, mockOnSyncStep);

        //tests
        console.log("mock calls: ", mocksCalled)
        expect(answer).toBe(false);
        expect(mockMediaStationRepo.removeCachedMediaStation).toHaveBeenCalledTimes(0);
    });
});