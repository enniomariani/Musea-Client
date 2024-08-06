import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";

import {
    MediaStationCacheService
} from "../../../../src/js/renderer/mediaClientFramework/services/MediaStationCacheService";
import {
    MockContentFileService
} from "../../../__mocks__/renderer/mediaClientFramework/fileHandling/MockContentFileService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";

let mediaStationCacheService:MediaStationCacheService;
let mockContentFileService:MockContentFileService;
let mockMediaStationRepo:MockMediaStationRepository;

beforeEach(() => {
    mockContentFileService = new MockContentFileService();
    mockMediaStationRepo = new MockMediaStationRepository();
    mediaStationCacheService = new MediaStationCacheService(mockContentFileService, mockMediaStationRepo);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("cacheMediaStation() ", ()=> {

    it("should call saveFile from contentFileService with correct parameters", () => {
        // setup
        let mockJSON:any = {
            test: "asfasf",
            test2: true
        };
        let mockMediaStation:MockMediaStation = new MockMediaStation(12);
        mockMediaStation.exportToJSON.mockReturnValueOnce(mockJSON)
        mockMediaStationRepo.findMediaStation.mockImplementation((id) =>{
            if(id === 12)
                return mockMediaStation;
        })

        //method to test
        mediaStationCacheService.cacheMediaStation(12);

        //tests
        expect(mockContentFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockContentFileService.saveFile).toHaveBeenCalledWith(12, mockJSON);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockImplementation((id) =>{
            return null;
        })

        //tests
        expect(()=>mediaStationCacheService.cacheMediaStation(12)).toThrow(Error("Mediastation with this ID does not exist: 12"));
    });
});

describe("isMediaStationCached() ", ()=> {

    it("should return true if fileExists from contentFileService returns true", () => {
        // setup
        let mockMediaStation:MockMediaStation = new MockMediaStation(15);
        mockMediaStationRepo.findMediaStation.mockImplementation((id) =>{
            if(id === 12)
                return mockMediaStation;
        });
        mockContentFileService.fileExists.mockImplementationOnce((id) =>{
            if(id === 12)
                return true;
        })
        let answer:boolean;

        //method to test
        answer = mediaStationCacheService.isMediaStationCached(12);

        //tests
        expect(answer).toBe(true);
    });

    it("should return false if fileExists from contentFileService returns false", () => {
        // setup
        let mockMediaStation:MockMediaStation = new MockMediaStation(15);
        mockMediaStationRepo.findMediaStation.mockImplementation((id) =>{
            if(id === 12)
                return mockMediaStation;
        });
        mockContentFileService.fileExists.mockImplementationOnce((id) =>{
            if(id === 12)
                return false;
        })
        let answer:boolean;

        //method to test
        answer = mediaStationCacheService.isMediaStationCached(12);

        //tests
        expect(answer).toBe(false);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockImplementation((id) =>{
            return null;
        })

        //tests
        expect(()=>mediaStationCacheService.isMediaStationCached(12)).toThrow(Error("Mediastation with this ID does not exist: 12"));
    });
});