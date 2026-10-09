import {MockMediaStationRepository} from "../../dataStructure/MockMediaStationRepository.js";
import {MockMediaPlayerCommandService} from "../../network/MockMediaPlayerCommandService.js";
import {MediaStationCommandService} from "renderer/services/mediastation/MediaStationCommandService.js";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockContentNetworkService:MockMediaPlayerCommandService = new MockMediaPlayerCommandService();

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
        super(mockMediaStationRepo, mockContentNetworkService);

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