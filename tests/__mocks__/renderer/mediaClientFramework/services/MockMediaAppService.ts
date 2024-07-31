import {MockNetworkService} from "./MockNetworkService";
import {MediaAppService} from "../../../../../src/js/renderer/mediaClientFramework/services/MediaAppService";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();


export class MockMediaAppService extends MediaAppService{
    createMediaApp: jest.Mock;
    getAllMediaApps: jest.Mock;
    getName: jest.Mock;
    changeName: jest.Mock;
    getIp: jest.Mock;
    changeIp: jest.Mock;
    isOnline: jest.Mock;
    pcRespondsToPing: jest.Mock;
    connectAndRegisterToMediaApp: jest.Mock;
    unregisterAndCloseMediaApp: jest.Mock;

    constructor() {
        super(mockMediaStationRepo, mockNetworkService);
        this.createMediaApp = jest.fn();
        this.getAllMediaApps = jest.fn();
        this.getName = jest.fn();
        this.changeName = jest.fn();
        this.getIp = jest.fn();
        this.changeIp = jest.fn();
        this.isOnline = jest.fn();
        this.pcRespondsToPing = jest.fn();
        this.connectAndRegisterToMediaApp = jest.fn();
        this.unregisterAndCloseMediaApp = jest.fn();
    }
}