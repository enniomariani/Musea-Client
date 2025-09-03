import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {
    MockMediaStationLocalMetaData
} from "../../../__mocks__/mcf/renderer/fileHandling/MockMediaStationLocalMetaData";
import {MockMediaFileService} from "../../../__mocks__/mcf/renderer/fileHandling/MockMediaFileService";
import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {
    MockContentFileService
} from "../../../__mocks__/mcf/renderer/fileHandling/MockContentFileService";
import {MediaApp} from "../../../../src/mcf/renderer/dataStructure/MediaApp";
import {MediaStation} from "../../../../src/mcf/renderer/dataStructure/MediaStation";
import {
    ICachedMedia,
    MediaStationRepository
} from "../../../../src/mcf/renderer/dataStructure/MediaStationRepository";
import {
    MockMediaFilesMarkedToDeleteService
} from "../../../__mocks__/mcf/renderer/fileHandling/MockMediaFilesMarkedToDeleteService";

let mediaStationRepo:MediaStationRepository;
let mockMediaFileService:MockMediaFileService;
let mockContentFileService:MockContentFileService;
let mockMediaStationLocalMetaData:MockMediaStationLocalMetaData;
let mockMediaFilesMarkedToDeleteService:MockMediaFilesMarkedToDeleteService;

beforeEach(() => {
    mockMediaStationLocalMetaData = new MockMediaStationLocalMetaData();
    mockMediaFileService = new MockMediaFileService();
    mockContentFileService = new MockContentFileService();
    mockMediaFilesMarkedToDeleteService = new MockMediaFilesMarkedToDeleteService();

    mediaStationRepo = new MediaStationRepository(mockMediaStationLocalMetaData, "fakePathToDataFolder", mockMediaFileService,mockMediaFilesMarkedToDeleteService, mockContentFileService,
        (id:number) => new MockMediaStation(id));
});

afterEach(() => {
    jest.clearAllMocks();
});

let returnedMetaData:Map<string, string> = new Map();
let key1:string = "mediaStation1";
let key2:string = "mediaStation2";
let key3:string = "mediaStation3";
returnedMetaData.set(key1, null);
returnedMetaData.set(key2, "192.168.2.1");
returnedMetaData.set(key3, "192.168.2.100");

