import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {Tag} from "@app/mcf/renderer/dataStructure/Tag";
import {TagRegistry} from "@app/mcf/renderer/registries/TagRegistry";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";

let tagRegistry: TagRegistry;
let mockMediaStation:MockMediaStation;

beforeEach(() => {
    mockMediaStation = new MockMediaStation(0);
    mockMediaStation.getNextTagId.mockReturnValue(200);

    tagRegistry = new TagRegistry();
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
        tagRegistry.addTag(mockMediaStation, tag.name);
        receivedTag = tagRegistry.getTag(200);

        //tests
        expect(receivedTag).toStrictEqual(tag);
    });

    it("getTag() should throw an error if the tag-id does not exist", () => {
        //tests
        expect(() => tagRegistry.getTag(20)).toThrow(new Error("Tag with the following ID does not exist: 20"))
    });
});

describe("addTag(), removeTag() and getTag()", () => {
    it("when a tag is added and removed againg, getTag should throw an error", () => {
        //setup
        let tag:Tag = new Tag(200, "testName");

        //method to test
        tagRegistry.addTag(mockMediaStation, tag.name);
        tagRegistry.removeTag(tag.id);

        //tests
        expect(() => tagRegistry.getTag(200)).toThrow(new Error("Tag with the following ID does not exist: 200"))
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
        tagRegistry.addTag(mockMediaStation, tag1.name);
        mockMediaStation.getNextTagId.mockReturnValueOnce(201);
        tagRegistry.addTag(mockMediaStation, tag2.name);
        receivedTags = tagRegistry.getAllTags();

        //tests
        expect(receivedTags.get(200)).toStrictEqual(tag1);
        expect(receivedTags.get(201)).toStrictEqual(tag2);

        tagRegistry.reset();
        expect(tagRegistry.getAllTags().size).toBe(0);
    });
});