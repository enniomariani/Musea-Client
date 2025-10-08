import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";

import {
    MediaStationCacheService
} from "src/mcf/renderer/services/mediastation/MediaStationCacheService";
import {
    MockMediaStationRepository
} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStation";

let mediaStationCacheService:MediaStationCacheService;
let mockMediaStationRepo:MockMediaStationRepository;

beforeEach(() => {
    mockMediaStationRepo = new MockMediaStationRepository();
    mediaStationCacheService = new MediaStationCacheService(mockMediaStationRepo);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("cacheMediaStation() ", ()=> {

    it("should call saveFile from contentFileService with correct parameters", () => {
        let mockMediaStation:MockMediaStation = new MockMediaStation(12);
        mockMediaStationRepo.requireMediaStation.mockImplementation((id) =>{
            if(id === 12)
                return mockMediaStation;
        })

        mediaStationCacheService.cacheMediaStation(12);

        expect(mockMediaStationRepo.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.cacheMediaStation).toHaveBeenCalledWith(12);
    });
});

describe("isMediaStationCached() ", ()=> {

    it("should return true if isMediaStationCached from mediaStationRepo returns true", async () => {
        let mockMediaStation:MockMediaStation = new MockMediaStation(15);
        mockMediaStationRepo.requireMediaStation.mockImplementation((id) =>{
            if(id === 12)
                return mockMediaStation;
        });
        mockMediaStationRepo.isMediaStationCached.mockImplementationOnce((id) =>{
            if(id === 12)
                return true;
        })
        let answer:boolean;

        answer = await mediaStationCacheService.isMediaStationCached(12);

        expect(answer).toBe(true);
    });

    it("should return false if isMediaStationCached from mediaStationRepo returns false", async () => {
        let mockMediaStation:MockMediaStation = new MockMediaStation(15);
        mockMediaStationRepo.requireMediaStation.mockImplementation((id) =>{
            if(id === 12)
                return mockMediaStation;
        });
        mockMediaStationRepo.isMediaStationCached.mockImplementationOnce((id) =>{
            if(id === 12)
                return false;
        })
        let answer:boolean;

        answer = await mediaStationCacheService.isMediaStationCached(12);

        expect(answer).toBe(false);
    });
});