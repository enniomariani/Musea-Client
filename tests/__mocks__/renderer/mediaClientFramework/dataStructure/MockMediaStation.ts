import {MediaStation} from "../../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaStation";
import {MockFolder} from "./MockFolder";

export class MockMediaStation extends MediaStation{

    getNextMediaAppId: jest.Mock;
    getNextContentId: jest.Mock;
    getNextFolderId: jest.Mock;
    getNextTagId: jest.Mock;

    private _rootFolderMock: MockFolder = new MockFolder(0);

    constructor(id) {
        super(id);
        this.getNextMediaAppId = jest.fn();
        this.getNextContentId = jest.fn();
        this.getNextFolderId = jest.fn();
        this.getNextTagId = jest.fn();
    }

    get rootFolder(): MockFolder {
        return this._rootFolderMock;
    }
}