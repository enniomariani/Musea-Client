import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {
    MockMediaStationLocalMetaData
} from "../../../__mocks__/mcf/renderer/fileHandling/MockMediaStationLocalMetaData";
import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {
    MockContentFileService
} from "../../../__mocks__/mcf/renderer/fileHandling/MockContentFileService";
import {MediaApp} from "../../../../src/mcf/renderer/dataStructure/MediaApp";
import {MediaStation} from "../../../../src/mcf/renderer/dataStructure/MediaStation";
import {
    MediaStationRepository
} from "../../../../src/mcf/renderer/dataStructure/MediaStationRepository";
import {
    MockMediaFilesMarkedToDeleteService
} from "../../../__mocks__/mcf/renderer/fileHandling/MockMediaFilesMarkedToDeleteService";
import {MockMediaFileCacheHandler} from "__mocks__/mcf/renderer/fileHandling/MockMediaFileCacheHandler";

let mediaStationRepo: MediaStationRepository;
let mockMediaFileCacheHandler: MockMediaFileCacheHandler;
let mockContentFileService: MockContentFileService;
let mockMediaStationLocalMetaData: MockMediaStationLocalMetaData;
let mockMediaFilesMarkedToDeleteService: MockMediaFilesMarkedToDeleteService;

const mockLoadedMetaData: Map<string, string> = new Map();
let key1: string = "mediaStation1";
let key2: string = "mediaStation2";
let key3: string = "mediaStation3";
mockLoadedMetaData.set(key1, "");
mockLoadedMetaData.set(key2, "192.168.2.1");
mockLoadedMetaData.set(key3, "192.168.2.100");

const defaultControllerIp:string = "defaultControllerIp";

