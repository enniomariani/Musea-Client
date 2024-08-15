import {
    MediaFileService
} from "../../../../../src/js/renderer/mediaClientFramework/fileHandling/MediaFileService";
import {MockBackendFileService} from "../../../main/MockBackendFileService";

export class MockMediaFileService extends MediaFileService{

    init: jest.Mock;
    saveFile: jest.Mock;
    deleteFile: jest.Mock;
    fileExists: jest.Mock;
    loadFile: jest.Mock;

    constructor() {
        super(new MockBackendFileService());
        this.init = jest.fn();
        this.saveFile = jest.fn();
        this.deleteFile = jest.fn();
        this.fileExists = jest.fn();
        this.loadFile = jest.fn();
    }
}