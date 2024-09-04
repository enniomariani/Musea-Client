import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {FolderService} from "../../../../../src/js/mcf/renderer/services/FolderService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();


export class MockFolderService extends FolderService {
    createFolder: jest.Mock;
    getName: jest.Mock;
    changeName: jest.Mock;
    getIdOfParentFolder: jest.Mock;
    deleteFolder: jest.Mock;

    getAllContentsInFolder: jest.Mock;
    getAllSubFoldersInFolder: jest.Mock;

    constructor() {
        super(mockMediaStationRepo);
        this.createFolder = jest.fn();
        this.changeName = jest.fn();
        this.getName = jest.fn();
        this.deleteFolder = jest.fn();

        this.getIdOfParentFolder = jest.fn();

        this.getAllContentsInFolder = jest.fn();
        this.getAllSubFoldersInFolder = jest.fn();
    }
}