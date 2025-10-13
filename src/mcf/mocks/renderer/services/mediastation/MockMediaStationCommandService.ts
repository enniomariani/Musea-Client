import {MockMediaStationRepository} from "../../dataStructure/MockMediaStationRepository";
import {MockMediaAppCommandService} from "../../network/MockMediaAppCommandService";
import {MediaStationCommandService} from "../../../../renderer/services/mediastation/MediaStationCommandService";
import {MockNetworkService} from "../../network/MockNetworkService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockContentNetworkService:MockMediaAppCommandService = new MockMediaAppCommandService();
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