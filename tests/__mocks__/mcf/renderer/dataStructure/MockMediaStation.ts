import {MediaStation} from "../../../../../src/js/mcf/renderer/dataStructure/MediaStation";
import {MockFolder} from "./MockFolder";

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

    addTag: jest.Mock;
    getTag: jest.Mock;
    getAllTags: jest.Mock;

    private _rootFolderMock: MockFolder = new MockFolder(0);

    constructor(id) {
        super(id);
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

        this.addTag = jest.fn();
        this.getTag = jest.fn();
        this.getAllTags = jest.fn();

        this.getControllerIp.mockReturnValue("mock-controller-ip")
    }

    get rootFolder(): MockFolder {
        return this._rootFolderMock;
    }

    set rootFolder(folder:MockFolder) {
        this._rootFolderMock = folder;
    }
}