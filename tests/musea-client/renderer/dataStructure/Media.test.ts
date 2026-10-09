import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {Image, SubtitleInternal, Video} from "renderer/dataStructure/Media.js";
import {iso6392T} from "renderer/dataStructure/iso6392.js";

beforeEach(() => {

});

afterEach(() => {
    jest.clearAllMocks();
});

describe("importFromJSON() ", () => {
    it("Image: set all properties correctly", () => {
        let image: Image = new Image();
        const json:any = {mediaPlayerId: 1, type: "image", idOnMediaPlayer: 2, fileName: "image1.jpeg"};

        image.importFromJSON(json);

        expect(image.fileName).toBe("image1.jpeg");
        expect(image.mediaPlayerId).toBe(1);
        expect(image.idOnMediaPlayer).toBe(2);
    });

    it("content 2: should set all media correctly", () => {
        let video: Video = new Video();
        const json:any = {
            mediaPlayerId: 0, type: "video", idOnMediaPlayer: 3, duration: 320, fileName: "video2.mp4",
            subtitles: [{iso6392T: "deu", title: "Deutsch"}, {iso6392T: "fra", title: "Französisch"}]
        };

        const expectedSubs:SubtitleInternal[]=[
            new SubtitleInternal(iso6392T("deu"), "Deutsch"),
            new SubtitleInternal(iso6392T("fra"), "Französisch")
        ]

        video.importFromJSON(json);

        expect(video.fileName).toBe("video2.mp4");
        expect(video.mediaPlayerId).toBe(0);
        expect(video.idOnMediaPlayer).toBe(3);
        expect(video.duration).toBe(320);
        expect(video.subtitles).toStrictEqual(expectedSubs);
    });
});

describe("exportToJSON() ", () => {
    it("Image: should export a valid JSON that contains all set properties", () => {
        const expectedJSON:any = {mediaPlayerId: 1, type: "image", idOnMediaPlayer: 2, fileName: "image1.jpeg"};
        let receivedJSON: any;

        let image: Image = new Image();
        image.idOnMediaPlayer = 2;
        image.mediaPlayerId = 1;
        image.fileName = "image1.jpeg";

        receivedJSON = image.exportToJSON();

        expect(JSON.stringify(receivedJSON)).not.toBe(undefined);
        expect(receivedJSON).toMatchObject(expectedJSON);
    });

    it("Image: should export a valid JSON that contains all set properties (with subtitles)", () => {
        let receivedJSON: any;
        const expectedJSON:any = {
            mediaPlayerId: 0, type: "video", idOnMediaPlayer: 3, duration: 320, fileName: "video2.mp4",
            subtitles: [{iso6392T: "deu", title: "Deutsch"}, {iso6392T: "fra", title: "Französisch"}]
        };

        let video: Video = new Video();
        video.idOnMediaPlayer = 3;
        video.mediaPlayerId = 0;
        video.duration = 320;
        video.subtitles = [new SubtitleInternal("deu", "Deutsch"),
            new SubtitleInternal("fra", "Französisch")];
        video.fileName = "video2.mp4";

        receivedJSON = video.exportToJSON();

        expect(JSON.stringify(receivedJSON)).not.toBe(undefined);
        expect(receivedJSON).toMatchObject(expectedJSON);
    });

    it("Image: should export a valid JSON that contains all set properties (NO subtitles)", () => {
        let receivedJSON: any;
        const expectedJSON:any = {
            mediaPlayerId: 0, type: "video", idOnMediaPlayer: 3, duration: 320, fileName: "video2.mp4",
            subtitles: []
        };

        let video: Video = new Video();
        video.idOnMediaPlayer = 3;
        video.mediaPlayerId = 0;
        video.duration = 320;
        video.subtitles = [];
        video.fileName = "video2.mp4";

        receivedJSON = video.exportToJSON();

        expect(JSON.stringify(receivedJSON)).not.toBe(undefined);
        expect(receivedJSON).toMatchObject(expectedJSON);
    });
});