beforeEach(() => {
    mockMediaStationLocalMetaData = new MockMediaStationLocalMetaData();
    mockMediaFileCacheHandler = new MockMediaFileCacheHandler("fakePathToDataFolder");
    mockContentFileService = new MockContentFileService();
    mockMediaFilesMarkedToDeleteService = new MockMediaFilesMarkedToDeleteService();

    mockMediaStationLocalMetaData.load.mockImplementation(() => mockLoadedMetaData);

    mediaStationRepo = new MediaStationRepository(mockMediaStationLocalMetaData, "fakePathToDataFolder", mockMediaFileCacheHandler, mockMediaFilesMarkedToDeleteService, mockContentFileService,
        (id: number) => {const ms = new MockMediaStation(id);
            ms.mediaAppRegistry.getControllerIp.mockReturnValue(defaultControllerIp);
            return ms;
        });
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("loadMediaStations() ", () => {
    it("should call load() of MediaStationLocalMetaData", () => {
        mediaStationRepo.loadMediaStations();
        expect(mockMediaStationLocalMetaData.load).toHaveBeenCalledTimes(1);
    });

    it("should call addMediaStation() for each of the loaded media-station-names", async () => {
        jest.spyOn(mediaStationRepo, "addMediaStation");

        await mediaStationRepo.loadMediaStations();

        expect(mediaStationRepo.addMediaStation).toHaveBeenCalledTimes(3);
        expect(mediaStationRepo.addMediaStation).toHaveBeenNthCalledWith(1, key1, false);
        expect(mediaStationRepo.addMediaStation).toHaveBeenNthCalledWith(2, key2, false);
        expect(mediaStationRepo.addMediaStation).toHaveBeenNthCalledWith(3, key3, false);
    });

    it("hydrates each station", async () => {
        await mediaStationRepo.loadMediaStations();

        expect(mediaStationRepo.mediaCacheHandler.hydrate).toHaveBeenCalledTimes(3);
        expect(mediaStationRepo.mediaCacheHandler.hydrate).toHaveBeenNthCalledWith(1, 0);
        expect(mediaStationRepo.mediaCacheHandler.hydrate).toHaveBeenNthCalledWith(2, 1);
        expect(mediaStationRepo.mediaCacheHandler.hydrate).toHaveBeenNthCalledWith(3, 2);
    });

    it("should call addMediaApp() for each mediastation which has a controller-app saved", async () => {
        const idREturnedFrom2: number = 1100;
        const idREturnedFrom3: number = 123222;
        const mediaStation1: MockMediaStation = new MockMediaStation(0);
        const mediaStation2: MockMediaStation = new MockMediaStation(1);
        mediaStation2.getNextMediaAppId.mockReturnValueOnce(idREturnedFrom2);
        const mediaStation3: MockMediaStation = new MockMediaStation(2);
        mediaStation3.getNextMediaAppId.mockReturnValueOnce(idREturnedFrom3);
        const addMediaStationSpy = jest.spyOn(mediaStationRepo, 'addMediaStation');

        addMediaStationSpy.mockImplementation(async (id: string) => {
            if (id === key1)
                return 0;
            else if (id === key2)
                return 1;
            else if (id === key3)
                return 2;
        });

        const findMediaStationSpy = jest.spyOn(mediaStationRepo, 'findMediaStation');
        findMediaStationSpy.mockImplementation((id: number) => {
            if (id === 0)
                return mediaStation1;
            else if (id === 1)
                return mediaStation2;
            else if (id === 2)
                return mediaStation3;
        });

        const isMediaStationCachedSpy = jest.spyOn(mediaStationRepo, 'isMediaStationCached').mockReturnValue(new Promise((resolve) => {
            resolve(false)
        }));

        await mediaStationRepo.loadMediaStations();

        expect(mediaStation1.mediaAppRegistry.add).toHaveBeenCalledTimes(0);
        expect(mediaStation2.mediaAppRegistry.add).toHaveBeenCalledTimes(1);
        expect(mediaStation2.mediaAppRegistry.add).toHaveBeenCalledWith(idREturnedFrom2, "Controller-App not reachable", "192.168.2.1", MediaApp.ROLE_CONTROLLER);
        expect(mediaStation3.mediaAppRegistry.add).toHaveBeenCalledTimes(1);
        expect(mediaStation3.mediaAppRegistry.add).toHaveBeenCalledWith(idREturnedFrom3, "Controller-App not reachable", "192.168.2.100", MediaApp.ROLE_CONTROLLER);
    });

    it("should return the map it got from the loading-service", async () => {
        let answer: Map<string, string> = await mediaStationRepo.loadMediaStations();
        expect(answer).toStrictEqual(mockLoadedMetaData);
    });

    it("should call loadFile from cached media station if media station was cached", async () => {
        let mockJSON: any = {
            testkey: "asdfadsf",
            testKEy2: true
        }
        let mockMediaStation1: MockMediaStation = new MockMediaStation(0);
        let mockMediaStation2: MockMediaStation = new MockMediaStation(1);
        let mockMediaStation3: MockMediaStation = new MockMediaStation(2);

        const isMediaStationCachedSpy = jest.spyOn(mediaStationRepo, 'isMediaStationCached').mockImplementation(async (id: number) => {
            return new Promise((resolve) => {
                if (id === 1)
                    resolve(true);
                else
                    resolve(false);
            });
        });

        const addMediaStationSpy = jest.spyOn(mediaStationRepo, 'addMediaStation')
            .mockImplementation(async(name: string) => {
            if (name === key1)
                return 0;
            else if (name === key2)
                return 1;
            else if (name === key3)
                return 2;
        })

        const findMediaStationSpy = jest.spyOn(mediaStationRepo, 'findMediaStation')
            .mockImplementation((id: number) => {
            if (id === 0)
                return mockMediaStation1;
            else if (id === 1)
                return mockMediaStation2;
            else if (id === 2)
                return mockMediaStation3;
        })

        mockContentFileService.loadFile.mockReturnValueOnce(mockJSON);

        await mediaStationRepo.loadMediaStations();

        expect(mockMediaStation2.importFromJSON).toHaveBeenCalledTimes(1);
        expect(mockMediaStation2.importFromJSON).toHaveBeenCalledWith(mockJSON, false);
    });

    it("should not throw an error if loaded map is empty", () => {
        mockMediaStationLocalMetaData.load.mockImplementation(() => {
            return new Map();
        });

        expect(() => mediaStationRepo.loadMediaStations()).not.toThrow();
    });
});

describe("addMediaStation() ", () => {
    it("should return the ID of the created mediaStation", async  () => {
        let expectedId: number = 0;
        let receivedId: number = await mediaStationRepo.addMediaStation("myNewMediaStationName");
        expect(receivedId).toEqual(expectedId);
    });

    it("should call mediaMetaDataService.save() with the mediastation-names and controller-ips if save = true", async () => {
        let testName: string = "testNameXY";

        await mediaStationRepo.addMediaStation(testName, true);

        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(1)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledWith(new Map([["testNameXY", defaultControllerIp]]))
    });

    it("should NOT call mediaMetaDataService.save() if save = false", async () => {
        let testName: string = "testNameXY";
        await mediaStationRepo.addMediaStation(testName, false);
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(0)
    });
});

describe("findMediaStation() ", () => {
    it("should return the mediaStation object with the passed ID", async () => {
        const nameMediaStation: string = "testName";
        let receivedId: number;
        let foundMediaStation: MediaStation | null;

        receivedId = await mediaStationRepo.addMediaStation(nameMediaStation);
        mediaStationRepo.addMediaStation("testName2");

        foundMediaStation = mediaStationRepo.findMediaStation(receivedId);

        expect(foundMediaStation?.id).toEqual(receivedId);
        expect(foundMediaStation?.name).toEqual(nameMediaStation);

    });

    it("should return null if the mediastation can not be found", async () => {
        const nameMediaStation: string = "testName";
        const foundMediaStation: MediaStation | null;

        await mediaStationRepo.addMediaStation(nameMediaStation);
        await mediaStationRepo.addMediaStation("testName2");

        foundMediaStation = mediaStationRepo.findMediaStation(20);

        expect(foundMediaStation).toEqual(null);
    });
});

describe("requireMediaStation() ", () => {
    it("should return the mediaStation object with the passed ID", async () => {
        let receivedId: number;
        let nameMediaStation: string = "testName";
        let foundMediaStation: MediaStation;

        receivedId = await mediaStationRepo.addMediaStation(nameMediaStation);
        mediaStationRepo.addMediaStation("testName2");

        foundMediaStation = mediaStationRepo.requireMediaStation(receivedId);

        expect(foundMediaStation.id).toEqual(receivedId);
        expect(foundMediaStation.name).toEqual(nameMediaStation);

    });

    it("should trhow if the mediastation can not be found", async () => {
        let nameMediaStation: string = "testName";

        await mediaStationRepo.addMediaStation(nameMediaStation);
        await mediaStationRepo.addMediaStation("testName2");

        expect(() => mediaStationRepo.requireMediaStation(20)).toThrow(new Error("Mediastation with this ID does not exist: 20"));
    });
});

describe("deleteMediaStation() ", () => {
    it("should remove the mediastation-object from the repository", async () => {
        let receivedId: number;
        let nameMediaStation: string = "testName";
        let foundMediaStation: MediaStation | null;

        receivedId = await mediaStationRepo.addMediaStation(nameMediaStation);
        mediaStationRepo.addMediaStation("testName2");
        await mediaStationRepo.deleteMediaStation(receivedId);
        foundMediaStation = mediaStationRepo.findMediaStation(receivedId);

        expect(foundMediaStation).toEqual(null);
    });

    it("should call mediaMetaDataService.save() with an empty Map if there was only one mediastation", async () => {
        let receivedId: number;
        let nameMediaStation: string = "testName";
        let mapToSave: Map<string, string> = new Map();

        receivedId = await mediaStationRepo.addMediaStation(nameMediaStation);
        await mediaStationRepo.deleteMediaStation(receivedId);
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(2)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenNthCalledWith(2, mapToSave)
    });

    it("should call mediaMetaDataService.save() with a map with 1 entry if there were 2 mediastations", async () => {
        let receivedId: number;

        await mediaStationRepo.addMediaStation("testName1");
        receivedId = await mediaStationRepo.addMediaStation("testName2");

        await mediaStationRepo.deleteMediaStation(receivedId);

        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(3)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenNthCalledWith(3, new Map([["testName1", defaultControllerIp]]))

    });

    it("should deleteAllCachedMedia() of mediaCAcheHandler", async () => {
        let receivedId: number;
        let mapToSave: Map<string, string> = new Map();
        mapToSave.set("testName1", "")

        await mediaStationRepo.addMediaStation("testName1");

        receivedId = await mediaStationRepo.addMediaStation("testName2");
        await mediaStationRepo.deleteMediaStation(receivedId);

        expect(mediaStationRepo.mediaCacheHandler.deleteAllCachedMedia).toHaveBeenCalledTimes(1);
        expect(mediaStationRepo.mediaCacheHandler.deleteAllCachedMedia).toHaveBeenCalledWith(receivedId);
    });

    it("should remove cached mediastation if it was cached", async () => {
        let receivedId: number;
        let mapToSave: Map<string, string> = new Map();
        mapToSave.set("testName1", "")

        await mediaStationRepo.addMediaStation("testName1");
        receivedId = await mediaStationRepo.addMediaStation("testName2");

        let spy = jest.spyOn(mediaStationRepo, 'isMediaStationCached').mockImplementation(async (id) => {
            return new Promise(resolve => {
                if (id === receivedId)
                    resolve(true)
                else
                    resolve(false)
            })

        });

        let spyRemoveCachedStation = jest.spyOn(mediaStationRepo, 'removeCachedMediaStation')

        await mediaStationRepo.deleteMediaStation(receivedId);

        expect(spyRemoveCachedStation).toHaveBeenCalledTimes(1);
        expect(spyRemoveCachedStation).toHaveBeenCalledWith(receivedId);
    });
});

describe("saveMediaStations() ", () => {

    it("should call mediaMetaDataService.save() with a map with an actualised controller-ip",async  () => {
        let receivedId: number;
        let mediaStation: MockMediaStation;
        let newIp: string = "222.222.222.20";
        let mapToSave: Map<string, string> = new Map();
        mapToSave.set("testName1", newIp);

        receivedId = await mediaStationRepo.addMediaStation("testName1");

        mediaStation = mediaStationRepo.findMediaStation(receivedId) as MockMediaStation;
        mediaStation.mediaAppRegistry.getControllerIp.mockReturnValue(newIp)
        await mediaStationRepo.saveMediaStations();

        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(2)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenNthCalledWith(2, mapToSave)
    });
});

describe("cacheMediaStation() ", () => {
    it("should call contentFileService.saveFile with the exported JSON from the mediaStation", async () => {
        let mockJSON: any = {
            test: "teststring",
            testBoolean: false
        }
        let receivedId: number = await mediaStationRepo.addMediaStation("testName1");
        let mediaStation: MockMediaStation = mediaStationRepo.findMediaStation(receivedId) as MockMediaStation;
        mediaStation.exportToJSON.mockReturnValue(mockJSON);

        mediaStationRepo.cacheMediaStation(0);

        expect(mockContentFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockContentFileService.saveFile).toHaveBeenCalledWith(0, mockJSON);
    })

    it("throw an error if mediastation id does not exist", () => {
        let spy = jest.spyOn(mediaStationRepo, 'findMediaStation').mockReturnValue(null);

        expect(() => mediaStationRepo.cacheMediaStation(0)).toThrow(Error("Mediastation with this ID does not exist: 0"));
    })
});

describe("removeCachedMediaStation() ", () => {
    it("should call contentFileService.deleteFile with the correct ID", async () => {
        await mediaStationRepo.addMediaStation("testName1");

        mediaStationRepo.removeCachedMediaStation(0);

        expect(mockContentFileService.deleteFile).toHaveBeenCalledTimes(1);
        expect(mockContentFileService.deleteFile).toHaveBeenCalledWith(0);
    })

    it("throw an error if mediastation id does not exist", () => {
        expect(() => mediaStationRepo.removeCachedMediaStation(0)).toThrow(Error("Mediastation with this ID does not exist: 0"));
    })
});

describe("isMediaStationCached() ", () => {
    it("should call contentFileService.deleteFile with the correct ID", async () => {
        await mediaStationRepo.addMediaStation("testName1");

        mockContentFileService.fileExists.mockImplementationOnce((id) => {
            if (id === 0)
                return true;
        });
        let answer: boolean;

        answer = await mediaStationRepo.isMediaStationCached(0);

        expect(answer).toBe(true)
    })

    it("throw an error if mediastation id does not exist", async () => {

        await expect(mediaStationRepo.isMediaStationCached(0)).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));
    })
});

