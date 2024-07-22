import {Folder} from "../../../../../public_html/js/renderer/mediaClientFramework/dataStructure/Folder";


export class MockFolder extends Folder{

    addContent: jest.Mock;
    removeContent: jest.Mock;
    containsContent: jest.Mock;
    addSubFolder: jest.Mock;
    containsSubFolder: jest.Mock;
    findFolder: jest.Mock;
    findContent: jest.Mock;
    getAllContents: jest.Mock;
    importFromJSON: jest.Mock;
    exportToJSON: jest.Mock;

    constructor(id) {
        super(id);
        this.addContent = jest.fn();
        this.removeContent = jest.fn();
        this.containsContent = jest.fn();
        this.addSubFolder = jest.fn();
        this.containsSubFolder = jest.fn();
        this.findFolder = jest.fn();
        this.findContent = jest.fn();
        this.getAllContents = jest.fn();
        this.importFromJSON = jest.fn();
        this.exportToJSON = jest.fn();
    }
}