describe("loadMediaStations() ", ()=>{
    it("should call load() of MediaStationLocalMetaData", () =>{
        //setup
        mockMediaStationLocalMetaData.load.mockImplementation(()=>{
            return returnedMetaData;
        });

        //method to test
        mediaStationRepo.loadMediaStations();

        //tests
        expect(mockMediaStationLocalMetaData.load).toHaveBeenCalledTimes(1);
    });

    it("should call addMediaStation() for each of the loaded media-station-names", async () =>{
        //setup
        jest.spyOn(mediaStationRepo, "addMediaStation");

        mockMediaStationLocalMetaData.load.mockImplementation(()=>{
            return returnedMetaData;
        });

        //method to test
        await mediaStationRepo.loadMediaStations();

        //tests
        expect(mediaStationRepo.addMediaStation).toHaveBeenCalledTimes(3);
        expect(mediaStationRepo.addMediaStation).toHaveBeenNthCalledWith(1, key1, false);
        expect(mediaStationRepo.addMediaStation).toHaveBeenNthCalledWith(2, key2, false);
        expect(mediaStationRepo.addMediaStation).toHaveBeenNthCalledWith(3, key3, false);
    });

    it("should load the cached media for each of the loaded media-station-names", async () =>{
        //setup
        const expectedCachedMedia0:ICachedMedia[] = [
            {contentId: 1, mediaAppId: 2, fileExtension: "jpeg"},
            {contentId: 3, mediaAppId: 6, fileExtension: "mp4"},
            {contentId: 0, mediaAppId: 0, fileExtension: "jpeg"}
        ];
        const expectedCachedMedia1:ICachedMedia[] = [
            {contentId: 1, mediaAppId: 2, fileExtension: "png"},
            {contentId: 39, mediaAppId: 6, fileExtension: "png"},
            {contentId: 250, mediaAppId: 0, fileExtension: "jpeg"}
        ];
        let allExpectedCachedMedia:Map<number, ICachedMedia[]> = new Map();
        allExpectedCachedMedia.set(0, expectedCachedMedia0);
        allExpectedCachedMedia.set(1, expectedCachedMedia1);
        allExpectedCachedMedia.set(2, []);

        jest.spyOn(mediaStationRepo, "addMediaStation");

        mockMediaStationLocalMetaData.load.mockImplementation(()=>{
            return returnedMetaData;
        });

        mockMediaFileService.getAllCachedMedia.mockImplementation(async (stationId:number) => {
            if(stationId === 0)
                return expectedCachedMedia0;
            else if(stationId === 1)
                return expectedCachedMedia1;
            else if(stationId === 2)
                return [];
        });

        //method to test
        await mediaStationRepo.loadMediaStations();

        //tests
        expect(mediaStationRepo.getAllCachedMedia()).toEqual(allExpectedCachedMedia);
    });

    it("should call addMediaApp() for each mediastation which has a controller-app saved", async () =>{
        //setup
        const idREturnedFrom2:number = 1100;
        const idREturnedFrom3:number = 123222;
        const mediaStation1:MockMediaStation =new MockMediaStation(0);
        const mediaStation2:MockMediaStation =new MockMediaStation(1);
        mediaStation2.getNextMediaAppId.mockReturnValueOnce(idREturnedFrom2);
        const mediaStation3:MockMediaStation =new MockMediaStation(2);
        mediaStation3.getNextMediaAppId.mockReturnValueOnce(idREturnedFrom3);
        const addMediaStationSpy = jest.spyOn(mediaStationRepo, 'addMediaStation');

        addMediaStationSpy.mockImplementation((id:string)=>{
            if(id === key1)
                return 0;
            else if(id === key2)
                return 1;
            else if(id === key3)
                return 2;
        });

        const findMediaStationSpy = jest.spyOn(mediaStationRepo, 'findMediaStation');
        findMediaStationSpy.mockImplementation((id:number)=>{
            if(id === 0)
                return mediaStation1;
            else if(id === 1)
                return mediaStation2;
            else if(id === 2)
                return mediaStation3;
        });

        const isMediaStationCachedSpy = jest.spyOn(mediaStationRepo, 'isMediaStationCached').
        mockReturnValue(new Promise((resolve)=>{resolve(false)}));

        mockMediaStationLocalMetaData.load.mockImplementation(()=>{
            return returnedMetaData;
        });

        //method to test
        await mediaStationRepo.loadMediaStations();

        //tests
        expect(mediaStationRepo.findMediaStation).toHaveBeenCalledTimes(3);
        expect(mediaStation1.addMediaApp).toHaveBeenCalledTimes(0);
        expect(mediaStation2.addMediaApp).toHaveBeenCalledTimes(1);
        expect(mediaStation2.addMediaApp).toHaveBeenCalledWith(idREturnedFrom2, "Controller-App nicht erreichbar", "192.168.2.1", MediaApp.ROLE_CONTROLLER);
        expect(mediaStation3.addMediaApp).toHaveBeenCalledTimes(1);
        expect(mediaStation3.addMediaApp).toHaveBeenCalledWith(idREturnedFrom3, "Controller-App nicht erreichbar", "192.168.2.100", MediaApp.ROLE_CONTROLLER);
    });

    it("should return the map it got from the loading-service", async () =>{
        //setup
        let answer:Map<string, string>;

        mockMediaStationLocalMetaData.load.mockImplementation(()=>{
            return returnedMetaData;
        });

        //method to test
        answer = await mediaStationRepo.loadMediaStations();

        //tests
        expect(answer).toStrictEqual(returnedMetaData);
    });

    it("should call loadFile from cached media station if media station was cached", async () =>{
        //setup
        let answer:Map<string, string>;
        let mockJSON:any = {
            testkey: "asdfadsf",
            testKEy2: true
        }
        let mockMediaStation1:MockMediaStation = new MockMediaStation(0);
        let mockMediaStation2:MockMediaStation = new MockMediaStation(1);
        let mockMediaStation3:MockMediaStation = new MockMediaStation(2);

        mockMediaStationLocalMetaData.load.mockImplementation(()=>{
            return returnedMetaData;
        });

        const isMediaStationCachedSpy = jest.spyOn(mediaStationRepo, 'isMediaStationCached').mockImplementation(async (id:number)=>{
            return new Promise((resolve)=>{
                if(id === 1)
                    resolve(true);
                else
                    resolve(false);
            });
        });

        const addMediaStationSpy = jest.spyOn(mediaStationRepo, 'addMediaStation').mockImplementation((name:string) =>{
            if(name === key1)
                return 0;
            else if(name === key2)
                return 1;
            else if(name === key3)
                return 2;
        })

        const findMediaStationSpy = jest.spyOn(mediaStationRepo, 'findMediaStation').mockImplementation((id:number) =>{
            if(id === 0)
                return mockMediaStation1;
            else if(id === 1)
                return mockMediaStation2;
            else if(id === 2)
                return mockMediaStation3;
        })

        mockContentFileService.loadFile.mockReturnValueOnce(mockJSON);


        //method to test
        answer = await mediaStationRepo.loadMediaStations();

        //tests
        expect(mockMediaStation2.importFromJSON).toHaveBeenCalledTimes(1);
        expect(mockMediaStation2.importFromJSON).toHaveBeenCalledWith(mockJSON, false);
    });

    it("should not throw an error if loaded map is empty", () =>{
        //setup
        mockMediaStationLocalMetaData.load.mockImplementation(()=>{
            return new Map();
        });

        //tests
        expect(()=>mediaStationRepo.loadMediaStations()).not.toThrow();
    });
});

