import {IMainFileService} from "../../main";

export class MockBackendFileService implements IMainFileService{

    saveFile: jest.Mock;
    saveFileByPath: jest.Mock;
    loadFile: jest.Mock;
    deleteFile: jest.Mock;
    fileExists: jest.Mock;
    getAllFileNamesInFolder: jest.Mock;

    constructor() {
        this.saveFile = jest.fn();
        this.saveFileByPath = jest.fn();
        this.loadFile = jest.fn();
        this.deleteFile = jest.fn();
        this.fileExists = jest.fn();
        this.getAllFileNamesInFolder = jest.fn();
    }
}