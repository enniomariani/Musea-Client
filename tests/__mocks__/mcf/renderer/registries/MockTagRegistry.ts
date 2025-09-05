import {TagRegistry} from "@app/mcf/renderer/registries/TagRegistry";

export class MockTagRegistry extends TagRegistry{

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