describe("addMediaStation() ", ()=>{
    it("should return the ID of the created mediaStation", ()=>{
        //setup
        let expectedId:number = 0;
        let receivedId:number;

        //method to test
        receivedId = mediaStationRepo.addMediaStation("myNewMediaStationName");

        //tests
        expect(receivedId).toEqual(expectedId);
    });

    it("should call mediaMetaDataService.save() with the mediastation-names and controller-ips if save = true", ()=>{
        //setup
        let testName:string = "testNameXY";
        let mapToSave:Map<string, string> = new Map();
        mapToSave.set(testName, "mock-controller-ip");

        //method to test
        mediaStationRepo.addMediaStation(testName, true);

        //tests
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(1)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledWith(mapToSave)
    });

    it("should NOT call mediaMetaDataService.save() if save = false", ()=>{
        //setup
        let testName:string = "testNameXY";

        //method to test
        mediaStationRepo.addMediaStation(testName, false);

        //tests
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(0)
    });
});

describe("findMediaStation() ", ()=>{
    it("should return the mediaStation object with the passed ID", ()=>{
        //setup
        let receivedId:number;
        let nameMediaStation:string = "testName";
        let foundMediaStation:MediaStation;

        receivedId = mediaStationRepo.addMediaStation(nameMediaStation);
        mediaStationRepo.addMediaStation("testName2");

        //method to test
        foundMediaStation = mediaStationRepo.findMediaStation(receivedId);


        //tests
        expect(foundMediaStation.id).toEqual(receivedId);
        expect(foundMediaStation.name).toEqual(nameMediaStation);

    });

    it("should return null if the mediastation can not be found", ()=>{
        //setup
        let nameMediaStation:string = "testName";
        let foundMediaStation:MediaStation;

        mediaStationRepo.addMediaStation(nameMediaStation);
        mediaStationRepo.addMediaStation("testName2");

        //method to test
        foundMediaStation = mediaStationRepo.findMediaStation(20);


        //tests
        expect(foundMediaStation).toEqual(null);

    });
});

