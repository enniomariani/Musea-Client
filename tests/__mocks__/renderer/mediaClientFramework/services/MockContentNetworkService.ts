import {
    ContentNetworkService
} from "../../../../../src/js/renderer/mediaClientFramework/services/ContentNetworkService";
import {MockNetworkService} from "./MockNetworkService";

const mockNetworkService:MockNetworkService = new MockNetworkService();


export class MockContentNetworkService extends ContentNetworkService{
    sendCommandPlay: jest.Mock;
    sendCommandStop: jest.Mock;
    sendCommandPause: jest.Mock;
    sendCommandSeek: jest.Mock;

    constructor() {
        super(mockNetworkService);
        this.sendCommandPlay = jest.fn();
        this.sendCommandStop = jest.fn();
        this.sendCommandPause = jest.fn();
        this.sendCommandSeek = jest.fn();
    }
}