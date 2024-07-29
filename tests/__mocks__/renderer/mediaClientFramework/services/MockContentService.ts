import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {ContentService} from "../../../../../src/js/renderer/mediaClientFramework/services/ContentService";
import {MockContentNetworkService} from "./MockContentNetworkService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockContentNetworkService:MockContentNetworkService = new MockContentNetworkService();


export class MockContentService extends ContentService {
    createContent: jest.Mock;
    changeName: jest.Mock;
    sendCommandPlay: jest.Mock;
    sendCommandStop: jest.Mock;
    sendCommandPause: jest.Mock;
    sendCommandSeek: jest.Mock;

    constructor() {
        super(mockMediaStationRepo, mockContentNetworkService);
        this.createContent = jest.fn();
        this.changeName = jest.fn();
        this.sendCommandPlay = jest.fn();
        this.sendCommandStop = jest.fn();
        this.sendCommandPause = jest.fn();
        this.sendCommandSeek = jest.fn();
    }
}