describe("deleteMediaStation() ", ()=>{
    it("should remove the mediastation-object from the repository", async ()=>{
        //setup
        let receivedId:number;
        let nameMediaStation:string = "testName";
        let foundMediaStation:MediaStation;

        receivedId = mediaStationRepo.addMediaStation(nameMediaStation);
        mediaStationRepo.addMediaStation("testName2");

        //method to test
        await mediaStationRepo.deleteMediaStation(receivedId);
        foundMediaStation = mediaStationRepo.findMediaStation(receivedId);

        //tests
        expect(foundMediaStation).toEqual(null);
    });

    it("should call mediaMetaDataService.save() with an empty Map if there was only one mediastation", async ()=>{
        //setup
        let receivedId:number;
        let nameMediaStation:string = "testName";
        let mapToSave:Map<string, string> = new Map();

        receivedId = mediaStationRepo.addMediaStation(nameMediaStation);

        //method to test
        await mediaStationRepo.deleteMediaStation(receivedId);

        //tests
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(2)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenNthCalledWith(2, mapToSave)
    });

    it("should call mediaMetaDataService.save() with a map with 1 entry if there were 2 mediastations", async ()=>{
        //setup
        let receivedId:number;
        let mapToSave:Map<string, string> = new Map();
        mapToSave.set("testName1", "mock-controller-ip")

        mediaStationRepo.addMediaStation("testName1");
        receivedId = mediaStationRepo.addMediaStation("testName2");

        //method to test
        await mediaStationRepo.deleteMediaStation(receivedId);

        //tests
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(3)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenNthCalledWith(3, mapToSave)
    });

    it("should remove any cached media if there are some and clear the cachedMedia map", async ()=>{
        //setup
        let receivedId:number;
        let mapToSave:Map<string, string> = new Map();
        mapToSave.set("testName1", "")

        mediaStationRepo.addMediaStation("testName1");
        receivedId = mediaStationRepo.addMediaStation("testName2");
        mediaStationRepo.getAllCachedMedia().set(receivedId, [{contentId: 0, mediaAppId: 2, fileExtension: "jpeg"}, {contentId: 22, mediaAppId: 23, fileExtension: "mp4"}])

        //method to test
        await mediaStationRepo.deleteMediaStation(receivedId);

        //tests
        expect(mockMediaFileService.deleteFile).toHaveBeenCalledTimes(2);
        expect(mockMediaFileService.deleteFile).toHaveBeenNthCalledWith(1, receivedId, 0, 2, "jpeg");
        expect(mockMediaFileService.deleteFile).toHaveBeenNthCalledWith(2, receivedId, 22, 23, "mp4");
        expect(mediaStationRepo.getAllCachedMedia().get(receivedId)).toBeUndefined();
    });

    it("should remove cached mediastation if it was cached", async ()=>{
        //setup
        let receivedId:number;
        let mapToSave:Map<string, string> = new Map();
        mapToSave.set("testName1", "")

        mediaStationRepo.addMediaStation("testName1");
        receivedId = mediaStationRepo.addMediaStation("testName2");

        let spy = jest.spyOn(mediaStationRepo, 'isMediaStationCached').mockImplementation(async (id) =>{
            return new Promise(resolve =>{
                if(id === receivedId)
                    resolve(true)
                else
                    resolve(false)
            })

        });

        let spyRemoveCachedStation = jest.spyOn(mediaStationRepo, 'removeCachedMediaStation')


        //method to test
        await mediaStationRepo.deleteMediaStation(receivedId);

        //tests
        expect(spyRemoveCachedStation).toHaveBeenCalledTimes(1);
        expect(spyRemoveCachedStation).toHaveBeenCalledWith(receivedId);
    });
});

describe("updateMediaStation() ", ()=>{
    it("should replace the mediastation object by the new one", ()=>{
        //setup
        let receivedId:number;
        let nameMediaStation:string = "testName";
        let foundMediaStation:MediaStation, foundMediaStation2:MediaStation;

        mediaStationRepo.addMediaStation("testNameXYYYZZ");
        receivedId = mediaStationRepo.addMediaStation(nameMediaStation);
        mediaStationRepo.addMediaStation("testName2");

        //method to test
        foundMediaStation = mediaStationRepo.findMediaStation(receivedId);

        foundMediaStation.name = "newName";
        mediaStationRepo.updateMediaStation(foundMediaStation);

        foundMediaStation2 = mediaStationRepo.findMediaStation(receivedId);

        //tests
        expect(foundMediaStation2.name).toEqual("newName");
    });

    it("should throw an error if the passed mediastation is not in the repo", ()=>{
        //setup
        let newMediaStation:MediaStation = new MediaStation(100);
        let error:boolean = false;

        //method to test
        try{
            mediaStationRepo.updateMediaStation(newMediaStation);
        }catch(e){
            error = true;
        }

        //tests
        expect(error).toEqual(true);
    });
});

