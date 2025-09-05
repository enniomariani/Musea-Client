import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {Tag} from "../../../../src/mcf/renderer/dataStructure/Tag";
import {TagManager} from "@app/mcf/renderer/dataManagers/TagManager";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";

let tagManager: TagManager;
let mockMediaStation:MockMediaStation;

beforeEach(() => {
    mockMediaStation = new MockMediaStation(0);
    mockMediaStation.getNextTagId.mockReturnValue(200);

    tagManager = new TagManager();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("addTag() and getTag()", () => {
    it("getTag should return the tag that was created with addTag()", () => {
        //setup
        let receivedTag: Tag;
        let tag:Tag = new Tag(200, "testName");

        //method to test
        tagManager.addTag(mockMediaStation, tag.name);
        receivedTag = tagManager.getTag(200);

        //tests
        expect(receivedTag).toStrictEqual(tag);
    });

    it("getTag() should throw an error if the tag-id does not exist", () => {
        //tests
        expect(() => tagManager.getTag(20)).toThrow(new Error("Tag with the following ID does not exist: 20"))
    });
});

describe("addTag(), removeTag() and getTag()", () => {
    it("when a tag is added and removed againg, getTag should throw an error", () => {
        //setup
        let tag:Tag = new Tag(200, "testName");

        //method to test
        tagManager.addTag(mockMediaStation, tag.name);
        tagManager.removeTag(tag.id);

        //tests
        expect(() => tagManager.getTag(200)).toThrow(new Error("Tag with the following ID does not exist: 200"))
    });
});

describe("addTag(), reset(), getAllTags()", () => {
    it("adding 2 tags should return them with getAllTags, resetting should return an empty map", () => {
        //setup
        let receivedTags: Map<number, Tag>;
        let tag1:Tag = new Tag(200, "testName1");
        let tag2:Tag = new Tag(201, "testName2");

        //method to test
        mockMediaStation.getNextTagId.mockReturnValueOnce(200);
        tagManager.addTag(mockMediaStation, tag1.name);
        mockMediaStation.getNextTagId.mockReturnValueOnce(201);
        tagManager.addTag(mockMediaStation, tag2.name);
        receivedTags = tagManager.getAllTags();

        //tests
        expect(receivedTags.get(200)).toStrictEqual(tag1);
        expect(receivedTags.get(201)).toStrictEqual(tag2);

        tagManager.reset();
        expect(tagManager.getAllTags().size).toBe(0);
    });
});