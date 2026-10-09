import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {Content} from "renderer/dataStructure/Content.js";
import {Image, IMedia, SubtitleInternal, Video} from "renderer/dataStructure/Media.js";
import {iso6392T} from "renderer/services/iso6392.js";

let content1: Content;
let content2: Content;

beforeEach(() => {
    content1 = new Content(0, 3);
    content2 = new Content(1, 3);
});

afterEach(() => {
    jest.clearAllMocks();
});

const tagIds: number[] = [10, 20, 30, 11];
const expectedJSONContent1: any = {
    id: 0,
    name: "myName1",
    lightIntensity: 2,
    tagIds: tagIds,
    media: [{
        mediaPlayerId: 0,
        type: "video",
        idOnMediaPlayer: 1,
        duration: 300,
        fileName: "video1.mp4",
        subtitles: []
    },
        {mediaPlayerId: 1, type: "image", idOnMediaPlayer: 2, fileName: "image1.jpeg"}]
};

const expectedJSONContent2: any = {
    id: 1,
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
    it("content 1: should set all properties for itself", () => {
        content1 = new Content(0, 3);

        content1.importFromJSON(expectedJSONContent1);

        expect(content1.id).toBe(expectedJSONContent1.id);
        expect(content1.name).toBe(expectedJSONContent1.name);
        expect(content1.tagIds).toEqual(tagIds)
        expect(content1.lightIntensity).toBe(expectedJSONContent1.lightIntensity);
        expect(content1.folderId).toBe(3);
    });

    it("content 1: should set all media correctly", () => {
        let video: Video;
        content1 = new Content(0, 4);

        content1.importFromJSON(expectedJSONContent1);

        expect(content1.media.size).toBe(2);
        video = content1.media.get(0) as Video;
        expect(video).not.toBeNull();
        expect(video).not.toBeUndefined();
        expect(video.mediaPlayerId).toBe(expectedJSONContent1.media[0].mediaPlayerId);
        expect(video.duration).toBe(expectedJSONContent1.media[0].duration);
        expect(video.idOnMediaPlayer).toBe(expectedJSONContent1.media[0].idOnMediaPlayer);
        expect(video.fileName).toBe(expectedJSONContent1.media[0].fileName);
        expect(video.subtitles).toStrictEqual([]);

        expect(content1.media.get(1)?.mediaPlayerId).toBe(expectedJSONContent1.media[1].mediaPlayerId);
        expect(content1.media.get(1)?.idOnMediaPlayer).toBe(expectedJSONContent1.media[1].idOnMediaPlayer);
        expect(content1.media.get(1)?.fileName).toBe(expectedJSONContent1.media[1].fileName);
    });

    it("content 2: should set all properties for itself", () => {
        content2 = new Content(1, 3);

        content2.importFromJSON(expectedJSONContent2);

        expect(content2.id).toBe(expectedJSONContent2.id);
        expect(content2.name).toBe(expectedJSONContent2.name);
        expect(content2.tagIds).toEqual(tagIds)
        expect(content2.lightIntensity).toBe(expectedJSONContent2.lightIntensity);
        expect(content2.folderId).toBe(3);
    });

    it("content 2: should set all media correctly", () => {
        let video: Video;
        const expectedSubs:SubtitleInternal[]=[
            new SubtitleInternal(iso6392T("deu"), "Deutsch"),
            new SubtitleInternal(iso6392T("fra"), "Französisch")
        ]
        content2 = new Content(1, 3);

        content2.importFromJSON(expectedJSONContent2);

        expect(content2.media.size).toBe(2);
        video = content2.media.get(0) as Video;
        expect(video).not.toBeNull();
        expect(video).not.toBeUndefined();
        expect(video.mediaPlayerId).toBe(expectedJSONContent2.media[0].mediaPlayerId);
        expect(video.duration).toBe(expectedJSONContent2.media[0].duration);
        expect(video.idOnMediaPlayer).toBe(expectedJSONContent2.media[0].idOnMediaPlayer);
        expect(video.fileName).toBe(expectedJSONContent2.media[0].fileName);
        expect(video.subtitles).toStrictEqual(expectedSubs);

        expect(content2.media.get(1)?.mediaPlayerId).toBe(expectedJSONContent2.media[1].mediaPlayerId);
        expect(content2.media.get(1)?.idOnMediaPlayer).toBe(expectedJSONContent2.media[1].idOnMediaPlayer);
        expect(content2.media.get(1)?.fileName).toBe(expectedJSONContent2.media[1].fileName);
    });
});