describe("updateAndSaveMediaStation() ", ()=>{
    it("should call updateMediaStation", ()=>{
        //setup
        let mediaStation:MediaStation = new MediaStation(0);
        mediaStationRepo.updateMediaStation = jest.fn();

        //method to test
        mediaStationRepo.updateAndSaveMediaStation(mediaStation);

        //tests
        expect(mediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mediaStation);
    });

    it("should call mediaMetaDataService.save() with a map with an actualised controller-ip", ()=>{
        //setup
        let receivedId:number;
        let mediaStation:MockMediaStation;
        let newIp:string = "222.222.222.20";
        let mapToSave:Map<string, string> = new Map();
        mapToSave.set("testName1", newIp);

        receivedId = mediaStationRepo.addMediaStation("testName1");

        //method to test
        mediaStation = mediaStationRepo.findMediaStation(receivedId) as MockMediaStation;
        mediaStation.getControllerIp.mockReturnValue(newIp)
        mediaStationRepo.updateAndSaveMediaStation(mediaStation);

        //tests
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(2)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenNthCalledWith(2, mapToSave)
    });
});

describe("cacheMedia() ", ()=>{
    const fileName = 'mockFile.txt';
    const fileContent = 'Hello, world!';
    const fileType = 'text/plain';

    // Create a mock File object
    const mockFile = new File([fileContent], fileName, { type: fileType });
    it("should call mediaFileService.saveFile with the passed parameters", async ()=>{
        //setup
        let data:Uint8Array = new Uint8Array([0x00, 0x11, 0xFF]);

        //method to test
        await mediaStationRepo.cacheMedia(0,1,2,"jpeg", mockFile);

        //tests
        expect(mockMediaFileService.saveFileByPath).toHaveBeenCalledTimes(1);
        expect(mockMediaFileService.saveFileByPath).toHaveBeenCalledWith(0, 1,2, "jpeg", mockFile);
    });

    it("should add the cached media to cachedMedia and create a mediaStationId if it does not exist", async ()=>{
        //setup
        let data:Uint8Array = new Uint8Array([0x00, 0x11, 0xFF]);

        //method to test
        await mediaStationRepo.cacheMedia(0,1,2,"jpeg", mockFile);

        //tests
        expect(mediaStationRepo.getAllCachedMedia().get(0)).not.toBeNull();
        expect(mediaStationRepo.getAllCachedMedia().get(0)).not.toBeUndefined();
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].mediaAppId).toBe(2);
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].contentId).toBe(1);
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].fileExtension).toBe("jpeg");
    });

    it("should add the cached media to cachedMedia if the mediastation already exists and has already a cached file set", async ()=>{
        //setup
        let data:Uint8Array = new Uint8Array([0x00, 0x11, 0xFF]);

        //method to test
        await mediaStationRepo.cacheMedia(0,1,2,"jpeg", mockFile);
        await mediaStationRepo.cacheMedia(0,2,2,"mp4", mockFile);

        //tests
        expect(mediaStationRepo.getAllCachedMedia().get(0)).not.toBeNull();
        expect(mediaStationRepo.getAllCachedMedia().get(0)).not.toBeUndefined();
        expect(mediaStationRepo.getAllCachedMedia().get(0).length).toBe(2);
        expect(mediaStationRepo.getAllCachedMedia().get(0)[1].mediaAppId).toBe(2);
        expect(mediaStationRepo.getAllCachedMedia().get(0)[1].contentId).toBe(2);
        expect(mediaStationRepo.getAllCachedMedia().get(0)[1].fileExtension).toBe("mp4");
    });
});

