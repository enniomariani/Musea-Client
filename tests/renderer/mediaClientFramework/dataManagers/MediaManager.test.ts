import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";
import {MediaManager} from "../../../../src/js/renderer/mediaClientFramework/dataManagers/MediaManager";
import {MockContent} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockContent";
import {Image, Video} from "../../../../src/js/renderer/mediaClientFramework/dataStructure/Media";

let mediaManager:MediaManager;
let mockMediaStation:MockMediaStation;
let mockContent:MockContent;

beforeEach(() => {
    mockMediaStation = new MockMediaStation(0);
    mockContent = new MockContent(0);
    mediaManager = new MediaManager();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createImage() ", ()=>{
    it("should return a new image with the correct parameters set", ()=>{
        //setup
        let answerImage:Image;
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(mockContent);

        //method to test
        answerImage = mediaManager.createImage(mockMediaStation, 0, 0);

        //tests
        expect(answerImage).not.toBeNull();
        expect(answerImage).not.toBeUndefined();
        expect(answerImage.mediaAppId).toBe(0);
        expect(answerImage.idOnMediaApp).toBe(-1);
    });

    it("should add the newly created image to the content", ()=>{
        //setup
        let answerImage:Image;
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(mockContent);

        //method to test
        answerImage = mediaManager.createImage(mockMediaStation, 0, 0);

        //tests
        expect(mockContent.media.get(0)).toEqual(answerImage);
    });

    it("should delete an existing Media with the same mediaAppId and replace it with itself in the content", ()=>{
        //setup
        let answerImage:Image;
        let existingImage:Image = new Image();
        existingImage.mediaAppId = 0;
        existingImage.idOnMediaApp = 200;
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(mockContent);
        mockContent.media.set(0, existingImage);

        //method to test
        answerImage = mediaManager.createImage(mockMediaStation, 0, 0);

        //tests
        expect(mockContent.media.get(0)).toEqual(answerImage);
    });

    it("should throw an error if the content could not be found", ()=>{
        //setup
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(null);

        //method to test
        expect(()=>mediaManager.createImage(mockMediaStation, 0, 0)).toThrow(new Error("Content with ID could not be found: 0"))
    });
});

describe("createVideo() ", ()=>{
    it("should return a new video with the correct parameters set", ()=>{
        //setup
        let answerVideo:Video;
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(mockContent);

        //method to test
        answerVideo = mediaManager.createVideo(mockMediaStation, 0, 0, 200);

        //tests
        expect(answerVideo).not.toBeNull();
        expect(answerVideo).not.toBeUndefined();
        expect(answerVideo.mediaAppId).toBe(0);
        expect(answerVideo.idOnMediaApp).toBe(-1);
        expect(answerVideo.duration).toBe(200);
    });

    it("should add the newly created video to the content", ()=>{
        //setup
        let answerVideo:Video;
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(mockContent);

        //method to test
        answerVideo = mediaManager.createVideo(mockMediaStation, 0, 0, 200);

        //tests
        expect(mockContent.media.get(0)).toEqual(answerVideo);
    });

    it("should delete an existing Media with the same mediaAppId and replace it with itself in the content", ()=>{
        //setup
        let answerVideo:Video;
        let existingImage:Image = new Image();
        existingImage.mediaAppId = 0;
        existingImage.idOnMediaApp = 200;
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(mockContent);
        mockContent.media.set(0, existingImage);

        //method to test
        answerVideo = mediaManager.createVideo(mockMediaStation, 0, 0, 200);

        //tests
        expect(mockContent.media.get(0)).toEqual(answerVideo);
    });

    it("should throw an error if the content could not be found", ()=>{
        //setup
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(null);

        //method to test
        expect(()=>mediaManager.createVideo(mockMediaStation, 0, 0, 200)).toThrow(new Error("Content with ID could not be found: 0"))
    });
});

describe("getMediaType() ", ()=>{
    it("should return a string with type image if the asked for media is  an image", ()=>{
        //setup
        let mediaType:string;
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(mockContent);
        mockContent.media.set(0, new Image());

        //method to test
        mediaType = mediaManager.getMediaType(mockMediaStation, 0, 0);

        //tests
        expect(mediaType).toBe(MediaManager.MEDIA_TYPE_IMAGE);
    });

    it("should return a string with type video if the asked for media is  an video", ()=>{
        //setup
        let mediaType:string;
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(mockContent);
        mockContent.media.set(0, new Video());

        //method to test
        mediaType = mediaManager.getMediaType(mockMediaStation, 0, 0);

        //tests
        expect(mediaType).toBe(MediaManager.MEDIA_TYPE_VIDEO);
    });

    it("should return null if there is no media set for the mediaAppId", ()=>{
        //setup
        let mediaType:string;
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(mockContent);

        //method to test
        mediaType = mediaManager.getMediaType(mockMediaStation, 0, 0);

        //tests
        expect(mediaType).toBe(null);
    });

    it("should throw an error if the content could not be found", ()=>{
        //setup
        mockMediaStation.rootFolder.findContent.mockReturnValueOnce(null);

        //method to test
        expect(()=>mediaManager.getMediaType(mockMediaStation, 0, 0)).toThrow(new Error("Content with ID could not be found: 0"))
    });
});