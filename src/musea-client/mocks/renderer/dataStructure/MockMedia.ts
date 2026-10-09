import {Image, Video} from "renderer/dataStructure/Media.js";


export class MockImage extends Image{

    importFromJSON: jest.Mock;
    exportToJSON: jest.Mock;

    constructor() {
        super();

        this.importFromJSON = jest.fn();
        this.exportToJSON = jest.fn();
    }
}

export class MockVideo extends Video{

    importFromJSON: jest.Mock;
    exportToJSON: jest.Mock;

    constructor() {
        super();

        this.importFromJSON = jest.fn();
        this.exportToJSON = jest.fn();
    }
}