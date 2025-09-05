import {MockNetworkService} from "tests/__mocks__/mcf/renderer/services/MockNetworkService";
import {MockMediaStationRepository} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {
    MediaStationNetworkService
} from "@app/mcf/renderer/services/mediastation/MediaStationNetworkService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaStationNetworkService extends MediaStationNetworkService{
    downloadContentsOfMediaStation: jest.Mock;
    checkOnlineStatusOfAllMediaApps: jest.Mock;
    syncMediaStation: jest.Mock;

    sendCommandMute: jest.Mock;
    sendCommandUnmute: jest.Mock;
    sendCommandSetVolume: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStationRepo);
        this.downloadContentsOfMediaStation = jest.fn();
        this.checkOnlineStatusOfAllMediaApps = jest.fn();
        this.syncMediaStation = jest.fn();

        this.sendCommandMute = jest.fn();
        this.sendCommandUnmute = jest.fn();
        this.sendCommandSetVolume = jest.fn();
    }
}