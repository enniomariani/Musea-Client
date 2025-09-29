import {FolderManager} from "src/mcf/renderer/dataManagers/FolderManager";
import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";
import {Folder} from "src/mcf/renderer/dataStructure/Folder";

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