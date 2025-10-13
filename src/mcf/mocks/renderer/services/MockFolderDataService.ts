import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository.js";
import {FolderDataService} from "renderer/services/FolderDataService.js";
import {MockContentDataService} from "./MockContentDataService.js";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockContentService:MockContentDataService = new MockContentDataService();


export class MockFolderDataService extends FolderDataService {
    createFolder: jest.Mock;
    getName: jest.Mock;
    changeName: jest.Mock;
    changeParentFolder: jest.Mock;
    getIdOfParentFolder: jest.Mock;
    deleteFolder: jest.Mock;

    getAllContentsInFolder: jest.Mock;
    getAllSubFoldersInFolder: jest.Mock;

    findContentsByNamePart: jest.Mock;

    constructor() {
        super(mockMediaStationRepo, mockContentService);
        this.createFolder = jest.fn();
        this.changeName = jest.fn();
        this.changeParentFolder = jest.fn();
        this.getName = jest.fn();
        this.deleteFolder = jest.fn();

        this.getIdOfParentFolder = jest.fn();

        this.getAllContentsInFolder = jest.fn();
        this.getAllSubFoldersInFolder = jest.fn();

        this.findContentsByNamePart = jest.fn();
    }
}