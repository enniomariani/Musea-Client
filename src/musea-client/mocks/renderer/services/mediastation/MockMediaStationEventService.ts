import {MockNetworkService} from "../../network/MockNetworkService.js";
import {MediaStationEventService} from "../../../../renderer/services/mediastation/MediaStationEventService.js";

const mockNetworkService:MockNetworkService = new MockNetworkService();

export class MockMediaStationEventService extends MediaStationEventService{

    onBlockReceived: jest.Mock;
    onUnBlockReceived: jest.Mock;

    constructor() {
        super(mockNetworkService);

        this.onBlockReceived = jest.fn();
        this.onUnBlockReceived = jest.fn();
    }
}