import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {
    MediaStationRepository
} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaStationRepository";
import {MediaStation} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaStation";
import {
    MockMediaStationLocalMetaData
} from "../../../__mocks__/renderer/mediaClientFramework/fileHandling/MockMediaStationLocalMetaData";
import {MediaApp} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaApp";

let mediaStationRepo:MediaStationRepository;
let mockMediaStationLocalMetaData:MockMediaStationLocalMetaData;

beforeEach(() => {
    mockMediaStationLocalMetaData = new MockMediaStationLocalMetaData();
    mediaStationRepo = new MediaStationRepository(mockMediaStationLocalMetaData);
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
        let expectedId:number = 1;
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
        mapToSave.set(testName, "");

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
        mapToSave.set("testName1", "")

        mediaStationRepo.addMediaStation("testName1");
        receivedId = mediaStationRepo.addMediaStation("testName2");

        //method to test
        mediaStationRepo.deleteMediaStation(receivedId);

        //tests
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(3)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenNthCalledWith(3, mapToSave)
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

    it("should call mediaMetaDataService.save() with a map with an actualised ip", ()=>{
        //setup
        let receivedId:number;
        let mediaStation:MediaStation;
        let newIp:string = "222.222.222.20";
        let controllerApp:MediaApp = new MediaApp(0);
        controllerApp.role = MediaApp.ROLE_CONTROLLER;
        controllerApp.ip = "100.100.20.10";
        let mapToSave:Map<string, string> = new Map();
        mapToSave.set("testName1", newIp);

        receivedId = mediaStationRepo.addMediaStation("testName1");

        //method to test
        mediaStation = mediaStationRepo.findMediaStation(receivedId);
        mediaStation.mediaApps.push(controllerApp);
        controllerApp.ip = newIp;
        mediaStationRepo.updateAndSaveMediaStation(mediaStation);

        //tests
        expect(mockMediaStationLocalMetaData.save).toHaveBeenCalledTimes(2)
        expect(mockMediaStationLocalMetaData.save).toHaveBeenNthCalledWith(2, mapToSave)
    });
});