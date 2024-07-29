import {MediaManager} from "../../../../../src/js/renderer/mediaClientFramework/dataManagers/MediaManager";

export class MockMediaManager extends MediaManager{

    createVideo: jest.Mock;
    createImage: jest.Mock;
    getMediaType: jest.Mock;
    deleteMedia: jest.Mock;


    constructor() {
        super();
        this.createVideo = jest.fn();
        this.createImage = jest.fn();
        this.getMediaType = jest.fn();
        this.deleteMedia = jest.fn();
    }
}