import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";

import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";
import {FolderService} from "../../../../public_html/js/renderer/mediaClientFramework/services/FolderService";
import {
    MockMediaStationRepository
} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStationRepository";
import {MockFolder} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockFolder";
import {Content} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/Content";
import {MockContent} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockContent";

let folderService:FolderService;
let mockMediaStationRepo:MockMediaStationRepository;
const mediaStationId:number = 0;
const folderId:number = 14;

beforeEach(() => {
    mockMediaStationRepo = new MockMediaStationRepository();
    folderService = new FolderService(mockMediaStationRepo);
});

afterEach(() => {
    jest.clearAllMocks();
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