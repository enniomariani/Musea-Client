import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";

import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {FolderService} from "../../../../src/js/mcf/renderer/services/FolderService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockFolder} from "../../../__mocks__/mcf/renderer/dataStructure/MockFolder";
import {MockContent} from "../../../__mocks__/mcf/renderer/dataStructure/MockContent";
import {MockFolderManager} from "../../../__mocks__/mcf/renderer/dataManagers/MockFolderManager";
import {MockContentService} from "../../../__mocks__/mcf/renderer/services/MockContentService";

let folderService: FolderService;
let mockMediaStationRepo: MockMediaStationRepository;
let mockFolderManager: MockFolderManager;
let mockContentService: MockContentService;

const mediaStationId: number = 0;
const folderId: number = 14;
const parentFolderId: number = 211;
let mockFolder: MockFolder;

beforeEach(() => {
    mockFolder = new MockFolder(folderId);

    mockMediaStationRepo = new MockMediaStationRepository();
    mockFolderManager = new MockFolderManager();
    mockContentService = new MockContentService();
    folderService = new FolderService(mockMediaStationRepo, mockContentService, mockFolderManager);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createFolder() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    it("should call contentManager.createFolder with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        //method to test
        folderService.createFolder(mediaStationId, parentFolderId, "testName");

        //tests
        expect(mockFolderManager.createFolder).toHaveBeenCalledTimes(1);
        expect(mockFolderManager.createFolder).toHaveBeenCalledWith(mockMediaStation, "testName", parentFolderId);
    });

    it("should return the ID of the created content", () => {
        //setup
        let returnValue: number;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        //method to test
        returnValue = folderService.createFolder(mediaStationId, folderId, "testName");

        //tests
        expect(returnValue).toBe(folderId);

    });

    it("should call mediaStationRepository.updateMediaStation", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        //method to test
        folderService.createFolder(mediaStationId, folderId, "testName")

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => folderService.createFolder(mediaStationId, folderId, "testName")).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("getIdOfParentFolder() ", () => {

    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the id of the parentfolder", () => {
        //setup
        const mockParentFolder: MockFolder = new MockFolder(77);
        const mockFolder: MockFolder = new MockFolder(folderId);
        mockFolder.parentFolder = mockParentFolder;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockImplementation((mediaStationLocal, id) => {
            console.log("get folder: ", mediaStationLocal.id, id)
            if (mediaStationLocal.id === mockMediaStation.id && id === folderId)
                return mockFolder;
        })

        //method to test
        let answer: number = folderService.getIdOfParentFolder(mediaStationId, folderId);

        //tests
        expect(answer).toBe(77);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => folderService.getIdOfParentFolder(mediaStationId, folderId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });

    it("should throw an error if the the folderId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder = jest.fn();
        mockFolderManager.getFolder.mockReturnValue(null);

        //tests
        expect(() => folderService.getIdOfParentFolder(mediaStationId, folderId)).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });

    it("should throw an error if the the folder could be found, but has no parentFolder", () => {
        //setup
        const mockFolder: MockFolder = new MockFolder(folderId);
        mockFolder.parentFolder = null;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockImplementation((mediaStationLocal, id) => {
            if (mediaStationLocal.id === mockMediaStation.id && id === folderId)
                return mockFolder;
        })

        //tests
        expect(() => folderService.getIdOfParentFolder(mediaStationId, folderId)).toThrow(new Error("Folder with this ID does not have a parent-folder: " + folderId));
    });
});

