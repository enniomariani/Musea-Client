import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";

import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {FolderService} from "../../../../src/js/mcf/renderer/services/FolderService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockFolder} from "../../../__mocks__/mcf/renderer/dataStructure/MockFolder";
import {MockContent} from "../../../__mocks__/mcf/renderer/dataStructure/MockContent";
import {MockFolderManager} from "../../../__mocks__/mcf/renderer/dataManagers/MockFolderManager";

let folderService:FolderService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockFolderManager:MockFolderManager;

const mediaStationId:number = 0;
const folderId:number = 14;
const parentFolderId:number = 211;
let mockFolder:MockFolder;

beforeEach(() => {
    mockFolder = new MockFolder(folderId);

    mockMediaStationRepo = new MockMediaStationRepository();
    mockFolderManager = new MockFolderManager();
    folderService = new FolderService(mockMediaStationRepo, mockFolderManager);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createFolder() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call contentManager.createFolder with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        //method to test
        folderService.createFolder(mediaStationId,parentFolderId,"testName");

        //tests
        expect(mockFolderManager.createFolder).toHaveBeenCalledTimes(1);
        expect(mockFolderManager.createFolder).toHaveBeenCalledWith(mockMediaStation, "testName", parentFolderId);
    });

    it("should return the ID of the created content", () => {
        //setup
        let returnValue:number;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        //method to test
        returnValue = folderService.createFolder(mediaStationId,folderId,"testName");

        //tests
        expect(returnValue).toBe(folderId);

    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        //method to test
        folderService.createFolder(mediaStationId,folderId,"testName")

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> folderService.createFolder(mediaStationId,folderId,"testName")).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("changeName() ", ()=> {

    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let newName:string = "newName";

    it("should call folderManager.changeName with the correct arguments", () => {
        //setup
        mockFolder.name = "firstName";
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        folderService.changeName(mediaStationId,folderId,newName);

        //tests
        expect(mockFolderManager.changeName).toHaveBeenCalledTimes(1);
        expect(mockFolderManager.changeName).toHaveBeenCalledWith(mockMediaStation, folderId, newName);
    });

    it("should call mediaStationRepository.updateMediaStation", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        //method to test
        folderService.changeName(mediaStationId,folderId,newName);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> folderService.changeName(mediaStationId,folderId,newName)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("getAllSubFoldersInFolder() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let mockFolder:MockFolder = new MockFolder(0);
    let mapWithAllSubFolders:Map<number, MockFolder> = new Map();
    let mockFolder1:MockFolder = new MockFolder(0);
    mockFolder1.name = "name1";
    let mockFolder2:MockFolder = new MockFolder(1);
    mockFolder2.name = "name2";
    mapWithAllSubFolders.set(0, mockFolder1);
    mapWithAllSubFolders.set(1, mockFolder2);


    it("should return the result of folder.getAllSubFolders", () => {
        //setup
        let result:Map<number, string> = new Map();
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(mockFolder);
        mockFolder.getAllSubFolders.mockReturnValueOnce(mapWithAllSubFolders);

        //method to test
        result = folderService.getAllSubFoldersInFolder(mediaStationId,folderId);

        //tests
        expect(result.get(0)).toBe("name1");
        expect(result.get(1)).toBe("name2");
    });

    it("should throw an error if the folderId could not be found", ()=>{
        //setup
        mockMediaStation.rootFolder = mockFolder;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(null);

        //tests
        expect(()=> folderService.getAllSubFoldersInFolder(mediaStationId,folderId)).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> folderService.getAllSubFoldersInFolder(mediaStationId,folderId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});


describe("getAllContentsInFolder() ", ()=> {
    let mockMediaStation:MockMediaStation = new MockMediaStation(mediaStationId);
    let mockFolder:MockFolder = new MockFolder(0);
    let mapWithAllContents:Map<number, MockContent> = new Map();
    let mockContent1:MockContent = new MockContent(0);
    mockContent1.name = "name1";
    let mockContent2:MockContent = new MockContent(1);
    mockContent2.name = "name2";
    mapWithAllContents.set(0, mockContent1);
    mapWithAllContents.set(1, mockContent2);


    it("should return the result of folder.getAllContents", () => {
        //setup
        let result:Map<number, string> = new Map();
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(mockFolder);
        mockFolder.getAllContents.mockReturnValueOnce(mapWithAllContents);

        //method to test
        result = folderService.getAllContentsInFolder(mediaStationId,folderId);

        //tests
        expect(result.get(0)).toBe("name1");
        expect(result.get(1)).toBe("name2");
    });

    it("should throw an error if the folderId could not be found", ()=>{
        //setup
        mockMediaStation.rootFolder = mockFolder;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(null);

        //tests
        expect(()=> folderService.getAllContentsInFolder(mediaStationId,folderId)).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> folderService.getAllContentsInFolder(mediaStationId,folderId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});