describe("markMediaIDtoDelete() ", () => {
    it("should call MediaFilesMarkedToDeleteService.saveID with the correct ID", async () => {
        const spyFindMediaStation = jest.spyOn(mediaStationRepo, "requireMediaStation");

        spyFindMediaStation.mockReturnValue(new MockMediaStation(0));

        await mediaStationRepo.markMediaIDtoDelete(0, 1, 4);

        expect(mockMediaFilesMarkedToDeleteService.addID).toHaveBeenCalledTimes(1);
        expect(mockMediaFilesMarkedToDeleteService.addID).toHaveBeenCalledWith(0, 1, 4);
    })

    it("throw an error if mediastation id does not exist", async () => {
        await expect(mediaStationRepo.markMediaIDtoDelete(0, 1, 5)).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));
    })
});

describe("deleteStoredMediaID() ", () => {
    it("should call MediaFilesMarkedToDeleteService.saveID with the correct ID", async () => {
        const spyFindMediaStation = jest.spyOn(mediaStationRepo, "requireMediaStation");

        spyFindMediaStation.mockReturnValue(new MockMediaStation(0));

        await mediaStationRepo.deleteStoredMediaID(0, 1, 4);

        expect(mockMediaFilesMarkedToDeleteService.removeID).toHaveBeenCalledTimes(1);
        expect(mockMediaFilesMarkedToDeleteService.removeID).toHaveBeenCalledWith(0, 1, 4);
    })

    it("throw an error if mediastation id does not exist", async () => {
        await expect(mediaStationRepo.deleteStoredMediaID(0, 0, 5)).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));
    })
});

