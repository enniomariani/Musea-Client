import {
    MediaFileService
} from "../../../../../src/js/mcf/renderer/fileHandling/MediaFileService";
import {MockBackendFileService} from "../../main/MockBackendFileService";

export class MockMediaFileService extends MediaFileService{

    init: jest.Mock;
    saveFile: jest.Mock;
    deleteFile: jest.Mock;
    fileExists: jest.Mock;
    loadFile: jest.Mock;
    getAllCachedMedia: jest.Mock;

    constructor() {
        super(new MockBackendFileService());
        this.init = jest.fn();
        this.saveFile = jest.fn();
        this.deleteFile = jest.fn();
        this.fileExists = jest.fn();
        this.loadFile = jest.fn();
        this.getAllCachedMedia = jest.fn();
    }
}