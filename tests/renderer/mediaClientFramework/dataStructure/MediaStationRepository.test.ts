import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {
    MediaStationRepository
} from "../../../../src/js/renderer/mediaClientFramework/dataStructure/MediaStationRepository";
import {MediaStation} from "../../../../src/js/renderer/mediaClientFramework/dataStructure/MediaStation";
import {
    MockMediaStationLocalMetaData
} from "../../../__mocks__/renderer/mediaClientFramework/fileHandling/MockMediaStationLocalMetaData";
import {MediaApp} from "../../../../src/js/renderer/mediaClientFramework/dataStructure/MediaApp";
import {MockMediaFileService} from "../../../__mocks__/renderer/mediaClientFramework/fileHandling/MockMediaFileService";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";

let mediaStationRepo:MediaStationRepository;
let mockMediaFileService:MockMediaFileService;
let mockMediaStationLocalMetaData:MockMediaStationLocalMetaData;

beforeEach(() => {
    mockMediaStationLocalMetaData = new MockMediaStationLocalMetaData();
    mockMediaFileService = new MockMediaFileService();

    mediaStationRepo = new MediaStationRepository(mockMediaStationLocalMetaData, "fakePathToDataFolder", mockMediaFileService,
        (id:number) => new MockMediaStation(id));
});

afterEach(() => {
    jest.clearAllMocks();
});