describe("isMediaCached() ", ()=>{
    it("should return true if the media is cached", async ()=>{
        //setup
        mediaStationRepo.getAllCachedMedia().set(0, [{contentId: 1, mediaAppId: 2, fileExtension: "jpeg"}]);
        let answer:boolean;
        mockMediaFileService.fileExists.mockReturnValueOnce(true);

        //method to test
        answer = mediaStationRepo.isMediaCached(0,1,2);

        //tests
        expect(answer).toBe(true);
    });

    it("should return false if the media is not cached", ()=>{
        //setup
        let answer:boolean;
        mediaStationRepo.getAllCachedMedia().set(0, [{contentId: 1, mediaAppId: 2, fileExtension: "jpeg"}]);

        //method to test
        answer = mediaStationRepo.isMediaCached(0,1,1);

        //tests
        expect(answer).toBe(false);
    });

    it("should return false if there is no media cached for the mediastation", async ()=>{
        //setup
        mediaStationRepo.getAllCachedMedia().set(0, [{contentId: 1, mediaAppId: 2, fileExtension: "jpeg"}]);
        let answer:boolean;
        mockMediaFileService.fileExists.mockReturnValueOnce(true);

        //method to test
        answer = mediaStationRepo.isMediaCached(1,1,2);

        //tests
        expect(answer).toBe(false);
    });
});

describe("deleteCachedMedia() ", ()=>{
    it("should call mediaFileService.deleteFile with the passed parameters", ()=>{
        //setup
        mediaStationRepo.getAllCachedMedia().set(0, [{contentId: 3, mediaAppId: 3, fileExtension: "mp4"}, {contentId: 1, mediaAppId: 2, fileExtension: "jpeg"}]);

        //method to test
        mediaStationRepo.deleteCachedMedia(0,1,2);

        //tests
        expect(mockMediaFileService.deleteFile).toHaveBeenCalledTimes(1);
        expect(mockMediaFileService.deleteFile).toHaveBeenCalledWith(0, 1,2, "jpeg");
    });

    it("should remove the cached media from cachedMedia but other entries should be preserved, element to delete is first in array", ()=>{
        //setup
        mediaStationRepo.getAllCachedMedia().set(0, [{contentId: 3, mediaAppId: 3, fileExtension: "mp4"}, {contentId: 1, mediaAppId: 2, fileExtension: "jpeg"}]);

        //method to test
        mediaStationRepo.deleteCachedMedia(0,3,3);

        //tests
        expect(mediaStationRepo.getAllCachedMedia().get(0)).not.toBeUndefined();
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].contentId).toBe(1);
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].mediaAppId).toBe(2);
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].fileExtension).toBe("jpeg");
    });

    it("should remove the cached media from cachedMedia but other entries should be preserved, element to delete is last in array", ()=>{
        //setup
        mediaStationRepo.getAllCachedMedia().set(0, [{contentId: 3, mediaAppId: 3, fileExtension: "mp4"}, {contentId: 1, mediaAppId: 2, fileExtension: "jpeg"}]);

        //method to test
        mediaStationRepo.deleteCachedMedia(0,1,2);

        //tests
        expect(mediaStationRepo.getAllCachedMedia().get(0)).not.toBeUndefined();
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].contentId).toBe(3);
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].mediaAppId).toBe(3);
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].fileExtension).toBe("mp4");
    });

    it("should remove the cached media to cachedMedia and remove the mediaStationId if there are no cached media left", ()=>{
        //setup
        mediaStationRepo.getAllCachedMedia().set(0, [{contentId: 1, mediaAppId: 2, fileExtension: "jpeg"}]);

        //method to test
        mediaStationRepo.deleteCachedMedia(0,1,2);

        //tests
        expect(mediaStationRepo.getAllCachedMedia().get(0)).toBeUndefined();
    });

    it("should throw an error if there are no media cached for the passed mediastation", ()=>{
        //setup
        mediaStationRepo.getAllCachedMedia().set(0, [{contentId: 1, mediaAppId: 2, fileExtension: "jpeg"}]);

        //tests
        expect(()=> mediaStationRepo.deleteCachedMedia(1,1,2)).toThrow("No media cached for mediastation with ID: 1")
    });

    it("should throw an error if there is no cached media for the passed contentId and mediaAppID", ()=>{
        //setup
        mediaStationRepo.getAllCachedMedia().set(0, [{contentId: 1, mediaAppId: 2, fileExtension: "jpeg"}]);

        //tests
        expect(()=> mediaStationRepo.deleteCachedMedia(0,2,2)).toThrow("No media cached for media-App-ID 2 in content-ID 2 of mediastation with ID: 0")
    });

});

