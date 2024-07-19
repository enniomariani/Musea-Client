
import {
    MediaStationRepository
} from "../../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaStationRepository";
import {MockNetworkInterface} from "../network/MockNetworkInterface";
import {MockMediaStationLocalMetaData} from "../fileHandling/MockMediaStationLocalMetaData";

const mockMediaStationLocalMetaData:MockMediaStationLocalMetaData = new MockMediaStationLocalMetaData();

export class MockMediaStationRepository extends MediaStationRepository{

    loadMediaStations: jest.Mock;
    addMediaStation: jest.Mock;
    findMediaStation: jest.Mock;
    deleteMediaStation: jest.Mock;
    updateMediaStation: jest.Mock;
    updateAndSaveMediaStation: jest.Mock;

    constructor() {
        super(mockMediaStationLocalMetaData);
        this.loadMediaStations = jest.fn();
        this.addMediaStation = jest.fn();
        this.findMediaStation = jest.fn();
        this.deleteMediaStation = jest.fn();
        this.updateMediaStation = jest.fn();
        this.updateAndSaveMediaStation = jest.fn();
    }
}