import {MockMediaStationRepository} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockContentNetworkService} from "tests/__mocks__/mcf/renderer/services/MockContentNetworkService";
import {MediaStationCommandService} from "@app/mcf/renderer/services/mediastation/MediaStationCommandService";
import {MockNetworkService} from "tests/__mocks__/mcf/renderer/services/MockNetworkService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockContentNetworkService:MockContentNetworkService = new MockContentNetworkService();
const mockNetworkService:MockNetworkService = new MockNetworkService();


export class MockMediaStationCommandService extends MediaStationCommandService {

    sendCommandPlay: jest.Mock;
    sendCommandStop: jest.Mock;
    sendCommandPause: jest.Mock;
    sendCommandFwd: jest.Mock;
    sendCommandRew: jest.Mock;

    sendCommandSeek: jest.Mock;
    sendCommandSync: jest.Mock;

    sendCommandMute: jest.Mock;
    sendCommandUnmute: jest.Mock;
    sendCommandSetVolume: jest.Mock;

    constructor() {
        super(mockMediaStationRepo,mockNetworkService, mockContentNetworkService);

        this.sendCommandPlay = jest.fn();
        this.sendCommandStop = jest.fn();
        this.sendCommandPause = jest.fn();
        this.sendCommandFwd = jest.fn();
        this.sendCommandRew = jest.fn();

        this.sendCommandSeek = jest.fn();
        this.sendCommandSync = jest.fn();

        this.sendCommandMute = jest.fn();
        this.sendCommandUnmute = jest.fn();
        this.sendCommandSetVolume = jest.fn();
    }
}