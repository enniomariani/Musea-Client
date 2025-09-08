import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";

import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {FolderDataService} from "@app/mcf/renderer/services/FolderDataService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockFolder} from "../../../__mocks__/mcf/renderer/dataStructure/MockFolder";
import {MockContent} from "../../../__mocks__/mcf/renderer/dataStructure/MockContent";
import {MockFolderManager} from "../../../__mocks__/mcf/renderer/dataManagers/MockFolderManager";
import {MockContentDataService} from "__mocks__/mcf/renderer/services/MockContentDataService";

let folderService: FolderDataService;
let mockMediaStationRepo: MockMediaStationRepository;
let mockFolderManager: MockFolderManager;
let mockContentService: MockContentDataService;

const mediaStationId: number = 0;
const folderId: number = 14;
const parentFolderId: number = 211;
let mockFolder: MockFolder;

beforeEach(() => {
    mockFolder = new MockFolder(folderId);

    mockMediaStationRepo = new MockMediaStationRepository();
    mockFolderManager = new MockFolderManager();
    mockContentService = new MockContentDataService();
    folderService = new FolderDataService(mockMediaStationRepo, mockContentService, mockFolderManager);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createFolder() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call contentManager.createFolder with the correct arguments", () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        folderService.createFolder(mediaStationId, parentFolderId, "testName");

        expect(mockFolderManager.createFolder).toHaveBeenCalledTimes(1);
        expect(mockFolderManager.createFolder).toHaveBeenCalledWith(mockMediaStation, "testName", parentFolderId);
    });

    it("should return the ID of the created content", () => {
        let returnValue: number;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        returnValue = folderService.createFolder(mediaStationId, folderId, "testName");

        expect(returnValue).toBe(folderId);
    });

    it("should call mediaStationRepository.updateMediaStation", () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        folderService.createFolder(mediaStationId, folderId, "testName")

        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });
});

describe("getIdOfParentFolder() ", () => {

    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the id of the parentfolder", () => {
        const mockParentFolder: MockFolder = new MockFolder(77);
        const mockFolder: MockFolder = new MockFolder(folderId);
        mockFolder.parentFolder = mockParentFolder;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockImplementation((mediaStationLocal, id) => {
            console.log("get folder: ", mediaStationLocal.id, id)
            if (mediaStationLocal.id === mockMediaStation.id && id === folderId)
                return mockFolder;
        })

        let answer: number = folderService.getIdOfParentFolder(mediaStationId, folderId);

        expect(answer).toBe(77);
    });

    it("should throw an error if the the folderId could not be found", () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder = jest.fn();
        mockFolderManager.getFolder.mockReturnValue(null);

        expect(() => folderService.getIdOfParentFolder(mediaStationId, folderId)).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });

    it("should throw an error if the the folder could be found, but has no parentFolder", () => {
        const mockFolder: MockFolder = new MockFolder(folderId);
        mockFolder.parentFolder = null;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockImplementation((mediaStationLocal, id) => {
            if (mediaStationLocal.id === mockMediaStation.id && id === folderId)
                return mockFolder;
        })

        expect(() => folderService.getIdOfParentFolder(mediaStationId, folderId)).toThrow(new Error("Folder with this ID does not have a parent-folder: " + folderId));
    });
});

describe("getName() ", () => {

    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the name of the folder", () => {
        mockFolder.name = "firstName";
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockImplementation((mediaStation, id) => {
            if (mediaStation === mockMediaStation && id === folderId)
                return mockFolder;
        });

        let answer: string = folderService.getName(mediaStationId, folderId);

        expect(answer).toEqual(mockFolder.name);
    });

    it("should throw an error if the folderId could not be found", () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockReturnValue(null);

        expect(() => folderService.getName(mediaStationId, folderId)).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });
});

describe("changeName() ", () => {

    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let newName: string = "newName";

    it("should call folderManager.changeName with the correct arguments", () => {
        mockFolder.name = "firstName";
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        folderService.changeName(mediaStationId, folderId, newName);

        expect(mockFolderManager.changeName).toHaveBeenCalledTimes(1);
        expect(mockFolderManager.changeName).toHaveBeenCalledWith(mockMediaStation, folderId, newName);
    });

    it("should call mediaStationRepository.updateMediaStation", () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        folderService.changeName(mediaStationId, folderId, newName);

        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });
});

describe("changeParentFolder() ", () => {

    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let newParentId: number = 28;

    it("should call folderManager.changeName with the correct arguments", () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);

        folderService.changeParentFolder(mediaStationId, folderId, newParentId);

        expect(mockFolderManager.changeParentFolder).toHaveBeenCalledTimes(1);
        expect(mockFolderManager.changeParentFolder).toHaveBeenCalledWith(mockMediaStation, folderId, newParentId);
    });

    it("should call mediaStationRepository.updateMediaStation", () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        folderService.changeParentFolder(mediaStationId, folderId, newParentId);

        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });
});