describe("getCachedMediaFile() ", ()=>{
    it("should call mediaFileService.loadFile with the passed parameters", async ()=>{
        //method to test
        await mediaStationRepo.getCachedMediaFile(0,1,2, "jpeg");

        //tests
        expect(mockMediaFileService.loadFile).toHaveBeenCalledTimes(1);
        expect(mockMediaFileService.loadFile).toHaveBeenCalledWith(0, 1,2, "jpeg");
    })

    it("should return what mediaFileService.loadFile returns", async ()=>{
        //setup
        let answer:Uint8Array;
        let data:Uint8Array = new Uint8Array([0x00, 0x11, 0xFF]);
        mockMediaFileService.loadFile.mockReturnValueOnce(data);

        //method to test
        answer = await mediaStationRepo.getCachedMediaFile(0,1,2, "jpeg");

        //tests
        expect(answer).toEqual(data);
    });
});

describe("cacheMediaStation() ", ()=>{
    it("should call contentFileService.saveFile with the exported JSON from the mediaStation", async ()=>{
        //setup
        let mockJSON:any = {
            test: "teststring",
            testBoolean: false
        }
        let receivedId:number = mediaStationRepo.addMediaStation("testName1");
        let mediaStation:MockMediaStation = mediaStationRepo.findMediaStation(receivedId) as MockMediaStation;
        mediaStation.exportToJSON.mockReturnValue(mockJSON);

        //method to test
        await mediaStationRepo.cacheMediaStation(0);

        //tests
        expect(mockContentFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockContentFileService.saveFile).toHaveBeenCalledWith(0, mockJSON);
    })

    it("throw an error if mediastation id does not exist", ()=>{
        //setup
        let spy = jest.spyOn(mediaStationRepo, 'findMediaStation').mockReturnValue(null);

        //method to test
        expect(()=>mediaStationRepo.cacheMediaStation(0)).toThrow(Error("Caching MediaStation not possible, because ID does not exist in the repo: 0"));
    })
});

describe("removeCachedMediaStation() ", ()=>{
    it("should call contentFileService.deleteFile with the correct ID", async ()=>{
        //setup
        let receivedId:number = mediaStationRepo.addMediaStation("testName1");
        let mediaStation:MockMediaStation = mediaStationRepo.findMediaStation(receivedId) as MockMediaStation;

        //method to test
        await mediaStationRepo.removeCachedMediaStation(0);

        //tests
        expect(mockContentFileService.deleteFile).toHaveBeenCalledTimes(1);
        expect(mockContentFileService.deleteFile).toHaveBeenCalledWith(0);
    })

    it("throw an error if mediastation id does not exist", ()=>{
        //method to test
        expect(()=>mediaStationRepo.removeCachedMediaStation(0)).toThrow(Error("Deleting MediaStation-Cache not possible, because ID does not exist in the repo: 0"));
    })
});

describe("isMediaStationCached() ", ()=>{
    it("should call contentFileService.deleteFile with the correct ID", async ()=>{
        //setup
        let receivedId:number = mediaStationRepo.addMediaStation("testName1");
        let mediaStation:MockMediaStation = mediaStationRepo.findMediaStation(receivedId) as MockMediaStation;
        mockContentFileService.fileExists.mockImplementationOnce((id) =>{
            if(id === 0)
                return true;
        });
        let answer:boolean;

        //method to test
        answer = await mediaStationRepo.isMediaStationCached(0);

        //tests
        expect(answer).toBe(true)
    })

    it("throw an error if mediastation id does not exist", async ()=>{
        //method to test
        await expect(mediaStationRepo.isMediaStationCached(0)).rejects.toThrow(Error("Checking MediaStation-Cache not possible, because ID does not exist in the repo: 0"));
    })
});

