import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";

import {
    MockMediaStationRepository
} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {Tag} from "@app/mcf/renderer/dataStructure/Tag";
import {MockContentManager} from "../../../__mocks__/mcf/renderer/dataManagers/MockContentManager";
import {MockContent} from "../../../__mocks__/mcf/renderer/dataStructure/MockContent";
import {TagDataService} from "../../../../src/mcf/renderer/services/TagDataService";

let tagService:TagDataService;
let mockMediaStationRepo:MockMediaStationRepository;
let mockContentManager:MockContentManager;
let mockMediaStation:MockMediaStation;

beforeEach(() => {
    mockMediaStation = new MockMediaStation(0);
    mockMediaStationRepo = new MockMediaStationRepository();
    mockContentManager = new MockContentManager();
    tagService = new TagDataService(mockMediaStationRepo, mockContentManager);

    mockMediaStationRepo.findMediaStation.mockImplementation((id) =>{
        if(id === 0)
            return mockMediaStation;
    });

    mockMediaStation.getNextTagId.mockReturnValue(333);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("addTag() ", ()=> {

    it("should call addTag of the mediastation with the correct parameters", () => {
        //method to test
        tagService.createTag(0, "newTag")

        //tests
        expect(mockMediaStation.addTag).toHaveBeenCalledTimes(1);
        expect(mockMediaStation.addTag).toHaveBeenCalledWith(333, "newTag");
    });

    it("should return the id of the newly created tag", () => {
        //method to test
        let id:number = tagService.createTag(0, "newTag");

        //tests
        expect(id).toBe(333);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> tagService.createTag(0, "newTag")).toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});

describe("deleteTag() ", ()=> {
    let mockContent1:MockContent;
    let mockContent2:MockContent;
    let mockContent3:MockContent;
    let allContentIds:Map<number, number[]>;

    function setup(){
        allContentIds = new Map();
        allContentIds.set(0, [1, 2]);
        allContentIds.set(1, [3]);

        mockContent1 = new MockContent(1, 0);
        mockContent1.tagIds = [12, 223, 0];
        mockContent2 = new MockContent(2, 0);
        mockContent2.tagIds = [12, 223, 0, 222];
        mockContent3 = new MockContent(3, 1);
        mockContent3.tagIds = [222];

        mockMediaStation.rootFolder.getAllContentIDsInFolderAndSubFolders.mockReturnValue(allContentIds);
        mockContentManager.getContent.mockImplementation((mediaStation, id)=>{
            console.log("mock get content: ", mediaStation.id, id)
                if(mediaStation.id === 0 && id === 1)
                    return mockContent1;
                else if(mediaStation.id === 0 && id === 2)
                    return mockContent2;
                else if(mediaStation.id === 0 && id === 3)
                    return mockContent3;
        });
    }

    it("should call removeTag of the mediastation with the correct parameters", () => {
        //setup
        setup();
        //method to test
        tagService.deleteTag(0, 222)

        //tests
        expect(mockMediaStation.removeTag).toHaveBeenCalledTimes(1);
        expect(mockMediaStation.removeTag).toHaveBeenCalledWith(222);
    });

    it("should remove the tags from all contents where it was added to", () => {
        //setup
        setup();
        //method to test
        tagService.deleteTag(0, 222)

        //tests
        expect(mockContent1.tagIds).toEqual([12, 223, 0])
        expect(mockContent2.tagIds).toEqual([12, 223, 0])
        expect(mockContent3.tagIds).toEqual([])

    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> tagService.deleteTag(0, 222)).toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});

describe("getAllTags() ", ()=> {

    it("should return all tags of the mediastation", () => {
        //setup
        let tag1:Tag = new Tag();
        tag1.id = 0;
        tag1.name = "testTag1";
        let tag2:Tag = new Tag();
        tag2.id = 1;
        tag2.name = "testTag2";
        let tag3:Tag = new Tag();
        tag3.id = 2;
        tag3.name = "testTag3";
        let mockTags:Map<number, Tag> = new Map();
        mockTags.set(0, tag1)
        mockTags.set(1, tag2)
        mockTags.set(2, tag3)

        mockMediaStation.getAllTags.mockImplementation(() =>{
                return mockTags;
        })
        //method to test
        let receivedTags:Map<number, string> = tagService.getAllTags(0)

        //tests
        expect(receivedTags.get(0)).toEqual(tag1.name);
        expect(receivedTags.get(1)).toEqual(tag2.name);
        expect(receivedTags.get(2)).toEqual(tag3.name);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> tagService.getAllTags(0)).toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});

describe("addTagToContent() ", ()=> {

    it("should add the passed tag-id to the tag-ids of the content", () => {
        //setup
        let mockContent:MockContent = new MockContent(22, 12);
        let expectedTags:number[] = [12,3, 21, 22];
        mockContent.tagIds = [12,3, 21];

        mockContentManager.getContent.mockImplementation((mediaStation, id) =>{
            if (id === 3)
                return mockContent;
        })
        //method to test
        tagService.addTagToContent(0, 3, 22)

        //tests
        expect(mockContent.tagIds).toEqual(expectedTags);
    });

    it("should throw an error if the ID is already on the content", () => {
        //setup
        let mockContent:MockContent = new MockContent(22, 12);
        mockContent.tagIds = [12,3, 21];

        mockContentManager.getContent.mockImplementation((mediaStation, id) =>{
            if (id === 3)
                return mockContent;
        })
        //method to test
        expect(()=> tagService.addTagToContent(0, 3, 21)).toThrow(new Error("Content has tag-id already: " + 21));
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> tagService.addTagToContent(0, 3, 222)).toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});

describe("removeTagFromContent() ", ()=> {

    it("should remove the passed tag-id from the tag-ids of the content", () => {
        //setup
        let mockContent:MockContent = new MockContent(22, 12);
        let expectedTags:number[] = [12,3];
        mockContent.tagIds = [12,3, 21];

        mockContentManager.getContent.mockImplementation((mediaStation, id) =>{
            if (id === 3)
                return mockContent;
        })
        //method to test
        tagService.removeTagFromContent(0, 3, 21)

        //tests
        expect(mockContent.tagIds).toEqual(expectedTags);
    });

    it("should throw an error if the ID is not on the content", () => {
        //setup
        let mockContent:MockContent = new MockContent(22, 12);
        mockContent.tagIds = [12,3, 21];

        mockContentManager.getContent.mockImplementation((mediaStation, id) =>{
            if (id === 3)
                return mockContent;
        })
        //method to test
        expect(()=> tagService.removeTagFromContent(0, 3, 4)).toThrow(new Error("Content has no tag-id: " + 4));
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> tagService.removeTagFromContent(0, 3, 222)).toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});

describe("getTagIdsForContent() ", ()=> {

    it("should return all tags of the content", () => {
        //setup
        let mockContent:MockContent = new MockContent(3, 12);

        mockContent.tagIds = [0, 21];

        mockContentManager.getContent.mockImplementation((mediaStation, id) =>{
            if (id === 3)
                return mockContent;
        })
        //method to test
        let allTags:number[] = tagService.getTagIdsForContent(0, 3)

        //tests
        expect(allTags[0]).toBe(0);
        expect(allTags[1]).toBe(21);
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> tagService.getTagIdsForContent(0, 3)).toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });
});

describe("findContentsByTag() ", ()=> {

    it("should return all tags of the content", () => {
        //setup$
        let allContentIds:Map<number, number[]> = new Map();
        allContentIds.set(1, [0]);
        allContentIds.set(3, [2]);
        allContentIds.set(13, [5,20]);
        const allContents:Map<number, MockContent> = new Map();
        allContents.set(0, new MockContent(0, 1))
        allContents.set(2, new MockContent(2, 3))
        allContents.set(5, new MockContent(5, 13))
        allContents.set(20, new MockContent(20, 13))

        allContents.get(0).tagIds = [];
        allContents.get(0).name = "content 0";
        allContents.get(2).tagIds = [1,3, 300];
        allContents.get(2).name = "content 2";
        allContents.get(5).tagIds = [300, 33, 13];
        allContents.get(5).name = "content 5";
        allContents.get(20).tagIds = [3];
        allContents.get(20).name = "content 20";

        mockMediaStation.rootFolder.getAllContentIDsInFolderAndSubFolders.mockImplementation(()=>{
            return allContentIds;
        });

        mockContentManager.getContent.mockImplementation((mediaStation, id) =>{
            return allContents.get(id);
        });

        //method to test
        let allContentsWithThisTag:Map<number, string> = tagService.findContentsByTag(0, 3)

        //tests
        expect(allContentsWithThisTag.size).toBe(2);
        expect(allContentsWithThisTag.get(2)).toBe("content 2");
        expect(allContentsWithThisTag.get(20)).toBe("content 20");
    });

    it("should throw an error if the mediaStationId could not be found", ()=>{
        //setup
        mockMediaStationRepo.findMediaStation.mockReturnValueOnce(null);

        //tests
        expect(()=> tagService.findContentsByTag(0, 3)).toThrow(new Error("Mediastation with this ID does not exist: " + 0));
    });

});