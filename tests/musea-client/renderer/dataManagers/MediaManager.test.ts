import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {MockMediaStation} from "mocks/renderer/dataStructure/MockMediaStation.js";
import {MediaManager, MediaType} from "renderer/dataManagers/MediaManager.js";
import {MockContent} from "mocks/renderer/dataStructure/MockContent.js";
import {Image, Video} from "renderer/dataStructure/Media.js";

let mediaManager:MediaManager;
let mockMediaStation:MockMediaStation;
let mockContent:MockContent;

beforeEach(() => {
    mockMediaStation = new MockMediaStation(0);
    mockContent = new MockContent(0, 0);
    mediaManager = new MediaManager();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createImage() ", ()=>{
    const fileName:string = "fileName";
    it("should return a new image with the correct parameters set", ()=>{
        let answerImage:Image;

        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);

        answerImage = mediaManager.createImage(mockMediaStation, 0, 0, fileName);

        expect(answerImage).not.toBeNull();
        expect(answerImage).not.toBeUndefined();
        expect(answerImage.mediaPlayerId).toBe(0);
        expect(answerImage.idOnMediaPlayer).toBe(-1);
        expect(answerImage.fileName).toBe(fileName);
    });

    it("should add the newly created image to the content", ()=>{
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        const answerImage:Image = mediaManager.createImage(mockMediaStation, 0, 0, fileName);
        expect(mockContent.media.get(0)).toEqual(answerImage);
    });

    it("should delete an existing Media with the same mediaPlayerId and replace it with itself in the content", ()=>{
        let answerImage:Image;
        let existingImage:Image = new Image();
        existingImage.mediaPlayerId = 0;
        existingImage.idOnMediaPlayer = 200;
        existingImage.fileName = "existingName"
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        mockContent.media.set(0, existingImage);

        answerImage = mediaManager.createImage(mockMediaStation, 0, 0, fileName);

        expect(mockContent.media.get(0)).toEqual(answerImage);
    });
});

describe("createVideo() ", ()=>{
    const fileName:string = "fileName";

    it("should return a new video with the correct parameters set", ()=>{
        let answerVideo:Video;
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);

        answerVideo = mediaManager.createVideo(mockMediaStation, 0, 0, 200, fileName);

        expect(answerVideo).not.toBeNull();
        expect(answerVideo).not.toBeUndefined();
        expect(answerVideo.mediaPlayerId).toBe(0);
        expect(answerVideo.idOnMediaPlayer).toBe(-1);
        expect(answerVideo.duration).toBe(200);
        expect(answerVideo.fileName).toBe(fileName);
    });

    it("should add the newly created video to the content", ()=>{
        let answerVideo:Video;
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);

        answerVideo = mediaManager.createVideo(mockMediaStation, 0, 0, 200, fileName);

        expect(mockContent.media.get(0)).toEqual(answerVideo);
    });

    it("should delete an existing Media with the same mediaPlayerId and replace it with itself in the content", ()=>{
        let answerVideo:Video;
        let existingImage:Image = new Image();
        existingImage.mediaPlayerId = 0;
        existingImage.idOnMediaPlayer = 200;
        existingImage.fileName = "oldName";
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        mockContent.media.set(0, existingImage);

        answerVideo = mediaManager.createVideo(mockMediaStation, 0, 0, 200, fileName);

        expect(mockContent.media.get(0)).toEqual(answerVideo);
    });
});

describe("getFileName() ", ()=>{
    it("should return a string with the fileName", ()=>{
        let fileName:string | null;
        let image:Image = new Image();
        image.fileName = "testName"
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        mockContent.media.set(0, image);

        fileName = mediaManager.getFileName(mockMediaStation, 0, 0);

        expect(fileName).toBe("testName");
    });


    it("should return null if there is no media set for the mediaPlayerId", ()=>{
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        const fileName:string | null = mediaManager.getFileName(mockMediaStation, 0, 0);
        expect(fileName).toBe(null);
    });
});

describe("getMediaType() ", ()=>{
    it("should return a string with type image if the asked for media is  an image", ()=>{
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        mockContent.media.set(0, new Image());

        const  mediaType:string | null = mediaManager.getMediaType(mockMediaStation, 0, 0);

        expect(mediaType).toBe(MediaType.IMAGE);
    });

    it("should return a string with type video if the asked for media is  an video", ()=>{
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        mockContent.media.set(0, new Video());

        const  mediaType:string | null = mediaManager.getMediaType(mockMediaStation, 0, 0);

        expect(mediaType).toBe(MediaType.VIDEO);
    });

    it("should return null if there is no media set for the mediaPlayerId", ()=>{
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        const  mediaType:string | null = mediaManager.getMediaType(mockMediaStation, 0, 0);
        expect(mediaType).toBe(null);
    });
});

describe("getIdOnMediaPlayer() ", ()=>{
    it("should return the number idOnMediaPlayer of the requested media", ()=>{
        let idOnMediaPlayer:number;
        let image:Image = new Image();
        image.idOnMediaPlayer = 33;
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        mockContent.requireMedia.mockReturnValueOnce(image);

        idOnMediaPlayer = mediaManager.getIdOnMediaPlayer(mockMediaStation, 0, 0);

        expect(idOnMediaPlayer).toBe(33);
    });

    it("should return -1 if there is no media set for the mediaPlayerId", ()=>{
        let idOnMediaPlayer:number;
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        let image:Image = new Image();
        image.idOnMediaPlayer = -1;
        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        mockContent.requireMedia.mockReturnValueOnce(image);

        idOnMediaPlayer = mediaManager.getIdOnMediaPlayer(mockMediaStation, 0, 0);

        expect(idOnMediaPlayer).toBe(-1);
    });
});

describe("deleteMedia() ", ()=>{
    it("should remove a media from the mediaPlayer of the passed content", ()=>{
        let image:Image = new Image();
        image.idOnMediaPlayer = 2;
        image.mediaPlayerId = 0;

        mockMediaStation.rootFolder.requireContent.mockReturnValueOnce(mockContent);
        mockContent.media.set(0, image);

        mediaManager.deleteMedia(mockMediaStation, 0, 0);

        expect(mockContent.media.get(0)).toBe(undefined);
    });
});