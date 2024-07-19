import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {ContentService} from "../../../../public_html/js/renderer/mediaClientFramework/services/ContentService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";
import {MockContentManager} from "../../../__mocks__/renderer/mediaClientFramework/dataManagers/MockContentManager";

let contentService:ContentService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockContentManager:MockContentManager;

beforeEach(() => {
    mockMediaStationRepo = new MockMediaStationRepository();
    mockContentManager = new MockContentManager();
    contentService = new ContentService(mockMediaStationRepo, mockContentManager);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createContent() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(0);
    it("", () => {
        //setup

    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockImplementationOnce((id)=>{
            return mockMediaStation;
        });

        //method to test
        contentService.createContent(0,1,"testName")

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockImplementationOnce((id)=>{
            return null;
        });

        //tests
        expect(()=> contentService.createContent(0,1,"testName")).toThrow(Error);
    });
});