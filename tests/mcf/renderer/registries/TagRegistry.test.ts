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
        let receivedTag: Tag;
        let tag:Tag = new Tag(200, "testName");

        tagRegistry.add(mockMediaStation, tag.name);
        receivedTag = tagRegistry.get(200);

        expect(receivedTag).toStrictEqual(tag);
    });

    it("getTag() should throw an error if the tag-id does not exist", () => {

        expect(() => tagRegistry.get(20)).toThrow(new Error("Tag with the following ID does not exist: 20"))
    });
});

describe("addTag(), removeTag() and getTag()", () => {
    it("when a tag is added and removed againg, getTag should throw an error", () => {
        let tag:Tag = new Tag(200, "testName");

        tagRegistry.add(mockMediaStation, tag.name);
        tagRegistry.remove(tag.id);

        expect(() => tagRegistry.get(200)).toThrow(new Error("Tag with the following ID does not exist: 200"))
    });
});

describe("addTag(), reset(), getAllTags()", () => {
    it("adding 2 tags should return them with getAllTags, resetting should return an empty map", () => {
        let receivedTags: Map<number, Tag>;
        let tag1:Tag = new Tag(200, "testName1");
        let tag2:Tag = new Tag(201, "testName2");

        mockMediaStation.getNextTagId.mockReturnValueOnce(200);
        tagRegistry.add(mockMediaStation, tag1.name);
        mockMediaStation.getNextTagId.mockReturnValueOnce(201);
        tagRegistry.add(mockMediaStation, tag2.name);
        receivedTags = tagRegistry.getAll();

        expect(receivedTags.get(200)).toStrictEqual(tag1);
        expect(receivedTags.get(201)).toStrictEqual(tag2);

        tagRegistry.reset();
        expect(tagRegistry.getAll().size).toBe(0);
    });
});