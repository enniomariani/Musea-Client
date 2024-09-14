import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {FolderService} from "../../../../../src/js/mcf/renderer/services/FolderService";
import {MockContentService} from "./MockContentService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockContentService:MockContentService = new MockContentService();


export class MockFolderService extends FolderService {
    createFolder: jest.Mock;
    getName: jest.Mock;
    changeName: jest.Mock;
    getIdOfParentFolder: jest.Mock;
    deleteFolder: jest.Mock;

    getAllContentsInFolder: jest.Mock;
    getAllSubFoldersInFolder: jest.Mock;

    findContentsByNamePart: jest.Mock;

    constructor() {
        super(mockMediaStationRepo, mockContentService);
        this.createFolder = jest.fn();
        this.changeName = jest.fn();
        this.getName = jest.fn();
        this.deleteFolder = jest.fn();

        this.getIdOfParentFolder = jest.fn();

        this.getAllContentsInFolder = jest.fn();
        this.getAllSubFoldersInFolder = jest.fn();

        this.findContentsByNamePart = jest.fn();
    }
}