describe("getAllMediaIDsToDelete() ", () => {
    it("should return the numbers of MediaFilesMarkedToDeleteService.getAllIds", async () => {
        const spyFindMediaStation = jest.spyOn(mediaStationRepo, "requireMediaStation");
        const mediaIdsToDelete: number[] = [10, 4, 5];
        let result: Map<number, number[]>;

        spyFindMediaStation.mockReturnValue(new MockMediaStation(0));
        mockMediaFilesMarkedToDeleteService.getAllIDS.mockImplementation((mediaStationId: number) => {
            if (mediaStationId === 0)
                return mediaIdsToDelete;
        });

        result = await mediaStationRepo.getAllMediaIDsToDelete(0);

        expect(result).toEqual(mediaIdsToDelete);
    })

    it("should return an empty array if MediaFilesMarkedToDeleteService.getAllIds returns an empty array", async () => {
        const spyFindMediaStation = jest.spyOn(mediaStationRepo, "requireMediaStation");
        const mediaIdsToDelete: number[] = [];
        let result: Map<number, number[]>;

        spyFindMediaStation.mockReturnValue(new MockMediaStation(0));
        mockMediaFilesMarkedToDeleteService.getAllIDS.mockImplementation((mediaStationId: number) => {
            if (mediaStationId === 0)
                return mediaIdsToDelete;
        });

        result = await mediaStationRepo.getAllMediaIDsToDelete(0);

        expect(result).toEqual(mediaIdsToDelete);
    })

    it("throw an error if mediastation id does not exist", async () => {
        await expect(mediaStationRepo.getAllMediaIDsToDelete(0)).rejects.toThrow(Error("Mediastation with this ID does not exist: 0"));
    })
});