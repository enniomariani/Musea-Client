import {MediaStation} from "renderer/dataStructure/MediaStation";
import {MockFolder} from "./MockFolder";
import {MockTagRegistry} from "../registries/MockTagRegistry";
import {MockMediaAppRegistry} from "../registries/MockMediaAppRegistry";

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
    private _mockTagRegistry: MockTagRegistry = new MockTagRegistry();
    private _mockMediaAppRegistry: MockMediaAppRegistry = new MockMediaAppRegistry();

    constructor(id:number) {
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
        return this._mockTagRegistry;
    }

    override get mediaAppRegistry(): MockMediaAppRegistry {
        return this._mockMediaAppRegistry;
    }

    get rootFolder(): MockFolder {
        return this._rootFolderMock;
    }

    set rootFolder(folder:MockFolder) {
        this._rootFolderMock = folder;
    }
}