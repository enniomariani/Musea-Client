import {MediaAppRegistry} from "@app/mcf/renderer/registries/MediaAppRegistry";

export class MockMediaAppRegistry extends MediaAppRegistry{

    add: jest.Mock;
    get: jest.Mock;
    getAll: jest.Mock;
    getControllerIp: jest.Mock;

    importFromJSON: jest.Mock;
    reset: jest.Mock;

    constructor() {
        super();
        this.add = jest.fn();
        this.get = jest.fn();
        this.getAll = jest.fn();
        this.getControllerIp = jest.fn();

        this.importFromJSON = jest.fn();
        this.reset = jest.fn();
    }
}