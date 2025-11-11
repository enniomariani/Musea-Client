import {MockNetworkService} from "../network/MockNetworkService.js";
import {MediaPlayerConnectionService} from "../../../renderer/services/MediaPlayerConnectionService.js";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository.js";
import {CheckOptions, MediaPlayerConnectionStatus} from "../../../renderer/network/MediaPlayerConnectionSteps.js";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStatonRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaPlayerConnectionService extends MediaPlayerConnectionService{
    checkConnection: jest.Mock<Promise<MediaPlayerConnectionStatus>, [ip:string, options: CheckOptions]>;
    connectAndRegisterToMediaPlayer: jest.Mock<Promise<boolean>, [mediaStationId: number, mediaPlayerId: number, role?: string]>;
    unregisterAndCloseMediaPlayer: jest.Mock<Promise<void>, [mediaStationId: number, mediaPlayerId: number]>;
    checkOnlineStatusOfAllMediaPlayers: jest.Mock<Promise<boolean>, [id: number]>;

    constructor() {
        super(mockMediaStatonRepo, mockNetworkService);
        this.checkConnection = jest.fn();
        this.connectAndRegisterToMediaPlayer = jest.fn();
        this.unregisterAndCloseMediaPlayer = jest.fn();
        this.checkOnlineStatusOfAllMediaPlayers = jest.fn();
    }
}