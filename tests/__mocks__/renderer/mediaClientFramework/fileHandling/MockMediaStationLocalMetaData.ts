import {
    MediaStationLocalMetaData
} from "../../../../../src/js/renderer/mediaClientFramework/fileHandling/MediaStationLocalMetaData";

const mockBackendFileService: jest.Mocked<IBackendFileService> = {
    saveFile: jest.fn(),
    loadFile: jest.fn(),
    deleteFile: jest.fn(),
    fileExists: jest.fn()
}

export class MockMediaStationLocalMetaData extends MediaStationLocalMetaData{

    load: jest.Mock;
    save: jest.Mock;

    constructor() {
        super(mockBackendFileService);
        this.load = jest.fn();
        this.save = jest.fn();
    }
}