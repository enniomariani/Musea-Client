import {
    MediaFileService
} from "../../../../../src/js/renderer/mediaClientFramework/fileHandling/MediaFileService";
import {ContentFileService} from "../../../../../src/js/renderer/mediaClientFramework/fileHandling/ContentFileService";

const mockBackendFileService: jest.Mocked<IBackendFileService> = {
    saveFile: jest.fn(),
    loadFile: jest.fn(),
    deleteFile: jest.fn(),
    fileExists: jest.fn(),
    getAllFileNamesInFolder: jest.fn()
}

export class MockContentFileService extends ContentFileService{

    init: jest.Mock;
    saveFile: jest.Mock;
    deleteFile: jest.Mock;
    fileExists: jest.Mock;
    loadFile: jest.Mock;

    constructor() {
        super(mockBackendFileService);
        this.init = jest.fn();
        this.saveFile = jest.fn();
        this.deleteFile = jest.fn();
        this.fileExists = jest.fn();
        this.loadFile = jest.fn();
    }
}