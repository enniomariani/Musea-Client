import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {
    MediaStationDataService
} from "../../../../public_html/js/renderer/mediaClientFramework/services/MediaStationDataService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MediaStation} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaStation";
import {
    MockMediaStationLocalMetaData
} from "../../../__mocks__/renderer/mediaClientFramework/fileHandling/MockMediaStationLocalMetaData";

let mockMediaStationRepository:MockMediaStationRepository;
let mockMediaStationLocalMetaDAta:MockMediaStationLocalMetaData;
let mediaStationDataService:MediaStationDataService;

beforeEach(() => {
    mockMediaStationLocalMetaDAta = new MockMediaStationLocalMetaData();
    mockMediaStationRepository = new MockMediaStationRepository(mockMediaStationLocalMetaDAta);
    mediaStationDataService = new MediaStationDataService(mockMediaStationRepository);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("loadMediaStations() ", ()=>{
    it("should call loadMediaStations() from the repo", ()=>{
        //method to test
        mediaStationDataService.loadMediaStations();

        //tests
        expect(mockMediaStationRepository.loadMediaStations).toHaveBeenCalledTimes(1);
    });
});

describe("createMediaStation() ", ()=>{
    it("should return the ID of the mediastation created by the repository", ()=>{
        let name:string = "mediaStationName";
        let returnedValue:number;
        let createdID:number = 5;

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
        let createdID:number = 5;
        let createdMediaStation:MediaStation = new MediaStation(createdID);

        mockMediaStationRepository.findMediaStation.mockImplementation((idArg)=>{
            if(idArg === createdID)
                return createdMediaStation;
        });

        //method to test
        mediaStationDataService.renameMediaStation(createdID, newName);

        //tests
        expect(mockMediaStationRepository.findMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepository.findMediaStation).toHaveBeenCalledWith(createdID);
        expect(mockMediaStationRepository.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepository.updateMediaStation).toHaveBeenCalledWith(createdMediaStation);
    });
});

describe("getNameOfMediaStation() ", ()=>{
    it("should call findMediaStation from the repo and return its name", ()=>{
        let newName:string = "mediaStationNameNeu";
        let createdID:number = 5;
        let nameReturned:string;
        let createdMediaStation:MediaStation = new MediaStation(createdID);
        createdMediaStation.name = newName;

        mockMediaStationRepository.findMediaStation.mockImplementation((idArg)=>{
            if(idArg === createdID)
                return createdMediaStation;
        });

        //method to test
        nameReturned = mediaStationDataService.getNameOfMediaStation(createdID);

        //tests
        expect(nameReturned).toBe(newName);
    });
});

describe("deleteMediaStation() ", ()=>{
    it("should call deleteMediaStation from the repo", ()=>{
        let id:number = 5;

        //method to test
        mediaStationDataService.deleteMediaStation(id);

        //tests
        expect(mockMediaStationRepository.deleteMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepository.deleteMediaStation).toHaveBeenCalledWith(id);
    });
});