let returnedMetaData:Map<string, string> = new Map();
let key1:string = "mediaStation1";
let key2:string = "mediaStation2";
let key3:string = "mediaStation3";
returnedMetaData.set(key1, "");
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

    it("should call addMediaStation() for each of the loaded media-station-names", () =>{
        //setup
        jest.spyOn(mediaStationRepo, "addMediaStation");

        mockMediaStationLocalMetaData.load.mockImplementation(()=>{
            return returnedMetaData;
        });

        //method to test
        mediaStationRepo.loadMediaStations();

        //tests
        expect(mediaStationRepo.addMediaStation).toHaveBeenCalledTimes(3);
        expect(mediaStationRepo.addMediaStation).toHaveBeenNthCalledWith(1, key1);
        expect(mediaStationRepo.addMediaStation).toHaveBeenNthCalledWith(2, key2);
        expect(mediaStationRepo.addMediaStation).toHaveBeenNthCalledWith(3, key3);
    });

    it("should not throw an error if loaded data is null", () =>{
        //setup
        let errorThrown:boolean = false;
        mockMediaStationLocalMetaData.load.mockImplementation(()=>{
            return null;
        });

        //method to test
        try{
            mediaStationRepo.loadMediaStations();
        }catch(error){
            errorThrown = true;
        }

        //tests
        expect(errorThrown).toBe(false);
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

    it("should call mediaMetaDataService.save() with the mediastation-names and controller-ips", ()=>{
        //setup
        let testName:string = "testNameXY";
        let mapToSave:Map<string, string> = new Map();
        mapToSave.set(testName, "mock-controller-ip");

        //method to test
        mediaStationRepo.addMediaStation(testName);

        //tests
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(1)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledWith(mapToSave)
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
    it("should remove the mediastation-object from the repository", ()=>{
        //setup
        let receivedId:number;
        let nameMediaStation:string = "testName";
        let foundMediaStation:MediaStation;

        receivedId = mediaStationRepo.addMediaStation(nameMediaStation);
        mediaStationRepo.addMediaStation("testName2");

        //method to test
        mediaStationRepo.deleteMediaStation(receivedId);
        foundMediaStation = mediaStationRepo.findMediaStation(receivedId);

        //tests
        expect(foundMediaStation).toEqual(null);
    });

    it("should call mediaMetaDataService.save() with an empty Map if there was only one mediastation", ()=>{
        //setup
        let receivedId:number;
        let nameMediaStation:string = "testName";
        let mapToSave:Map<string, string> = new Map();

        receivedId = mediaStationRepo.addMediaStation(nameMediaStation);

        //method to test
        mediaStationRepo.deleteMediaStation(receivedId);

        //tests
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(2)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenNthCalledWith(2, mapToSave)
    });

    it("should call mediaMetaDataService.save() with a map with 1 entry if there were 2 mediastations", ()=>{
        //setup
        let receivedId:number;
        let mapToSave:Map<string, string> = new Map();
        mapToSave.set("testName1", "mock-controller-ip")

        mediaStationRepo.addMediaStation("testName1");
        receivedId = mediaStationRepo.addMediaStation("testName2");

        //method to test
        mediaStationRepo.deleteMediaStation(receivedId);

        //tests
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(3)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenNthCalledWith(3, mapToSave)
    });

    it("should remove any cached media if there are some and clear the cachedMedia map", ()=>{
        //setup
        let receivedId:number;
        let mapToSave:Map<string, string> = new Map();
        mapToSave.set("testName1", "")

        mediaStationRepo.addMediaStation("testName1");
        receivedId = mediaStationRepo.addMediaStation("testName2");
        mediaStationRepo.getAllCachedMedia().set(receivedId, [{contentId: 0, mediaAppId: 2, fileExtension: "jpeg"}, {contentId: 22, mediaAppId: 23, fileExtension: "mp4"}])

        //method to test
        mediaStationRepo.deleteMediaStation(receivedId);

        //tests
        expect(mockMediaFileService.deleteFile).toHaveBeenCalledTimes(2);
        expect(mockMediaFileService.deleteFile).toHaveBeenNthCalledWith(1, receivedId, 0, 2, "jpeg");
        expect(mockMediaFileService.deleteFile).toHaveBeenNthCalledWith(2, receivedId, 22, 23, "mp4");
        expect(mediaStationRepo.getAllCachedMedia().get(receivedId)).toBeUndefined();
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
    it("should call mediaFileService.saveFile with the passed parameters", ()=>{
        //setup
        let data:Uint8Array = new Uint8Array([0x00, 0x11, 0xFF]);

        //method to test
        mediaStationRepo.cacheMedia(0,1,2,"jpeg", data);

        //tests
        expect(mockMediaFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockMediaFileService.saveFile).toHaveBeenCalledWith(0, 1,2, "jpeg", data);
    });

    it("should add the cached media to cachedMedia and create a mediaStationId if it does not exist", ()=>{
        //setup
        let data:Uint8Array = new Uint8Array([0x00, 0x11, 0xFF]);

        //method to test
        mediaStationRepo.cacheMedia(0,1,2,"jpeg", data);

        //tests
        expect(mediaStationRepo.getAllCachedMedia().get(0)).not.toBeNull();
        expect(mediaStationRepo.getAllCachedMedia().get(0)).not.toBeUndefined();
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].mediaAppId).toBe(2);
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].contentId).toBe(1);
        expect(mediaStationRepo.getAllCachedMedia().get(0)[0].fileExtension).toBe("jpeg");
    });

    it("should add the cached media to cachedMedia if the mediastation already exists and has already a cached file set", ()=>{
        //setup
        let data:Uint8Array = new Uint8Array([0x00, 0x11, 0xFF]);

        //method to test
        mediaStationRepo.cacheMedia(0,1,2,"jpeg", data);
        mediaStationRepo.cacheMedia(0,2,2,"mp4", data);

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
    it("should call mediaFileService.fileExists with the passed parameters", ()=>{
        //method to test
        mediaStationRepo.isMediaCached(0,1,2, "jpeg");

        //tests
        expect(mockMediaFileService.fileExists).toHaveBeenCalledTimes(1);
        expect(mockMediaFileService.fileExists).toHaveBeenCalledWith(0, 1,2, "jpeg");
    });

    it("should return what mediaFileService.fileExists returns", ()=>{
        //setup
        let answer:boolean;
        mockMediaFileService.fileExists.mockReturnValueOnce(true);

        //method to test
        answer = mediaStationRepo.isMediaCached(0,1,2, "jpeg");

        //tests
        expect(answer).toBe(true);
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