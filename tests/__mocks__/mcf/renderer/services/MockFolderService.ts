import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {FolderService} from "../../../../../src/js/mcf/renderer/services/FolderService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();


export class MockFolderService extends FolderService {
    getAllContentsInFolder: jest.Mock;

    constructor() {
        super(mockMediaStationRepo);
        this.getAllContentsInFolder = jest.fn();
    }
}