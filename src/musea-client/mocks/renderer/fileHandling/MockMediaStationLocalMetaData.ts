import {
    MediaStationLocalMetaData
} from "renderer/fileHandling/MediaStationLocalMetaData.js";
import {MockBackendFileService} from "mocks/main/MockBackendFileService.js";

export class MockMediaStationLocalMetaData extends MediaStationLocalMetaData{

    load: jest.Mock;
    save: jest.Mock;

    constructor() {
        super(new MockBackendFileService());
        this.load = jest.fn();
        this.save = jest.fn();
    }
}