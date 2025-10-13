import {
    MediaFileService
} from "renderer/fileHandling/MediaFileService";
import {MockBackendFileService} from "src/mcf/mocks/main/MockBackendFileService";

export class MockMediaFileService extends MediaFileService{

    init: jest.Mock;
    saveFile: jest.Mock;
    saveFileByPath: jest.Mock;
    deleteFile: jest.Mock;
    fileExists: jest.Mock;
    loadFile: jest.Mock;
    getAllCachedMedia: jest.Mock;

    constructor() {
        super(new MockBackendFileService());
        this.init = jest.fn();
        this.saveFile = jest.fn();
        this.saveFileByPath = jest.fn();
        this.deleteFile = jest.fn();
        this.fileExists = jest.fn();
        this.loadFile = jest.fn();
        this.getAllCachedMedia = jest.fn();
    }
}