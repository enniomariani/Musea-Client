import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";
import {MockFolder} from "./MockFolder";
import {MockTagRegistry} from "tests/__mocks__/mcf/renderer/registries/MockTagRegistry";
import {MockMediaAppRegistry} from "tests/__mocks__/mcf/renderer/registries/MockMediaAppRegistry";

const mockTagRegistry:MockTagRegistry = new MockTagRegistry();
const mockMediaAppRegistry: MockMediaAppRegistry = new MockMediaAppRegistry();

export class MockMediaStation extends MediaStation{

    reset: jest.Mock;

    getNextMediaAppId: jest.Mock;
    getNextContentId: jest.Mock;
    getNextFolderId: jest.Mock;
    getNextTagId: jest.Mock;
    exportToJSON: jest.Mock;
    importFromJSON: jest.Mock;
    importMediaAppsFromJSON: jest.Mock;

    getControllerIp: jest.Mock;
    addMediaApp: jest.Mock;
    getMediaApp: jest.Mock;
    getAllMediaApps: jest.Mock;

    private _rootFolderMock: MockFolder = new MockFolder(0);
    private _mockTagManager: MockTagRegistry = new MockTagRegistry();

    constructor(id) {
        super(id, mockTagRegistry, mockMediaAppRegistry);
        this.reset = jest.fn();

        this.getNextMediaAppId = jest.fn();
        this.getNextContentId = jest.fn();
        this.getNextFolderId = jest.fn();
        this.getNextTagId = jest.fn();
        this.exportToJSON = jest.fn();
        this.importFromJSON = jest.fn();
        this.importMediaAppsFromJSON = jest.fn();

        this.getControllerIp = jest.fn();
        this.addMediaApp = jest.fn();
        this.getMediaApp = jest.fn();
        this.getAllMediaApps = jest.fn();

        this.getControllerIp.mockReturnValue("mock-controller-ip")
    }

    override get tagRegistry(): MockTagRegistry {
        return this._mockTagManager;
    }

    get rootFolder(): MockFolder {
        return this._rootFolderMock;
    }

    set rootFolder(folder:MockFolder) {
        this._rootFolderMock = folder;
    }
}