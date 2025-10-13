import {FolderManager} from "renderer/dataManagers/FolderManager";
import {MediaStation} from "renderer/dataStructure/MediaStation";
import {Folder} from "renderer/dataStructure/Folder";

export class MockFolderManager extends FolderManager{

    createFolder: jest.Mock;
    getFolder: jest.Mock;
    requireFolder: jest.Mock;
    changeName: jest.Mock;
    changeParentFolder: jest.Mock;
    deleteFolder: jest.Mock;


    constructor() {
        super();
        this.createFolder = jest.fn();
        this.getFolder = jest.fn();
        this.requireFolder = jest.fn();
        this.changeName = jest.fn();
        this.changeParentFolder = jest.fn();
        this.deleteFolder = jest.fn();
    }
}