describe("getName() ", () => {

    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);

    it("should return the name of the folder", () => {
        //setup
        mockFolder.name = "firstName";
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockImplementation((mediaStation, id) => {
            if (mediaStation === mockMediaStation && id === folderId)
                return mockFolder;
        });

        //method to test
        let answer: string = folderService.getName(mediaStationId, folderId);

        //tests
        expect(answer).toEqual(mockFolder.name);
    });

    it("should throw an error if the folderId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockReturnValue(null);

        //tests
        expect(() => folderService.getName(mediaStationId, folderId)).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => folderService.getName(mediaStationId, folderId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("changeName() ", () => {

    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let newName: string = "newName";

    it("should call folderManager.changeName with the correct arguments", () => {
        //setup
        mockFolder.name = "firstName";
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        folderService.changeName(mediaStationId, folderId, newName);

        //tests
        expect(mockFolderManager.changeName).toHaveBeenCalledTimes(1);
        expect(mockFolderManager.changeName).toHaveBeenCalledWith(mockMediaStation, folderId, newName);
    });

    it("should call mediaStationRepository.updateMediaStation", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        //method to test
        folderService.changeName(mediaStationId, folderId, newName);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => folderService.changeName(mediaStationId, folderId, newName)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("changeParentFolder() ", () => {

    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let newParentId: number = 28;

    it("should call folderManager.changeName with the correct arguments", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);

        //method to test
        folderService.changeParentFolder(mediaStationId, folderId, newParentId);

        //tests
        expect(mockFolderManager.changeParentFolder).toHaveBeenCalledTimes(1);
        expect(mockFolderManager.changeParentFolder).toHaveBeenCalledWith(mockMediaStation, folderId, newParentId);
    });

    it("should call mediaStationRepository.updateMediaStation", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.createFolder.mockReturnValueOnce(mockFolder);

        //method to test
        folderService.changeParentFolder(mediaStationId, folderId, newParentId);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => folderService.changeParentFolder(mediaStationId, folderId, newParentId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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
        //setup
        let result: Map<number, string> = new Map();
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(mockFolder);
        mockFolder.getAllSubFolders.mockReturnValueOnce(mapWithAllSubFolders);

        //method to test
        result = folderService.getAllSubFoldersInFolder(mediaStationId, folderId);

        //tests
        expect(result.get(0)).toBe("name1");
        expect(result.get(1)).toBe("name2");
    });

    it("should throw an error if the folderId could not be found", () => {
        //setup
        mockMediaStation.rootFolder = mockFolder;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(null);

        //tests
        expect(() => folderService.getAllSubFoldersInFolder(mediaStationId, folderId)).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => folderService.getAllSubFoldersInFolder(mediaStationId, folderId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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
        //setup
        let result: Map<number, string> = new Map();
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(mockFolder);
        mockFolder.getAllContents.mockReturnValueOnce(mapWithAllContents);

        //method to test
        result = folderService.getAllContentsInFolder(mediaStationId, folderId);

        //tests
        expect(result.get(0)).toBe("name1");
        expect(result.get(1)).toBe("name2");
    });

    it("should throw an error if the folderId could not be found", () => {
        //setup
        mockMediaStation.rootFolder = mockFolder;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(null);

        //tests
        expect(() => folderService.getAllContentsInFolder(mediaStationId, folderId)).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => folderService.getAllContentsInFolder(mediaStationId, folderId)).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});

describe("deleteFolder() ", () => {
    let mockMediaStation: MockMediaStation = new MockMediaStation(mediaStationId);
    let mockFolder: MockFolder = new MockFolder(0);
    mockFolder.parentFolder = new MockFolder(20);

    it("should call contentService.deleteContent for each content it got from getAllContentIDsInFolderAndSubFolders", async () => {
        //setup
        const returnedContentIds: Map<number, number[]> = new Map();
        returnedContentIds.set(1, [2, 6, 11]);
        returnedContentIds.set(0, [3, 5, 8]);
        returnedContentIds.set(5, [2]);

        mockFolder.getAllContentIDsInFolderAndSubFolders.mockReturnValue(returnedContentIds);
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockReturnValueOnce(mockFolder);

        //method to test
        await folderService.deleteFolder(mediaStationId, folderId);

        //tests
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
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockReturnValueOnce(mockFolder);

        //method to test
        await folderService.deleteFolder(mediaStationId, folderId);

        //tests
        expect(mockFolderManager.deleteFolder).toHaveBeenCalledTimes(1);
        expect(mockFolderManager.deleteFolder).toHaveBeenCalledWith(mockMediaStation, folderId, mockFolder.parentFolder.id);
    });

    it("should call mediaStationRepository.updateMediaStation", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockReturnValueOnce(mockFolder);

        //method to test
        await folderService.deleteFolder(mediaStationId, folderId);

        //tests
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.updateMediaStation).toHaveBeenCalledWith(mockMediaStation);
    });

    it("should throw an error if the folderId could not be found", async () => {
        //setup
        mockMediaStation.rootFolder = mockFolder;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockFolderManager.getFolder.mockReturnValueOnce(null);

        //tests
        await expect(folderService.deleteFolder(mediaStationId, folderId)).rejects.toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });

    it("should throw an error if the mediaStationId could not be found", async () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        await expect(folderService.deleteFolder(mediaStationId, folderId)).rejects.toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
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
        //setup
        let result:Map<number, string>;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(mockFolder);
        mockFolder.findContentsByNamePart.mockImplementation((namePart:string) =>{
            if(namePart === "name")
                return allFoundContents;
            else
                return null;
        });

        //method to test
        result = folderService.findContentsByNamePart(mediaStationId, folderId, "name");

        //tests
        expect(result.get(0)).toBe("name1");
        expect(result.get(1)).toBe("name2");
    });

    it("should throw an error if the folderId could not be found", () => {
        //setup
        mockMediaStation.rootFolder = mockFolder;
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(mockMediaStation);
        mockMediaStation.rootFolder.findFolder.mockReturnValueOnce(null);

        //tests
        expect(() => folderService.findContentsByNamePart(mediaStationId, folderId, "namePart")).toThrow(new Error("Folder with this ID does not exist: " + folderId));
    });

    it("should throw an error if the mediaStationId could not be found", () => {
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(() => folderService.findContentsByNamePart(mediaStationId, folderId, "namePart")).toThrow(new Error("Mediastation with this ID does not exist: " + mediaStationId));
    });
});