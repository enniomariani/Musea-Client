import {MockMediaStationRepository} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockContentNetworkService} from "tests/__mocks__/mcf/renderer/services/MockContentNetworkService";
import {MediaStationCommandService} from "@app/mcf/renderer/services/mediastation/MediaStationCommandService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockContentNetworkService:MockContentNetworkService = new MockContentNetworkService();


export class MockMediaStationCommandService extends MediaStationCommandService {

    sendCommandPlay: jest.Mock;
    sendCommandStop: jest.Mock;
    sendCommandPause: jest.Mock;
    sendCommandFwd: jest.Mock;
    sendCommandRew: jest.Mock;

    sendCommandSeek: jest.Mock;
    sendCommandSync: jest.Mock;

    constructor() {
        super(mockMediaStationRepo, mockContentNetworkService);

        this.sendCommandPlay = jest.fn();
        this.sendCommandStop = jest.fn();
        this.sendCommandPause = jest.fn();
        this.sendCommandFwd = jest.fn();
        this.sendCommandRew = jest.fn();

        this.sendCommandSeek = jest.fn();
        this.sendCommandSync = jest.fn();
    }
}