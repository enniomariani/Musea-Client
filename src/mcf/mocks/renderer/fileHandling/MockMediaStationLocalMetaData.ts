import {
    MediaStationLocalMetaData
} from "renderer/fileHandling/MediaStationLocalMetaData";
import {MockBackendFileService} from "src/mcf/mocks/main/MockBackendFileService";

export class MockMediaStationLocalMetaData extends MediaStationLocalMetaData{

    load: jest.Mock;
    save: jest.Mock;

    constructor() {
        super(new MockBackendFileService());
        this.load = jest.fn();
        this.save = jest.fn();
    }
}