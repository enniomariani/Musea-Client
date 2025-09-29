import {Content} from "src/mcf/renderer/dataStructure/Content";


export class MockContent extends Content{

    getMaxDuration: jest.Mock;
    importFromJSON: jest.Mock;
    exportToJSON: jest.Mock;
    requireMedia: jest.Mock;

    constructor(id:number, folderId:number) {
        super(id, folderId);

        this.getMaxDuration = jest.fn();
        this.importFromJSON = jest.fn();
        this.exportToJSON = jest.fn();
        this.requireMedia = jest.fn();
    }
}