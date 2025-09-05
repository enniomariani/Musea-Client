import {MockNetworkService} from "tests/__mocks__/mcf/renderer/services/MockNetworkService";
import {MockMediaStationRepository} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MediaStationContentsService} from "@app/mcf/renderer/services/mediastation/MediaStationContentsService";

const mockNetworkService:MockNetworkService = new MockNetworkService();
const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaStationContentsService extends MediaStationContentsService{
    downloadContentsOfMediaStation: jest.Mock;

    constructor() {
        super(mockNetworkService, mockMediaStationRepo);
        this.downloadContentsOfMediaStation = jest.fn();
    }
}