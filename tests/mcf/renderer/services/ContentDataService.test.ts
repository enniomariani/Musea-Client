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
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        contentService.createContent(mediaStationId,folderId,"testName");

        expect(mockContentManager.createContent).toHaveBeenCalledTimes(1);
        expect(mockContentManager.createContent).toHaveBeenCalledWith(mockMediaStation, "testName", folderId);
    });

    it("should return the ID of the created content", () => {
        let returnValue:number;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.createContent.mockReturnValueOnce(mockContent);

        returnValue = contentService.createContent(mediaStationId,folderId,"testName");

        expect(returnValue).toBe(contentId);

    });
});

describe("changeName() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let newName:string = "newName";

    it("should call contentManager.changeName with the correct arguments", () => {
        mockContent.name = "firstName";
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        contentService.changeName(mediaStationId,folderId,newName);

        expect(mockContentManager.changeName).toHaveBeenCalledTimes(1);
        expect(mockContentManager.changeName).toHaveBeenCalledWith(mockMediaStation, folderId, newName);
    });
});

describe("getName() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the folderId of the content", () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.requireContent.mockImplementation(( mediaStation, id)=>{
            if(mediaStation === mockMediaStation && id === contentId)
                return mockContent;
        });
        mockContent.name = "testName";

        let answer:string = contentService.getName(mediaStationId,contentId);

        expect(answer).toEqual("testName");
    });
});

describe("changeParentFolder() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let newFolderId: number = 28;

    it("should call folderManager.changeName with the correct arguments", () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        contentService.changeFolder(mediaStationId, contentId, newFolderId);

        expect(mockContentManager.changeFolder).toHaveBeenCalledTimes(1);
        expect(mockContentManager.changeFolder).toHaveBeenCalledWith(mockMediaStation, contentId, newFolderId);
    });
});

describe("getLightIntensity() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the lightIntensity of the content", () => {
        mockContent.lightIntensity = 33;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.requireContent.mockImplementation(( mediaStation, id)=>{
            if(mediaStation === mockMediaStation && id === contentId)
                return mockContent;
        });

        let answer:number = contentService.getLightIntensity(mediaStationId,contentId);

        expect(answer).toEqual(mockContent.lightIntensity);
    });
});

describe("getFolderId() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the folderId of the content", () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.requireContent.mockImplementation(( mediaStation, id)=>{
            if(mediaStation === mockMediaStation && id === contentId)
                return mockContent;
        });

        let answer:number = contentService.getFolderId(mediaStationId,contentId);

        expect(answer).toEqual(folderId);
    });
});

describe("getDuration() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the lightIntensity of the content", () => {
        mockContent.getMaxDuration.mockReturnValue( 221);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockContentManager.requireContent.mockImplementation(( mediaStation, id)=>{
            if(mediaStation === mockMediaStation && id === contentId)
                return mockContent;
        });

        let answer:number = contentService.getMaxDuration(mediaStationId,contentId);

        expect(answer).toEqual(221);
    });
});

describe("changeLightIntensity() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let newIntensity:number = 33;

    it("should call contentManager.changeLightIntensity with the correct arguments", () => {
        mockContent.lightIntensity = 0;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        contentService.changeLightIntensity(mediaStationId,contentId,newIntensity);

        expect(mockContentManager.changeLightIntensity).toHaveBeenCalledTimes(1);
        expect(mockContentManager.changeLightIntensity).toHaveBeenCalledWith(mockMediaStation, contentId, newIntensity);
    });
});

describe("deleteContent() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    const allMediaApps:Map<number, MediaApp> = new Map();
    allMediaApps.set(0, new MediaApp(0));
    allMediaApps.set(1, new MediaApp(1));
    mockMediaStation.mediaAppRegistry.getAll.mockReturnValue(allMediaApps);

    it("should call contentManager.deleteContent with the correct arguments", async () => {
        mockMediaService.getMediaType.mockReturnValue("image");
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await contentService.deleteContent(mediaStationId,folderId, contentId);

        expect(mockContentManager.deleteContent).toHaveBeenCalledTimes(1);
        expect(mockContentManager.deleteContent).toHaveBeenCalledWith(mockMediaStation, folderId, contentId);
    });

    it("should call mediaService.deleteMedia for each mediaApp defined with the correct arguments", async () => {
        mockMediaService.getMediaType.mockReturnValue("image");
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await contentService.deleteContent(mediaStationId,folderId, contentId);

        expect(mockMediaService.deleteMedia).toHaveBeenCalledTimes(2);
        expect(mockMediaService.deleteMedia).toHaveBeenNthCalledWith(1, mediaStationId, contentId, 0);
        expect(mockMediaService.deleteMedia).toHaveBeenNthCalledWith(2, mediaStationId, contentId, 1);
    });

    it("should NOT call mediaService.deleteMedia if mediaService.getMediaType returns null for all media-Apps", async ()=>{
        mockMediaService.getMediaType.mockReturnValue(null);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        await contentService.deleteContent(mediaStationId,folderId, contentId);

        expect(mockMediaService.deleteMedia).toHaveBeenCalledTimes(0);
    });
});