describe("markMediaIDtoDelete() ", ()=>{
    it("should call MediaFilesMarkedToDeleteService.saveID with the correct ID", async ()=>{
        //setup
        const spyFindMediaStation = jest.spyOn(mediaStationRepo, "findMediaStation");

        spyFindMediaStation.mockReturnValue(new MockMediaStation(0));

        //method to test
        await mediaStationRepo.markMediaIDtoDelete(0,1, 4);

        //tests
        expect(mockMediaFilesMarkedToDeleteService.addID).toHaveBeenCalledTimes(1);
        expect(mockMediaFilesMarkedToDeleteService.addID).toHaveBeenCalledWith(0,1, 4);
    })

    it("throw an error if mediastation id does not exist", async ()=>{
        //setup
        const spyFindMediaStation = jest.spyOn(mediaStationRepo, "findMediaStation");

        spyFindMediaStation.mockReturnValue(null);

        //method to test
        await expect(mediaStationRepo.markMediaIDtoDelete(0, 1,5)).rejects.toThrow(Error("Adding media-id to ids which should be deleted not possible, because the mediaStation does not exist: 0"));
    })
});

describe("deleteStoredMediaID() ", ()=>{
    it("should call MediaFilesMarkedToDeleteService.saveID with the correct ID", async ()=>{
        //setup
        const spyFindMediaStation = jest.spyOn(mediaStationRepo, "findMediaStation");

        spyFindMediaStation.mockReturnValue(new MockMediaStation(0));

        //method to test
        await mediaStationRepo.deleteStoredMediaID(0, 1,4);

        //tests
        expect(mockMediaFilesMarkedToDeleteService.removeID).toHaveBeenCalledTimes(1);
        expect(mockMediaFilesMarkedToDeleteService.removeID).toHaveBeenCalledWith(0,1, 4);
    })

    it("throw an error if mediastation id does not exist", async ()=>{
        //setup
        const spyFindMediaStation = jest.spyOn(mediaStationRepo, "findMediaStation");

        spyFindMediaStation.mockReturnValue(null);

        //method to test
        await expect(mediaStationRepo.deleteStoredMediaID(0, 0,5)).rejects.toThrow(Error("Deleting a media-id is not possible, because the mediaStation does not exist: 0"));
    })
});

describe("getAllMediaIDsToDelete() ", ()=>{
    it("should return the numbers of MediaFilesMarkedToDeleteService.getAllIds", async ()=>{
        //setup
        const spyFindMediaStation = jest.spyOn(mediaStationRepo, "findMediaStation");
        const mediaIdsToDelete:number[] = [10,4,5];
        let result:Map<number, number[]>;

        spyFindMediaStation.mockReturnValue(new MockMediaStation(0));
        mockMediaFilesMarkedToDeleteService.getAllIDS.mockImplementation((mediaStationId:number) => {
            if(mediaStationId === 0)
                return mediaIdsToDelete;
        });

        //method to test
        result = await mediaStationRepo.getAllMediaIDsToDelete(0);

        //tests
        expect(result).toEqual(mediaIdsToDelete);
    })

    it("should return an empty array if MediaFilesMarkedToDeleteService.getAllIds returns an empty array", async ()=>{
        //setup
        const spyFindMediaStation = jest.spyOn(mediaStationRepo, "findMediaStation");
        const mediaIdsToDelete:number[] = [];
        let result:Map<number, number[]>;

        spyFindMediaStation.mockReturnValue(new MockMediaStation(0));
        mockMediaFilesMarkedToDeleteService.getAllIDS.mockImplementation((mediaStationId:number) => {
            if(mediaStationId === 0)
                return mediaIdsToDelete;
        });

        //method to test
        result = await mediaStationRepo.getAllMediaIDsToDelete(0);

        //tests
        expect(result).toEqual(mediaIdsToDelete);
    })

    it("throw an error if mediastation id does not exist", async ()=>{
        //setup
        const spyFindMediaStation = jest.spyOn(mediaStationRepo, "findMediaStation");

        spyFindMediaStation.mockReturnValue(null);

        //method to test
        await expect(mediaStationRepo.getAllMediaIDsToDelete(0)).rejects.toThrow(Error("Getting the media-IDs marked for deletion for mediastation does not work, because the mediastation does not exist: 0"));
    })
});