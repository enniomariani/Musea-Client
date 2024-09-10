import {MockNetworkService} from "./MockNetworkService";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {
    MediaStationNetworkService
} from "../../../../../src/js/mcf/renderer/services/MediaStationNetworkService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaStationNetworkService extends MediaStationNetworkService{
    downloadContentsOfMediaStation: jest.Mock;
    downloadOnlyMediaAppDataFromMediaStation: jest.Mock;
    syncMediaStation: jest.Mock;

    sendCommandMute: jest.Mock;
    sendCommandUnmute: jest.Mock;
    sendCommandSetVolume: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStationRepo);
        this.downloadContentsOfMediaStation = jest.fn();
        this.downloadOnlyMediaAppDataFromMediaStation = jest.fn();
        this.syncMediaStation = jest.fn();

        this.sendCommandMute = jest.fn();
        this.sendCommandUnmute = jest.fn();
        this.sendCommandSetVolume = jest.fn();
    }
}