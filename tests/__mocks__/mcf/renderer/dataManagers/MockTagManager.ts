import {TagManager} from "@app/mcf/renderer/dataManagers/TagManager";

export class MockTagManager extends TagManager{

    addTag: jest.Mock;
    removeTag: jest.Mock;
    getTag: jest.Mock;
    getAllTags: jest.Mock;

    constructor() {
        super();
        this.addTag = jest.fn();
        this.removeTag = jest.fn();
        this.getTag = jest.fn();
        this.getAllTags = jest.fn();
    }
}