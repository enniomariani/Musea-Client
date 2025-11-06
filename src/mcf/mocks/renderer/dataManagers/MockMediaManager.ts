import {MediaManager} from "renderer/dataManagers/MediaManager.js";

export class MockMediaManager extends MediaManager{

    createVideo: jest.Mock;
    createImage: jest.Mock;
    getMediaType: jest.Mock;
    deleteMedia: jest.Mock;
    getIdOnMediaPlayer: jest.Mock;
    getFileName: jest.Mock;


    constructor() {
        super();
        this.createVideo = jest.fn();
        this.createImage = jest.fn();
        this.getMediaType = jest.fn();
        this.deleteMedia = jest.fn();
        this.getIdOnMediaPlayer = jest.fn();
        this.getFileName = jest.fn();
    }
}