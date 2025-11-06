import {MediaPlayerDataService} from "../../../renderer/services/MediaPlayerDataService.js";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository.js";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaPlayerDataService extends MediaPlayerDataService{
    createMediaPlayer: jest.Mock;
    getAllMediaPlayers: jest.Mock;
    getName: jest.Mock;
    changeName: jest.Mock;
    getIp: jest.Mock;
    changeIp: jest.Mock;

    constructor() {
        super(mockMediaStationRepo);
        this.createMediaPlayer = jest.fn();
        this.getAllMediaPlayers = jest.fn();
        this.getName = jest.fn();
        this.changeName = jest.fn();
        this.getIp = jest.fn();
        this.changeIp = jest.fn();
    }
}