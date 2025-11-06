import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {MockFolder} from "./MockFolder.js";
import {MockTagRegistry} from "../registries/MockTagRegistry.js";
import {MockMediaPlayerRegistry} from "../registries/MockMediaPlayerRegistry.js";

const mockTagRegistry:MockTagRegistry = new MockTagRegistry();
const mockMediaPlayerRegistry: MockMediaPlayerRegistry = new MockMediaPlayerRegistry();

export class MockMediaStation extends MediaStation{

    reset: jest.Mock;

    getNextMediaPlayerId: jest.Mock;
    getNextContentId: jest.Mock;
    getNextFolderId: jest.Mock;
    getNextTagId: jest.Mock;
    exportToJSON: jest.Mock;
    importFromJSON: jest.Mock;
    importMediaPlayersFromJSON: jest.Mock;

    getControllerIp: jest.Mock;
    addMediaPlayer: jest.Mock;
    getMediaPlayer: jest.Mock;
    getAllMediaPlayers: jest.Mock;

    private _rootFolderMock: MockFolder = new MockFolder(0);
    private _mockTagRegistry: MockTagRegistry = new MockTagRegistry();
    private _mockMediaPlayerRegistry: MockMediaPlayerRegistry = new MockMediaPlayerRegistry();

    constructor(id:number) {
        super(id, mockTagRegistry, mockMediaPlayerRegistry);
        this.reset = jest.fn();

        this.getNextMediaPlayerId = jest.fn();
        this.getNextContentId = jest.fn();
        this.getNextFolderId = jest.fn();
        this.getNextTagId = jest.fn();
        this.exportToJSON = jest.fn();
        this.importFromJSON = jest.fn();
        this.importMediaPlayersFromJSON = jest.fn();

        this.getControllerIp = jest.fn();
        this.addMediaPlayer = jest.fn();
        this.getMediaPlayer = jest.fn();
        this.getAllMediaPlayers = jest.fn();

        this.getControllerIp.mockReturnValue("mock-controller-ip")
    }

    override get tagRegistry(): MockTagRegistry {
        return this._mockTagRegistry;
    }

    override get mediaPlayerRegistry(): MockMediaPlayerRegistry {
        return this._mockMediaPlayerRegistry;
    }

    get rootFolder(): MockFolder {
        return this._rootFolderMock;
    }

    set rootFolder(folder:MockFolder) {
        this._rootFolderMock = folder;
    }
}