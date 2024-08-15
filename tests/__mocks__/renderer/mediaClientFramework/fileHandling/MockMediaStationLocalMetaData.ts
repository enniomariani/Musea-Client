import {
    MediaStationLocalMetaData
} from "../../../../../src/js/renderer/mediaClientFramework/fileHandling/MediaStationLocalMetaData";
import {MockBackendFileService} from "../../../main/MockBackendFileService";

export class MockMediaStationLocalMetaData extends MediaStationLocalMetaData{

    load: jest.Mock;
    save: jest.Mock;

    constructor() {
        super(new MockBackendFileService());
        this.load = jest.fn();
        this.save = jest.fn();
    }
}