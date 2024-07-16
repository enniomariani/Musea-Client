import {MockNetworkService} from "../../network/MockNetworkService.js";
import {MockMediaStationRepository} from "../../dataStructure/MockMediaStationRepository.js";
import {MediaStationContentsService} from "../../../../renderer/services/mediastation/MediaStationContentsService.js";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaStationContentsService extends MediaStationContentsService{
    downloadContentsOfMediaStation: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStationRepo);
        this.downloadContentsOfMediaStation = jest.fn();
    }
}