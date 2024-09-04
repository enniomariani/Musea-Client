import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {ContentService} from "../../../../../src/js/mcf/renderer/services/ContentService";
import {MockContentNetworkService} from "./MockContentNetworkService";
import {MockMediaService} from "./MockMediaService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockContentNetworkService:MockContentNetworkService = new MockContentNetworkService();
const mockMediaService:MockMediaService = new MockMediaService();


export class MockContentService extends ContentService {
    createContent: jest.Mock;
    changeName: jest.Mock;
    deleteContent: jest.Mock;

    sendCommandPlay: jest.Mock;
    sendCommandStop: jest.Mock;
    sendCommandPause: jest.Mock;
    sendCommandSeek: jest.Mock;

    getLightIntensity: jest.Mock;
    changeLightIntensity: jest.Mock;

    constructor() {
        super(mockMediaStationRepo, mockContentNetworkService, mockMediaService);
        this.createContent = jest.fn();
        this.changeName = jest.fn();
        this.deleteContent = jest.fn();

        this.sendCommandPlay = jest.fn();
        this.sendCommandStop = jest.fn();
        this.sendCommandPause = jest.fn();
        this.sendCommandSeek = jest.fn();

        this.getLightIntensity = jest.fn();
        this.changeLightIntensity = jest.fn();
    }
}