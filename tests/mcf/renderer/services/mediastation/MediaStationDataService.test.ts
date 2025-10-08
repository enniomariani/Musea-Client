import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {
    MediaStationDataService
} from "src/mcf/renderer/services/mediastation/MediaStationDataService";
import {
    MockMediaStationRepository
} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStation";

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

        answer = await mediaStationDataService.loadMediaStations();

        expect(answer).toStrictEqual(returnedMetaData);
    });
});

describe("createMediaStation() ", ()=>{
    it("should return the ID of the mediastation created by the repository", async ()=>{
        let name:string = "mediaStationName";
        let returnedValue:number;

        mockMediaStationRepository.addMediaStation.mockImplementationOnce(async (nameArg)=>{
            if(nameArg === name)
                return createdID;
        });

        returnedValue = await mediaStationDataService.createMediaStation(name);

        expect(returnedValue).toBe(createdID)
    });
});

describe("renameMediaStation() ", ()=>{
    it("should call findMediaStation and updateAndSaveMediaStation from the repo", ()=>{
        let newName:string = "mediaStationNameNeu";
        let createdMediaStation:MockMediaStation = new MockMediaStation(createdID);

        mockMediaStationRepository.requireMediaStation.mockImplementation((idArg)=>{
            if(idArg === createdID)
                return createdMediaStation;
        });

        mediaStationDataService.changeName(createdID, newName);

        expect(mockMediaStationRepository.requireMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepository.requireMediaStation).toHaveBeenCalledWith(createdID);
        expect(mockMediaStationRepository.saveMediaStations).toHaveBeenCalledTimes(1);
    });
});

describe("getName() ", ()=>{
    it("should call findMediaStation from the repo and return its name", ()=>{
        let newName:string = "mediaStationNameNeu";

        let nameReturned:string;
        let createdMediaStation:MockMediaStation = new MockMediaStation(createdID);
        createdMediaStation.name = newName;

        mockMediaStationRepository.requireMediaStation.mockImplementation((idArg)=>{
            if(idArg === createdID)
                return createdMediaStation;
        });

        nameReturned = mediaStationDataService.getName(createdID);

        expect(nameReturned).toBe(newName);
    });
});

describe("getControllerIp() ", ()=>{
    it("should call findMediaStation from the repo and return its controller-ip", ()=>{
        let controllerIp:string = "ip-address"
        let ipReturned:string | null;
        let createdMediaStation:MockMediaStation = new MockMediaStation(createdID);
        createdMediaStation.mediaAppRegistry.getControllerIp.mockImplementationOnce((idArg)=>{return controllerIp})

        mockMediaStationRepository.requireMediaStation.mockImplementation((idArg)=>{
            if(idArg === createdID)
                return createdMediaStation;
        });

        ipReturned = mediaStationDataService.getControllerIp(createdID);

        expect(ipReturned).toBe(controllerIp);
    });
});

describe("deleteMediaStation() ", ()=>{
    it("should call deleteMediaStation from the repo", async ()=>{
        let createdMediaStation:MockMediaStation = new MockMediaStation(createdID);

        mockMediaStationRepository.requireMediaStation.mockImplementation((idArg)=>{
            if(idArg === createdID)
                return createdMediaStation;
        });

        await mediaStationDataService.deleteMediaStation(createdID);

        expect(mockMediaStationRepository.deleteMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepository.deleteMediaStation).toHaveBeenCalledWith(createdID);
    });
});