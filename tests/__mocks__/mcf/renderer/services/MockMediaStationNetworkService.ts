import {MockNetworkService} from "./MockNetworkService";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {
    MediaStationNetworkService
} from "../../../../../src/mcf/renderer/services/MediaStationNetworkService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaStationNetworkService extends MediaStationNetworkService{
    downloadContentsOfMediaStation: jest.Mock;
    checkOnlineStatusOfAllMediaApps: jest.Mock;
    syncMediaStation: jest.Mock;

    sendCommandMute: jest.Mock;
    sendCommandUnmute: jest.Mock;
    sendCommandSetVolume: jest.Mock;

    onBlockReceived: jest.Mock;
    onUnBlockReceived: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStationRepo);
        this.downloadContentsOfMediaStation = jest.fn();
        this.checkOnlineStatusOfAllMediaApps = jest.fn();
        this.syncMediaStation = jest.fn();

        this.sendCommandMute = jest.fn();
        this.sendCommandUnmute = jest.fn();
        this.sendCommandSetVolume = jest.fn();

        this.onBlockReceived = jest.fn();
        this.onUnBlockReceived = jest.fn();
    }
}