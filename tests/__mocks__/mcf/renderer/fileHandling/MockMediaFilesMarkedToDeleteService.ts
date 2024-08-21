import {MockBackendFileService} from "../../main/MockBackendFileService";
import {
    MediaFilesMarkedToDeleteService
} from "../../../../../src/js/mcf/renderer/fileHandling/MediaFilesMarkedToDeleteService";

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