import {MockNetworkService} from "./MockNetworkService";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {MediaAppSyncService} from "renderer/network/MediaAppSyncService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStatonRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaAppSyncService extends MediaAppSyncService{
    sendMediaFilesToMediaApp: jest.Mock;
    sendCommandDeleteMediaToMediaApps: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStatonRepo );
        this.sendMediaFilesToMediaApp = jest.fn();
        this.sendCommandDeleteMediaToMediaApps = jest.fn();
    }
}