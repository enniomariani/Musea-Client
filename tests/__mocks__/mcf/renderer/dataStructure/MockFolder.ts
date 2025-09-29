import {Folder} from "src/mcf/renderer/dataStructure/Folder";


export class MockFolder extends Folder{

    addContent: jest.Mock;
    removeContent: jest.Mock;
    containsContent: jest.Mock;
    findContent: jest.Mock;
    getAllContents: jest.Mock;
    getAllContentIDsInFolderAndSubFolders: jest.Mock;

    addSubFolder: jest.Mock;
    removeSubFolder: jest.Mock;
    containsSubFolder: jest.Mock;
    findFolder: jest.Mock;
    getAllSubFolders: jest.Mock;

    importFromJSON: jest.Mock;
    exportToJSON: jest.Mock;

    findContentsByNamePart: jest.Mock;

    constructor(id:number) {
        super(id);
        this.addContent = jest.fn();
        this.removeContent = jest.fn();
        this.containsContent = jest.fn();
        this.findContent = jest.fn();
        this.getAllContents = jest.fn();
        this.getAllContentIDsInFolderAndSubFolders = jest.fn();

        this.addSubFolder = jest.fn();
        this.removeSubFolder = jest.fn();
        this.containsSubFolder = jest.fn();
        this.getAllSubFolders = jest.fn();
        this.findFolder = jest.fn();

        this.importFromJSON = jest.fn();
        this.exportToJSON = jest.fn();

        this.findContentsByNamePart = jest.fn();
    }
}