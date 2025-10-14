import {ContentFileService} from "renderer/fileHandling/ContentFileService.js";
import {MockBackendFileService} from "mocks/main/MockBackendFileService.js";


export class MockContentFileService extends ContentFileService{

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