describe("exportToJSON() ", () => {
    it("should receive a valid JSON that contains all set properties of the content1 (no subtitles)", () => {
        let receivedJSON: any;
        content1.name = "myName1";
        content1.tagIds = tagIds;
        content1.lightIntensity = 2;

        let video: Video = new Video();
        video.idOnMediaPlayer = 1;
        video.mediaPlayerId = 0;
        video.duration = 300;
        video.subtitles = [];
        video.fileName = "video1.mp4"

        let image: Image = new Image();
        image.idOnMediaPlayer = 2;
        image.mediaPlayerId = 1;
        image.fileName = "image1.jpeg";

        content1.media.set(video.mediaPlayerId, video)
        content1.media.set(image.mediaPlayerId, image)

        receivedJSON = content1.exportToJSON();

        expect(JSON.stringify(receivedJSON)).not.toBe(undefined);
        expect(receivedJSON).toMatchObject(expectedJSONContent1);
    });

    it("should receive a valid JSON that contains all set properties of the content2 (including subtitles)", () => {
        let receivedJSON: any;
        content2.name = "myName2";
        content2.tagIds = tagIds;
        content2.lightIntensity = 1;

        let video: Video = new Video();
        video.idOnMediaPlayer = 3;
        video.mediaPlayerId = 0;
        video.duration = 320;
        video.subtitles = [new SubtitleInternal("deu", "Deutsch"),
            new SubtitleInternal("fra", "Französisch")];
        video.fileName = "video2.mp4";

        let image: Image = new Image();
        image.idOnMediaPlayer = 4;
        image.mediaPlayerId = 1;
        image.fileName = "image2.jpeg";

        content2.media.set(video.mediaPlayerId, video)
        content2.media.set(image.mediaPlayerId, image)

        receivedJSON = content2.exportToJSON();

        expect(JSON.stringify(receivedJSON)).not.toBe(undefined);
        expect(receivedJSON).toMatchObject(expectedJSONContent2);
    });
});

describe("getMaxDuration() ", () => {
    it("should return the maximum duration of all video-media attached to the content", () => {
        let values: number[] = [100, 50, 200, 20, 1];
        let video: Video;

        for (let i: number = 0; i < values.length; i++) {
            video = new Video();
            video.duration = values[i];
            video.mediaPlayerId = i;
            content1.media.set(i, video);
        }

        expect(content1.getMaxDuration()).toBe(200);
    });

    it("should return 0 if there are no videos in the media", () => {
        let image: Image;

        for (let i: number = 0; i < 5; i++) {
            image = new Image();
            image.mediaPlayerId = i;
            content1.media.set(i, image);
        }

        expect(content1.getMaxDuration()).toBe(0);
    });
});

describe("getMedia() ", () => {
    it("should find the media if it is in one of the subfolders of the folder", () => {
        const image = new Image();
        image.mediaPlayerId = 3;
        content1.media.set(3, image);
        const media: IMedia | null = content1.getMedia(3);
        expect(media).toBe(image);
    });

    it("should return null if there is no media for the mediaPlayerId", () => {
        const media: IMedia | null = content1.getMedia(333);
        expect(media).toBe(null);
    });

});

describe("requireMedia() ", () => {
    it("should find the media if it is in one of the subfolders of the folder", () => {
        const image = new Image();
        image.mediaPlayerId = 3;
        content1.media.set(3, image);
        const media: IMedia = content1.requireMedia(3);
        expect(media).toBe(image);
    });

    it("should throw an error if media-player-id is not one of the sub-folders", () => {
        expect(() => content1.requireMedia(100)).toThrow(new Error("Media with mediaPlayer-ID 100 does not exist in Content: 0"));
    });
});