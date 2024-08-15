import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {
    MediaStationDataService
} from "../../../../src/js/mcf/renderer/services/MediaStationDataService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MediaStation} from "../../../../src/js/mcf/renderer/dataStructure/MediaStation";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";

let mockMediaStationRepository:MockMediaStationRepository;
let mediaStationDataService:MediaStationDataService;

beforeEach(() => {
    mockMediaStationRepository = new MockMediaStationRepository();
    mediaStationDataService = new MediaStationDataService(mockMediaStationRepository);
});

afterEach(() => {
    jest.clearAllMocks();
});

const createdID:number = 5;

describe("loadMediaStations() ", ()=>{
    it("should return the map it got from the repo", async () =>{
        //setup
        let returnedMetaData:Map<string, string> = new Map();
        let key1:string = "mediaStation1";
        let key2:string = "mediaStation2";
        let key3:string = "mediaStation3";
        returnedMetaData.set(key1, "");
        returnedMetaData.set(key2, "192.168.2.1");
        returnedMetaData.set(key3, "192.168.2.100");
        let answer:Map<string, string>;

        mockMediaStationRepository.loadMediaStations.mockImplementation(()=>{
            return returnedMetaData;
        });

        //method to test
        answer = await mediaStationDataService.loadMediaStations();

        //tests
        expect(answer).toStrictEqual(returnedMetaData);
    });
});

describe("createMediaStation() ", ()=>{
    it("should return the ID of the mediastation created by the repository", ()=>{
        let name:string = "mediaStationName";
        let returnedValue:number;

        mockMediaStationRepository.addMediaStation.mockImplementationOnce((nameArg)=>{
            if(nameArg === name)
                return createdID;
        });

        //method to test
        returnedValue = mediaStationDataService.createMediaStation(name);

        //tests
        expect(returnedValue).toBe(createdID)
    });
});

describe("renameMediaStation() ", ()=>{

    it("should call findMediaStation and updateMediaStation from the repo", ()=>{
        let newName:string = "mediaStationNameNeu";

        let createdMediaStation:MediaStation = new MediaStation(createdID);

        mockMediaStationRepository.findMediaStation.mockImplementation((idArg)=>{
            if(idArg === createdID)
                return createdMediaStation;
        });

        //method to test
        mediaStationDataService.changeName(createdID, newName);

        //tests
        expect(mockMediaStationRepository.findMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepository.findMediaStation).toHaveBeenCalledWith(createdID);
        expect(mockMediaStationRepository.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepository.updateMediaStation).toHaveBeenCalledWith(createdMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepository.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> mediaStationDataService.changeName(createdID,"testName")).toThrow(new Error("Mediastation with this ID does not exist: " + createdID));
    });
});

describe("getName() ", ()=>{
    it("should call findMediaStation from the repo and return its name", ()=>{
        let newName:string = "mediaStationNameNeu";

        let nameReturned:string;
        let createdMediaStation:MediaStation = new MediaStation(createdID);
        createdMediaStation.name = newName;

        mockMediaStationRepository.findMediaStation.mockImplementation((idArg)=>{
            if(idArg === createdID)
                return createdMediaStation;
        });

        //method to test
        nameReturned = mediaStationDataService.getName(createdID);

        //tests
        expect(nameReturned).toBe(newName);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepository.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> mediaStationDataService.getName(createdID)).toThrow(new Error("Mediastation with this ID does not exist: " + createdID));
    });
});

describe("getControllerIp() ", ()=>{
    it("should call findMediaStation from the repo and return its controller-ip", ()=>{
        let controllerIp:string = "ip-address"
        let ipReturned:string;
        let createdMediaStation:MockMediaStation = new MockMediaStation(createdID);
        createdMediaStation.getControllerIp.mockImplementationOnce((idArg)=>{return controllerIp})

        mockMediaStationRepository.findMediaStation.mockImplementation((idArg)=>{
            if(idArg === createdID)
                return createdMediaStation;
        });

        //method to test
        ipReturned = mediaStationDataService.getControllerIp(createdID);

        //tests
        expect(ipReturned).toBe(controllerIp);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepository.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> mediaStationDataService.getControllerIp(createdID)).toThrow(new Error("Mediastation with this ID does not exist: " + createdID));
    });
});

describe("deleteMediaStation() ", ()=>{
    it("should call deleteMediaStation from the repo", ()=>{
        let createdMediaStation:MockMediaStation = new MockMediaStation(createdID);

        mockMediaStationRepository.findMediaStation.mockImplementation((idArg)=>{
            if(idArg === createdID)
                return createdMediaStation;
        });

        //method to test
        mediaStationDataService.deleteMediaStation(createdID);

        //tests
        expect(mockMediaStationRepository.deleteMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepository.deleteMediaStation).toHaveBeenCalledWith(createdID);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepository.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> mediaStationDataService.deleteMediaStation(createdID)).toThrow(new Error("Mediastation with this ID does not exist: " + createdID));
    });
});