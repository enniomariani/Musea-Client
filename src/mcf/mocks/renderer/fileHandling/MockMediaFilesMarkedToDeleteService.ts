import {MockBackendFileService} from "src/mcf/mocks/main/MockBackendFileService.js";
import {
    MediaFilesMarkedToDeleteService
} from "renderer/fileHandling/MediaFilesMarkedToDeleteService.js";

export class MockMediaFilesMarkedToDeleteService extends MediaFilesMarkedToDeleteService{

    init: jest.Mock;
    addID: jest.Mock;
    removeID: jest.Mock;
    getAllIDS: jest.Mock;

    constructor() {
        super(new MockBackendFileService());
        this.init = jest.fn();
        this.addID = jest.fn();
        this.removeID = jest.fn();
        this.getAllIDS = jest.fn();
    }
}