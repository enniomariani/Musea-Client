import {Content} from "../../../../../src/mcf/renderer/dataStructure/Content";


export class MockContent extends Content{

    getMaxDuration: jest.Mock;
    importFromJSON: jest.Mock;
    exportToJSON: jest.Mock;

    constructor(id, folderId) {
        super(id, folderId);

        this.getMaxDuration = jest.fn();
        this.importFromJSON = jest.fn();
        this.exportToJSON = jest.fn();
    }
}