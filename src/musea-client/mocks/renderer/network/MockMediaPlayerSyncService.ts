import {MockNetworkService} from "./MockNetworkService.js";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository.js";
import {MediaPlayerSyncService} from "renderer/network/MediaPlayerSyncService.js";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStatonRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaPlayerSyncService extends MediaPlayerSyncService{
    sendMediaFilesToMediaPlayer: jest.Mock;
    sendCommandDeleteMediaToMediaPlayers: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStatonRepo );
        this.sendMediaFilesToMediaPlayer = jest.fn();
        this.sendCommandDeleteMediaToMediaPlayers = jest.fn();
    }
}