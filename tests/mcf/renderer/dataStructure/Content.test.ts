import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {Content} from "../../../../src/js/mcf/renderer/dataStructure/Content";
import {Image, Video} from "../../../../src/js/mcf/renderer/dataStructure/Media";

let content:Content;

beforeEach(() => {
    content = new Content(0);
});

afterEach(() => {
    jest.clearAllMocks();
});

const tagIds:number[] = [10,20, 30,11];
const expectedJSON:any = {
    id: 0,
    name: "myName",
    tagIds: tagIds,
    media: [{mediaAppId: 0, type: "video", idOnMediaApp: 20, duration: 300}, {mediaAppId: 1, type: "image", idOnMediaApp: 10}]
};


describe("importFromJSON() ", () => {
    it("should set all properties for itself", () => {
        //setup
        content = new Content(0);

        //method to test
        content.importFromJSON(expectedJSON);

        //tests
        expect(content.id).toBe(expectedJSON.id);
        expect(content.name).toBe(expectedJSON.name);
    });

    it("should set all media correctly", () => {
        //setup
        let video:Video;
        content = new Content(0);

        //method to test
        content.importFromJSON(expectedJSON);

        //tests
        expect(content.media.size).toBe(2);
        video = content.media.get(0) as Video;
        expect(video).not.toBeNull();
        expect(video).not.toBeUndefined();
        expect(video.mediaAppId).toBe(expectedJSON.media[0].mediaAppId);
        expect(video.duration).toBe(expectedJSON.media[0].duration);
        expect(video.idOnMediaApp).toBe(expectedJSON.media[0].idOnMediaApp);

        expect(content.media.get(1).mediaAppId).toBe(expectedJSON.media[1].mediaAppId);
        expect(content.media.get(1).idOnMediaApp).toBe(expectedJSON.media[1].idOnMediaApp);
    });
});

describe("exportToJSON() ", ()=>{
    it("should receive a valid JSON that contains all set properties of the content", ()=>{
        //setup

        let receivedJSON:any;
        content.name = "myName";
        content.tagIds = tagIds;
        let video:Video = new Video();
        video.idOnMediaApp = 20;
        video.mediaAppId = 0;
        video.duration = 300;

        let image:Image = new Image();
        image.idOnMediaApp = 10;
        image.mediaAppId = 1;

        content.media.set(video.mediaAppId, video)
        content.media.set(image.mediaAppId, image)


        //method to test
        receivedJSON = content.exportToJSON();

        //tests
        expect(JSON.stringify(receivedJSON)).not.toBe(undefined);
        expect(receivedJSON).toMatchObject(expectedJSON);
    });
});

describe("getMaxDuration() ", ()=>{
    it("should return the maximum duration of all video-media attached to the content", ()=>{
        //setup
        let values:number[] = [100, 50, 200, 20, 1];
        let video:Video;

        for(let i:number = 0; i < values.length; i++){
            video = new Video();
            video.duration = values[i];
            video.mediaAppId = i;
            content.media.set(i, video);
        }

        //tests
        expect(content.getMaxDuration()).toBe(200);
    });

    it("should return 0 if there are no videos in the media", ()=>{
        //setup
        let image:Image;

        for(let i:number = 0; i < 5; i++){
            image = new Image();
            image.mediaAppId = i;
            content.media.set(i,image);
        }

        //tests
        expect(content.getMaxDuration()).toBe(0);
    });
});