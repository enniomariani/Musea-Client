import {FolderManager} from "../../../../../src/js/mcf/renderer/dataManagers/FolderManager";

export class MockFolderManager extends FolderManager{

    createFolder: jest.Mock;
    getFolder: jest.Mock;
    changeName: jest.Mock;
    deleteFolder: jest.Mock;


    constructor() {
        super();
        this.createFolder = jest.fn();
        this.getFolder = jest.fn();
        this.changeName = jest.fn();
        this.deleteFolder = jest.fn();
    }
}