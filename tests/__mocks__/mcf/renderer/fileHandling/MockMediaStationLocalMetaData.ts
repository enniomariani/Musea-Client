import {
    MediaStationLocalMetaData
} from "../../../../../src/js/mcf/renderer/fileHandling/MediaStationLocalMetaData";
import {MockBackendFileService} from "../../main/MockBackendFileService";

export class MockMediaStationLocalMetaData extends MediaStationLocalMetaData{

    load: jest.Mock;
    save: jest.Mock;

    constructor() {
        super(new MockBackendFileService());
        this.load = jest.fn();
        this.save = jest.fn();
    }
}