import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {Content} from "renderer/dataStructure/Content.js";
import {Image, IMedia, Video} from "renderer/dataStructure/Media.js";
import {MockImage, MockVideo} from "mocks/renderer/dataStructure/MockMedia.js";

let content: Content;

beforeEach(() => {
    content = new Content(0, 3);
});

afterEach(() => {
    jest.clearAllMocks();
});

const tagIds: number[] = [10, 20, 30, 11];

const expectedJSONContent: any = {
    id: 0,
    name: "myName2",
    lightIntensity: 1,
    tagIds: tagIds,
    media: [{
        mediaPlayerId: 0, type: "video", idOnMediaPlayer: 3, duration: 320, fileName: "video2.mp4",
        subtitles: [{iso6392T: "deu", title: "Deutsch"}, {iso6392T: "fra", title: "Französisch"}]
    },
        {mediaPlayerId: 1, type: "image", idOnMediaPlayer: 4, fileName: "image2.jpeg"}]
};

describe("importFromJSON() ", () => {
    it("should set all properties for itself", () => {
        content = new Content(0, 3);

        content.importFromJSON(expectedJSONContent);

        expect(content.id).toBe(expectedJSONContent.id);
        expect(content.name).toBe(expectedJSONContent.name);
        expect(content.tagIds).toEqual(tagIds)
        expect(content.lightIntensity).toBe(expectedJSONContent.lightIntensity);
        expect(content.folderId).toBe(3);
    });

    it("should call importFromJSON for each media object", () => {
        content = new Content(0, 3);

        content.importFromJSON(expectedJSONContent);

        expect(content.media.size).toBe(expectedJSONContent.media.length);

        for (const jsonMedia of expectedJSONContent.media) {
            const media = content.media.get(jsonMedia.mediaPlayerId);

            expect(media).toBeDefined();
            expect(media!.mediaPlayerId).toBe(jsonMedia.mediaPlayerId);
        }
    });
});

describe("exportToJSON() ", () => {
    it("should receive a valid JSON that contains all set properties", () => {
        let receivedJSON: any;
        content.name = "myName2";
        content.tagIds = tagIds;
        content.lightIntensity = 1;

        receivedJSON = content.exportToJSON();

        expect(JSON.stringify(receivedJSON)).not.toBe(undefined);
        expect(receivedJSON.id).toBe(0);
        expect(receivedJSON.name).toBe("myName2");
        expect(receivedJSON.tagIds).toEqual(tagIds);
        expect(receivedJSON.lightIntensity).toBe(1);
    });

    it("should return valid JSON containing the output from each media's exportToJSON()", () => {
        const video = new MockVideo();
        const image = new MockImage();

        const videoJSON = { type: "video", fileName: "video.mp4" };
        const imageJSON = { type: "image", fileName: "image.png" };

        video.exportToJSON.mockReturnValue(videoJSON);
        image.exportToJSON.mockReturnValue(imageJSON);

        content.media.set(0, video);
        content.media.set(1, image);

        const receivedJSON:any = content.exportToJSON();

        expect(receivedJSON).toBeDefined();
        expect(() => JSON.stringify(receivedJSON)).not.toThrow();

        expect(video.exportToJSON).toHaveBeenCalledTimes(1);
        expect(image.exportToJSON).toHaveBeenCalledTimes(1);

        expect(JSON.stringify(receivedJSON)).toContain(JSON.stringify(videoJSON));
        expect(JSON.stringify(receivedJSON)).toContain(JSON.stringify(imageJSON));
    });
});

describe("getMaxDuration() ", () => {
    it("should return the maximum duration of all video-media attached to the content", () => {
        let values: number[] = [100, 50, 200, 20, 1];
        let video: MockVideo;

        for (let i: number = 0; i < values.length; i++) {
            video = new MockVideo();
            video.duration = values[i];
            video.mediaPlayerId = i;
            content.media.set(i, video);
        }

        expect(content.getMaxDuration()).toBe(200);
    });

    it("should return 0 if there are no videos in the media", () => {
        let image: MockImage;

        for (let i: number = 0; i < 5; i++) {
            image = new MockImage();
            image.mediaPlayerId = i;
            content.media.set(i, image);
        }

        expect(content.getMaxDuration()).toBe(0);
    });
});

describe("getMedia() ", () => {
    it("should find the media if it is in one of the subfolders of the folder", () => {
        const image = new MockImage();
        image.mediaPlayerId = 3;
        content.media.set(3, image);
        const media: IMedia | null = content.getMedia(3);
        expect(media).toBe(image);
    });

    it("should return null if there is no media for the mediaPlayerId", () => {
        const media: IMedia | null = content.getMedia(333);
        expect(media).toBe(null);
    });

});

describe("requireMedia() ", () => {
    it("should find the media if it is in one of the subfolders of the folder", () => {
        const image = new MockImage();
        image.mediaPlayerId = 3;
        content.media.set(3, image);
        const media: IMedia = content.requireMedia(3);
        expect(media).toBe(image);
    });

    it("should throw an error if media-player-id is not one of the sub-folders", () => {
        expect(() => content.requireMedia(100)).toThrow(new Error("Media with mediaPlayer-ID 100 does not exist in Content: 0"));
    });
});