import {MediaManager} from "src/mcf/renderer/dataManagers/MediaManager";

export class MockMediaManager extends MediaManager{

    createVideo: jest.Mock;
    createImage: jest.Mock;
    getMediaType: jest.Mock;
    deleteMedia: jest.Mock;
    getIdOnMediaApp: jest.Mock;
    getFileName: jest.Mock;


    constructor() {
        super();
        this.createVideo = jest.fn();
        this.createImage = jest.fn();
        this.getMediaType = jest.fn();
        this.deleteMedia = jest.fn();
        this.getIdOnMediaApp = jest.fn();
        this.getFileName = jest.fn();
    }
}