import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {Content} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/Content";
import {Video} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/Media";

let content:Content;

beforeEach(() => {
    content = new Content();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("getMaxDuration() ", ()=>{
    it("should return the maximum duration of all video-media attached to the content", ()=>{
        //setup
        let values:number[] = [100, 50, 200, 20, 1];
        let video:Video;

        for(let i:number = 0; i < values.length; i++){
            video = new Video();
            video.duration = values[i];
            content.media.push(video);
        }

        //tests
        expect(content.getMaxDuration()).toBe(200);
    });
});