describe("getAllSubFoldersInFolder() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let mockFolder: MockFolder = new MockFolder(0);
    let mapWithAllSubFolders: Map<number, MockFolder> = new Map();
    let mockFolder1: MockFolder = new MockFolder(0);
    mockFolder1.name = "name1";
    let mockFolder2: MockFolder = new MockFolder(1);
    mockFolder2.name = "name2";
    mapWithAllSubFolders.set(0, mockFolder1);
    mapWithAllSubFolders.set(1, mockFolder2);

    it("should return the result of folder.getAllSubFolders", () => {
        let result: Map<number, string> = new Map();
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(mockFolder);
        mockFolder.getAllSubFolders.mockReturnValueOnce(mapWithAllSubFolders);

        result = folderService.getAllSubFoldersInFolder(mediaStationId, folderId);

        expect(result.get(0)).toBe("name1");
        expect(result.get(1)).toBe("name2");
    });

    it("should throw an error if the folderId could not be found", () => {
        mockMediaStation.rootFolder = mockFolder;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(null);

        expect(() => folderService.getAllSubFoldersInFolder(mediaStationId, folderId)).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });
});


describe("getAllContentsInFolder() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let mockFolder: MockFolder = new MockFolder(0);
    let mapWithAllContents: Map<number, MockContent> = new Map();
    let mockContent1: MockContent = new MockContent(0, 0);
    mockContent1.name = "name1";
    let mockContent2: MockContent = new MockContent(1, 0);
    mockContent2.name = "name2";
    mapWithAllContents.set(0, mockContent1);
    mapWithAllContents.set(1, mockContent2);

    it("should return the result of folder.getAllContents", () => {
        let result: Map<number, string> = new Map();
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(mockFolder);
        mockFolder.getAllContents.mockReturnValueOnce(mapWithAllContents);

        result = folderService.getAllContentsInFolder(mediaStationId, folderId);

        expect(result.get(0)).toBe("name1");
        expect(result.get(1)).toBe("name2");
    });

    it("should throw an error if the folderId could not be found", () => {
        mockMediaStation.rootFolder = mockFolder;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(null);

        expect(() => folderService.getAllContentsInFolder(mediaStationId, folderId)).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });
});

describe("deleteFolder() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let mockFolder: MockFolder = new MockFolder(0);
    mockFolder.parentFolder = new MockFolder(20);

    it("should call contentService.deleteContent for each content it got from getAllContentIDsInFolderAndSubFolders", async () => {
        const returnedContentIds: Map<number, number[]> = new Map();
        returnedContentIds.set(1, [2, 6, 11]);
        returnedContentIds.set(0, [3, 5, 8]);
        returnedContentIds.set(5, [2]);

        mockFolder.getAllContentIDsInFolderAndSubFolders.mockReturnValue(returnedContentIds);
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockReturnValueOnce(mockFolder);

        await folderService.deleteFolder(mediaStationId, folderId);

        expect(mockContentService.deleteContent).toHaveBeenCalledTimes(7);
        expect(mockContentService.deleteContent).toHaveBeenNthCalledWith(1, mediaStationId, 1, 2)
        expect(mockContentService.deleteContent).toHaveBeenNthCalledWith(2, mediaStationId, 1, 6)
        expect(mockContentService.deleteContent).toHaveBeenNthCalledWith(3, mediaStationId, 1, 11)
        expect(mockContentService.deleteContent).toHaveBeenNthCalledWith(4, mediaStationId, 0, 3)
        expect(mockContentService.deleteContent).toHaveBeenNthCalledWith(5, mediaStationId, 0, 5)
        expect(mockContentService.deleteContent).toHaveBeenNthCalledWith(6, mediaStationId, 0, 8)
        expect(mockContentService.deleteContent).toHaveBeenNthCalledWith(7, mediaStationId, 5, 2)
    });

    it("should call folderManager.deleteFolder with the correct arguments", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockReturnValueOnce(mockFolder);

        await folderService.deleteFolder(mediaStationId, folderId);

        expect(mockFolderManager.deleteFolder).toHaveBeenCalledTimes(1);
        expect(mockFolderManager.deleteFolder).toHaveBeenCalledWith(mockMediaStation, folderId, mockFolder.parentFolder.id);
    });

    it("should call mediaStationRepository.updateMediaStation", async () => {
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockReturnValueOnce(mockFolder);

        await folderService.deleteFolder(mediaStationId, folderId);

        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the folderId could not be found", async () => {
        mockMediaStation.rootFolder = mockFolder;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockReturnValueOnce(null);

        await expect(folderService.deleteFolder(mediaStationId, folderId)).rejects.toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });
});

describe("findContentsByNamePart() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let mockFolder: MockFolder = new MockFolder(0);
    let allFoundContents: MockContent[] = [];
    let mockContent1: MockContent = new MockContent(0, 0);
    mockContent1.name = "name1";
    let mockContent2: MockContent = new MockContent(1, 0);
    mockContent2.name = "name2";
    allFoundContents.push(mockContent1);
    allFoundContents.push(mockContent2);


    it("should return the result of folder.findContentsByNamePart", () => {
        let result:Map<number, string>;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(mockFolder);
        mockFolder.findContentsByNamePart.mockImplementation((namePart:string) =>{
            if(namePart === "name")
                return allFoundContents;
            else
                return null;
        });

        result = folderService.findContentsByNamePart(mediaStationId, folderId, "name");

        expect(result.get(0)).toBe("name1");
        expect(result.get(1)).toBe("name2");
    });

    it("should throw an error if the folderId could not be found", () => {
        mockMediaStation.rootFolder = mockFolder;
        mockMediaStationRepo.requireMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(null);

        expect(() => folderService.findContentsByNamePart(mediaStationId, folderId, "namePart")).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });
});