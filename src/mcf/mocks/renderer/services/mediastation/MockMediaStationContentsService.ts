import {MockNetworkService} from "../../network/MockNetworkService";
import {MockMediaStationRepository} from "../../dataStructure/MockMediaStationRepository";
import {MediaStationContentsService} from "../../../../renderer/services/mediastation/MediaStationContentsService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaStationContentsService extends MediaStationContentsService{
    downloadContentsOfMediaStation: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStationRepo);
        this.downloadContentsOfMediaStation = jest.fn();
    }
}