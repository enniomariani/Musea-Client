import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {Content} from "../../../../renderer/dataStructure/Content";
import {Image, IMedia, Video} from "../../../../renderer/dataStructure/Media";
import {Folder} from "renderer/dataStructure/Folder";

let content: Content;

beforeEach(() => {
    content = new Content(0, 3);
});

afterEach(() => {
    jest.clearAllMocks();
});

const tagIds: number[] = [10, 20, 30, 11];
const expectedJSON: any = {
    id: 0,
    name: "myName",
    lightIntensity: 2,
    tagIds: tagIds,
    media: [{mediaAppId: 0, type: "video", idOnMediaApp: 20, duration: 300, fileName: "video1.mp4"},
        {mediaAppId: 1, type: "image", idOnMediaApp: 10, fileName: "image22.jpeg"}]
};

describe("importFromJSON() ", () => {
    it("should set all properties for itself", () => {
        content = new Content(0, 3);

        content.importFromJSON(expectedJSON);

        expect(content.id).toBe(expectedJSON.id);
        expect(content.name).toBe(expectedJSON.name);
        expect(content.tagIds).toEqual(tagIds)
        expect(content.lightIntensity).toBe(expectedJSON.lightIntensity);
        expect(content.folderId).toBe(3);
    });

    it("should set all media correctly", () => {
        let video: Video;
        content = new Content(0, 4);

        content.importFromJSON(expectedJSON);

        expect(content.media.size).toBe(2);
        video = content.media.get(0) as Video;
        expect(video).not.toBeNull();
        expect(video).not.toBeUndefined();
        expect(video.mediaAppId).toBe(expectedJSON.media[0].mediaAppId);
        expect(video.duration).toBe(expectedJSON.media[0].duration);
        expect(video.idOnMediaApp).toBe(expectedJSON.media[0].idOnMediaApp);
        expect(video.fileName).toBe(expectedJSON.media[0].fileName);

        expect(content.media.get(1)?.mediaAppId).toBe(expectedJSON.media[1].mediaAppId);
        expect(content.media.get(1)?.idOnMediaApp).toBe(expectedJSON.media[1].idOnMediaApp);
        expect(content.media.get(1)?.fileName).toBe(expectedJSON.media[1].fileName);
    });
});

describe("exportToJSON() ", () => {
    it("should receive a valid JSON that contains all set properties of the content", () => {
        let receivedJSON: any;
        content.name = "myName";
        content.tagIds = tagIds;
        content.lightIntensity = 2;
        let video: Video = new Video();
        video.idOnMediaApp = 20;
        video.mediaAppId = 0;
        video.duration = 300;
        video.fileName = "video1.mp4"

        let image: Image = new Image();
        image.idOnMediaApp = 10;
        image.mediaAppId = 1;
        image.fileName = "image22.jpeg";

        content.media.set(video.mediaAppId, video)
        content.media.set(image.mediaAppId, image)

        receivedJSON = content.exportToJSON();

        expect(JSON.stringify(receivedJSON)).not.toBe(undefined);
        expect(receivedJSON).toMatchObject(expectedJSON);
    });
});

describe("getMaxDuration() ", () => {
    it("should return the maximum duration of all video-media attached to the content", () => {
        let values: number[] = [100, 50, 200, 20, 1];
        let video: Video;

        for (let i: number = 0; i < values.length; i++) {
            video = new Video();
            video.duration = values[i];
            video.mediaAppId = i;
            content.media.set(i, video);
        }

        expect(content.getMaxDuration()).toBe(200);
    });

    it("should return 0 if there are no videos in the media", () => {
        let image: Image;

        for (let i: number = 0; i < 5; i++) {
            image = new Image();
            image.mediaAppId = i;
            content.media.set(i, image);
        }

        expect(content.getMaxDuration()).toBe(0);
    });
});

describe("getMedia() ", () => {
    it("should find the media if it is in one of the subfolders of the folder", () => {
        const image = new Image();
        image.mediaAppId = 3;
        content.media.set(3, image);
        const media: IMedia | null = content.getMedia(3);
        expect(media).toBe(image);
    });

    it("should return null if there is no media for the mediaAppId", () => {
        const media: IMedia | null = content.getMedia(333);
        expect(media).toBe(null);
    });

});

describe("requireMedia() ", () => {
    it("should find the media if it is in one of the subfolders of the folder", () => {
        const image = new Image();
        image.mediaAppId = 3;
        content.media.set(3, image);
        const media: IMedia = content.requireMedia(3);
        expect(media).toBe(image);
    });

    it("should throw an error if media-app-id is not one of the sub-folders", () => {
        expect(() => content.requireMedia(100)).toThrow(new Error("Media with mediaApp-ID 100 does not exist in Content: 0"));
    });
});