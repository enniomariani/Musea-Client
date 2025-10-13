import {TagRegistry} from "renderer/registries/TagRegistry";

export class MockTagRegistry extends TagRegistry{

    add: jest.Mock;
    remove: jest.Mock;
    get: jest.Mock;
    getAll: jest.Mock;
    reset: jest.Mock;

    constructor() {
        super();
        this.add = jest.fn();
        this.remove = jest.fn();
        this.get = jest.fn();
        this.getAll = jest.fn();
        this.reset = jest.fn();
    }
}