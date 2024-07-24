import {MediaStation} from "../../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaStation";
import {MockFolder} from "./MockFolder";

export class MockMediaStation extends MediaStation{


    getNextMediaAppId: jest.Mock;
    getNextContentId: jest.Mock;
    getNextFolderId: jest.Mock;
    getNextTagId: jest.Mock;
    exportToJSON: jest.Mock;
    importFromJSON: jest.Mock;
    getControllerIp: jest.Mock;
    addMediaApp: jest.Mock;
    getMediaApp: jest.Mock;
    getAllMediaApps: jest.Mock;

    private _rootFolderMock: MockFolder = new MockFolder(0);

    constructor(id) {
        super(id);
        this.getNextMediaAppId = jest.fn();
        this.getNextContentId = jest.fn();
        this.getNextFolderId = jest.fn();
        this.getNextTagId = jest.fn();
        this.exportToJSON = jest.fn();
        this.importFromJSON = jest.fn();
        this.getControllerIp = jest.fn();
        this.addMediaApp = jest.fn();
        this.getMediaApp = jest.fn();
        this.getAllMediaApps = jest.fn();

        this.getControllerIp.mockReturnValue("mock-controller-ip")
    }

    get rootFolder(): MockFolder {
        return this._rootFolderMock;
    }

    set rootFolder(folder:MockFolder) {
        this._rootFolderMock = folder;
    }
}