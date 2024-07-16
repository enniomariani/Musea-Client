
import {
    MediaStationRepository
} from "../../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaStationRepository";

export class MockMediaStationRepository extends MediaStationRepository{

    loadMediaStations: jest.Mock;
    addMediaStation: jest.Mock;
    findMediaStation: jest.Mock;
    deleteMediaStation: jest.Mock;
    updateMediaStation: jest.Mock;

    constructor(props) {
        super(props);
        this.loadMediaStations = jest.fn();
        this.addMediaStation = jest.fn();
        this.findMediaStation = jest.fn();
        this.deleteMediaStation = jest.fn();
        this.updateMediaStation = jest.fn();
    }
}