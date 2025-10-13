import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";

import {
    MockMediaStationRepository
} from "src/mcf/mocks/renderer/dataStructure/MockMediaStationRepository.js";
import {MockMediaStation} from "src/mcf/mocks/renderer/dataStructure/MockMediaStation";
import {Tag} from "renderer/dataStructure/Tag.js";
import {MockContentManager} from "src/mcf/mocks/renderer/dataManagers/MockContentManager";
import {MockContent} from "src/mcf/mocks/renderer/dataStructure/MockContent";
import {TagDataService} from "../../../../renderer/services/TagDataService.js";

let tagService: TagDataService;
let mockMediaStationRepo: MockMediaStationRepository;
let mockContentManager: MockContentManager;
let mockMediaStation: MockMediaStation;

beforeEach(() => {
    mockMediaStation = new MockMediaStation(0);
    mockMediaStationRepo = new MockMediaStationRepository();
    mockContentManager = new MockContentManager();
    tagService = new TagDataService(mockMediaStationRepo, mockContentManager);

    mockMediaStationRepo.requireMediaStation.mockImplementation((id) => {
        if (id === 0)
            return mockMediaStation;
    });

    mockMediaStation.getNextTagId.mockReturnValue(333);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("addTag() ", () => {

    it("should call addTag of the tagRegistry with the correct parameters", () => {

        tagService.createTag(0, "newTag")

        expect(mockMediaStation.tagRegistry.add).toHaveBeenCalledTimes(1);
        expect(mockMediaStation.tagRegistry.add).toHaveBeenCalledWith(333, "newTag");
    });

    it("should return the id of the newly created tag", () => {

        let id: number = tagService.createTag(0, "newTag");

        expect(id).toBe(333);
    });
});

describe("deleteTag() ", () => {
    let mockContent1: MockContent;
    let mockContent2: MockContent;
    let mockContent3: MockContent;
    let allContentIds: Map<number, number[]>;

    function setup() {
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
        mockContentManager.requireContent.mockImplementation((mediaStation:MockMediaStation, id:number) => {
            console.log("mock get content: ", mediaStation.id, id)
            if (mediaStation.id === 0 && id === 1)
                return mockContent1;
            else if (mediaStation.id === 0 && id === 2)
                return mockContent2;
            else if (mediaStation.id === 0 && id === 3)
                return mockContent3;
        });
    }

    it("should call removeTag of the tagmanager with the correct parameters", () => {
        setup();

        tagService.deleteTag(0, 222);

        expect(mockMediaStation.tagRegistry.remove).toHaveBeenCalledTimes(1);
        expect(mockMediaStation.tagRegistry.remove).toHaveBeenCalledWith(222);
    });

    it("should remove the tags from all contents where it was added to", () => {
        setup();

        tagService.deleteTag(0, 222)

        expect(mockContent1.tagIds).toEqual([12, 223, 0])
        expect(mockContent2.tagIds).toEqual([12, 223, 0])
        expect(mockContent3.tagIds).toEqual([])

    });
});

describe("getAllTags() ", () => {

    it("should return all tags of the mediastation", () => {
        let tag1: Tag = new Tag(0, "testTag1");
        let tag2: Tag = new Tag(1, "testTag2");
        let tag3: Tag = new Tag(2, "testTag3");
        let mockTags: Map<number, Tag> = new Map();
        mockTags.set(0, tag1)
        mockTags.set(1, tag2)
        mockTags.set(2, tag3)

        mockMediaStation.tagRegistry.getAll.mockImplementation(() => {
            return mockTags;
        })

        let receivedTags: Map<number, string> = tagService.getAllTags(0)

        expect(receivedTags.get(0)).toEqual(tag1.name);
        expect(receivedTags.get(1)).toEqual(tag2.name);
        expect(receivedTags.get(2)).toEqual(tag3.name);
    });
});

describe("addTagToContent() ", () => {
    it("should add the passed tag-id to the tag-ids of the content", () => {
        let mockContent: MockContent = new MockContent(22, 12);
        let expectedTags: number[] = [12, 3, 21, 22];
        mockContent.tagIds = [12, 3, 21];

        mockContentManager.requireContent.mockImplementation((mediaStation, id) => {
            if (id === 3)
                return mockContent;
        })

        tagService.addTagToContent(0, 3, 22)

        expect(mockContent.tagIds).toEqual(expectedTags);
    });

    it("should throw an error if the ID is already on the content", () => {
        let mockContent: MockContent = new MockContent(22, 12);
        mockContent.tagIds = [12, 3, 21];

        mockContentManager.requireContent.mockImplementation((mediaStation, id) => {
            if (id === 3)
                return mockContent;
        })

        expect(() => tagService.addTagToContent(0, 3, 21)).toThrow(new Error("Content has tag-id already: " + 21));
    });
});

describe("removeTagFromContent() ", () => {

    it("should remove the passed tag-id from the tag-ids of the content", () => {
        let mockContent: MockContent = new MockContent(22, 12);
        let expectedTags: number[] = [12, 3];
        mockContent.tagIds = [12, 3, 21];

        mockContentManager.requireContent.mockImplementation((mediaStation, id) => {
            if (id === 3)
                return mockContent;
        })

        tagService.removeTagFromContent(0, 3, 21)

        expect(mockContent.tagIds).toEqual(expectedTags);
    });

    it("should throw an error if the ID is not on the content", () => {
        let mockContent: MockContent = new MockContent(22, 12);
        mockContent.tagIds = [12, 3, 21];

        mockContentManager.requireContent.mockImplementation((mediaStation, id) => {
            if (id === 3)
                return mockContent;
        })

        expect(() => tagService.removeTagFromContent(0, 3, 4)).toThrow(new Error("Content has no tag-id: " + 4));
    });
});

describe("getTagIdsForContent() ", () => {

    it("should return all tags of the content", () => {
        let mockContent: MockContent = new MockContent(3, 12);

        mockContent.tagIds = [0, 21];

        mockContentManager.requireContent.mockImplementation((mediaStation, id) => {
            if (id === 3)
                return mockContent;
        })

        let allTags: number[] = tagService.getTagIdsForContent(0, 3)

        expect(allTags[0]).toBe(0);
        expect(allTags[1]).toBe(21);
    });
});

describe("findContentsByTag() ", () => {

    it("should return all tags of the content", () => {
        //setup$
        let allContentIds: Map<number, number[]> = new Map();
        allContentIds.set(1, [0]);
        allContentIds.set(3, [2]);
        allContentIds.set(13, [5, 20]);
        const allContents: Map<number, MockContent> = new Map();
        allContents.set(0, new MockContent(0, 1))
        allContents.set(2, new MockContent(2, 3))
        allContents.set(5, new MockContent(5, 13))
        allContents.set(20, new MockContent(20, 13))

        const content0:MockContent = allContents.get(0) as MockContent;
        const content2:MockContent = allContents.get(2) as MockContent;
        const content5:MockContent = allContents.get(5) as MockContent;
        const content20:MockContent = allContents.get(20) as MockContent;

        content0.tagIds = [];
        content0.name = "content 0";
        content2.tagIds = [1, 3, 300];
        content2.name = "content 2";
        content5.tagIds = [300, 33, 13];
        content5.name = "content 5";
        content20.tagIds = [3];
        content20.name = "content 20";

        mockMediaStation.rootFolder.getAllContentIDsInFolderAndSubFolders.mockImplementation(() => {
            return allContentIds;
        });

        mockContentManager.requireContent.mockImplementation((mediaStation, id) => {
            return allContents.get(id);
        });

        let allContentsWithThisTag: Map<number, string> = tagService.findContentsByTag(0, 3)

        expect(allContentsWithThisTag.size).toBe(2);
        expect(allContentsWithThisTag.get(2)).toBe("content 2");
        expect(allContentsWithThisTag.get(20)).toBe("content 20");
    });
});