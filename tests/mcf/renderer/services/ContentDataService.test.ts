import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {ContentDataService} from "src/mcf/renderer/services/ContentDataService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MockContentManager} from "../../../__mocks__/mcf/renderer/dataManagers/MockContentManager";
import {MockContent} from "../../../__mocks__/mcf/renderer/dataStructure/MockContent";
import {MediaApp} from "../../../../src/mcf/renderer/dataStructure/MediaApp";
import {MockMediaService} from "../../../__mocks__/mcf/renderer/services/MockMediaService";

let contentService:ContentDataService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockContentManager:MockContentManager;
let mockMediaService:MockMediaService;

const mediaStationId:number = 0;
const folderId:number = 10;
const contentId:number = 12;
let mockContent:MockContent;

beforeEach(() => {
    mockContent = new MockContent(contentId, folderId);
    mockMediaStationRepo = new MockMediaStationRepository();
    mockContentManager = new MockContentManager();
    mockMediaService = new MockMediaService();
    contentService = new ContentDataService(mockMediaStationRepo, mockMediaService, mockContentManager);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createContent() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call contentManager.createContent with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        contentService.createContent(mediaStationId,folderId,"testName");

        //tests
        expect(mockContentManager.createContent).toHaveBeenCalledTimes(1);
        expect(mockContentManager.createContent).toHaveBeenCalledWith(mockMediaStation, "testName", folderId);
    });

    it("should return the ID of the created content", () => {
        //setup
        let returnValue:number;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        returnValue = contentService.createContent(mediaStationId,folderId,"testName");

        //tests
        expect(returnValue).toBe(contentId);

    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        contentService.createContent(mediaStationId,folderId,"testName")

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.createContent(mediaStationId,folderId,"testName")).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("changeName() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let newName:string = "newName";

    it("should call contentManager.changeName with the correct arguments", () => {
        //setup
        mockContent.name = "firstName";
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        contentService.changeName(mediaStationId,folderId,newName);

        //tests
        expect(mockContentManager.changeName).toHaveBeenCalledTimes(1);
        expect(mockContentManager.changeName).toHaveBeenCalledWith(mockMediaStation, folderId, newName);
    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        contentService.changeName(mediaStationId,folderId,newName);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.changeName(mediaStationId,folderId,newName)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("changeParentFolder() ", () => {

    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let newFolderId: number = 28;

    it("should call folderManager.changeName with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        contentService.changeFolder(mediaStationId, contentId, newFolderId);

        //tests
        expect(mockContentManager.changeFolder).toHaveBeenCalledTimes(1);
        expect(mockContentManager.changeFolder).toHaveBeenCalledWith(mockMediaStation, contentId, newFolderId);
    });

    it("should call mediaStationRepository.updateMediaStation", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        contentService.changeFolder(mediaStationId, contentId, newFolderId);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => contentService.changeFolder(mediaStationId, contentId, newFolderId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("getLightIntensity() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the lightIntensity of the content", () => {
        //setup
        mockContent.lightIntensity = 33;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockImplementation(( mediaStation, id)=>{
            if(mediaStation === mockMediaStation && id === contentId)
                return mockContent;
        });

        //method to test
        let answer:number = contentService.getLightIntensity(mediaStationId,contentId);

        //tests
        expect(answer).toEqual(mockContent.lightIntensity);
    });

    it("should throw an error if the contentId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockReturnValue(null);

        //tests
        expect(()=> contentService.getLightIntensity(mediaStationId,contentId)).toThrow(new Error("Content with this ID does not exist: " + contentId));
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.getLightIntensity(mediaStationId,contentId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("getFolderId() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the folderId of the content", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockImplementation(( mediaStation, id)=>{
            if(mediaStation === mockMediaStation && id === contentId)
                return mockContent;
        });

        //method to test
        let answer:number = contentService.getFolderId(mediaStationId,contentId);

        //tests
        expect(answer).toEqual(folderId);
    });

    it("should throw an error if the contentId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockReturnValue(null);

        //tests
        expect(()=> contentService.getFolderId(mediaStationId,contentId)).toThrow(new Error("Content with this ID does not exist: " + contentId));
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.getFolderId(mediaStationId,contentId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("getDuration() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the lightIntensity of the content", () => {
        //setup
        mockContent.getMaxDuration.mockReturnValue( 221);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockImplementation(( mediaStation, id)=>{
            if(mediaStation === mockMediaStation && id === contentId)
                return mockContent;
        });

        //method to test
        let answer:number = contentService.getMaxDuration(mediaStationId,contentId);

        //tests
        expect(answer).toEqual(221);
    });

    it("should throw an error if the contentId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.getContent.mockReturnValue(null);

        //tests
        expect(()=> contentService.getMaxDuration(mediaStationId,contentId)).toThrow(new Error("Content with this ID does not exist: " + contentId));
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.getMaxDuration(mediaStationId,contentId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("changeLightIntensity() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let newIntensity:number = 33;

    it("should call contentManager.changeLightIntensity with the correct arguments", () => {
        //setup
        mockContent.lightIntensity = 0;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        contentService.changeLightIntensity(mediaStationId,contentId,newIntensity);

        //tests
        expect(mockContentManager.changeLightIntensity).toHaveBeenCalledTimes(1);
        expect(mockContentManager.changeLightIntensity).toHaveBeenCalledWith(mockMediaStation, contentId, newIntensity);
    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        contentService.changeLightIntensity(mediaStationId,contentId,newIntensity);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> contentService.changeLightIntensity(mediaStationId,contentId,newIntensity)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("deleteContent() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    const allMediaApps:Map<number, MediaApp> = new Map();
    allMediaApps.set(0, new MediaApp(0));
    allMediaApps.set(1, new MediaApp(1));
    mockMediaStation.getAllMediaApps.mockReturnValue(allMediaApps);

    it("should call contentManager.deleteContent with the correct arguments", async () => {
        //setup
        mockMediaService.getMediaType.mockReturnValue("image");
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.deleteContent(mediaStationId,folderId, contentId);

        //tests
        expect(mockContentManager.deleteContent).toHaveBeenCalledTimes(1);
        expect(mockContentManager.deleteContent).toHaveBeenCalledWith(mockMediaStation, folderId, contentId);
    });

    it("should call mediaService.deleteMedia for each mediaApp defined with the correct arguments", async () => {
        //setup
        mockMediaService.getMediaType.mockReturnValue("image");
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.deleteContent(mediaStationId,folderId, contentId);

        //tests
        expect(mockMediaService.deleteMedia).toHaveBeenCalledTimes(2);
        expect(mockMediaService.deleteMedia).toHaveBeenNthCalledWith(1, mediaStationId, contentId, 0);
        expect(mockMediaService.deleteMedia).toHaveBeenNthCalledWith(2, mediaStationId, contentId, 1);
    });

    it("should NOT call mediaService.deleteMedia if mediaService.getMediaType returns null for all media-Apps", async ()=>{
        //setup
        mockMediaService.getMediaType.mockReturnValue(null);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        await contentService.deleteContent(mediaStationId,folderId, contentId);

        //tests
        expect(mockMediaService.deleteMedia).toHaveBeenCalledTimes(0);
    });

    it("should call mediaStationRepository.updateMediaStation", async ()=>{
        //setup
        mockMediaService.getMediaType.mockReturnValue("image");
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        //method to test
        await contentService.deleteContent(mediaStationId,folderId, contentId);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", async ()=>{
        //setup
        mockMediaService.getMediaType.mockReturnValue("image");
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(contentService.deleteContent(mediaStationId,folderId, contentId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});