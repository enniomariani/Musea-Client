import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {MediaService} from "../../../../../src/js/renderer/mediaClientFramework/services/MediaService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();


export class MockMediaService extends MediaService{
    addImageAndCacheIt: jest.Mock;
    addVideoAndCacheIt: jest.Mock;
    getMediaType: jest.Mock;

    constructor() {
        super(mockMediaStationRepo);
        this.addImageAndCacheIt = jest.fn();
        this.addVideoAndCacheIt = jest.fn();
        this.getMediaType = jest.fn();
    }
}