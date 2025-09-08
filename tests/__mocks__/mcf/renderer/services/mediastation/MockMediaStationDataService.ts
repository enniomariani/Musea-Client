import {MockMediaStationRepository} from "tests/__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {
    MediaStationDataService
} from "src/mcf/renderer/services/mediastation/MediaStationDataService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();


export class MockMediaStationDataService extends MediaStationDataService{
    loadMediaStations: jest.Mock;
    createMediaStation: jest.Mock;
    deleteMediaStation: jest.Mock;
    changeName: jest.Mock;
    getName: jest.Mock;
    getControllerIp: jest.Mock;

    constructor() {
        super(mockMediaStationRepo);
        this.loadMediaStations = jest.fn();
        this.createMediaStation = jest.fn();
        this.deleteMediaStation = jest.fn();
        this.changeName = jest.fn();
        this.getName = jest.fn();
        this.getControllerIp = jest.fn();
    }
}