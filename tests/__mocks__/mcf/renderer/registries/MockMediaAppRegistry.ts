import {MediaAppRegistry} from "src/mcf/renderer/registries/MediaAppRegistry";

export class MockMediaAppRegistry extends MediaAppRegistry{

    add: jest.Mock;
    get: jest.Mock;
    require: jest.Mock;
    getAll: jest.Mock;
    getController: jest.Mock;
    getControllerIp: jest.Mock;

    importFromJSON: jest.Mock;
    reset: jest.Mock;

    constructor() {
        super();
        this.add = jest.fn();
        this.get = jest.fn();
        this.require = jest.fn();
        this.getAll = jest.fn();
        this.getController = jest.fn();
        this.getControllerIp = jest.fn();

        this.importFromJSON = jest.fn();
        this.reset = jest.fn();
    }
}