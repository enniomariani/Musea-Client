import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {FolderService} from "../../../../../src/js/mcf/renderer/services/FolderService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();


export class MockFolderService extends FolderService {
    createFolder: jest.Mock;

    getAllContentsInFolder: jest.Mock;

    constructor() {
        super(mockMediaStationRepo);
        this.createFolder = jest.fn();

        this.getAllContentsInFolder = jest.fn();
    }
}