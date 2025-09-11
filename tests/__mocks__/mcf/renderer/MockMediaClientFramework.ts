import {MockMediaAppDataService} from "tests/__mocks__/mcf/renderer/services/MockMediaAppDataService";
import {MockFolderDataService} from "tests/__mocks__/mcf/renderer/services/MockFolderDataService";
import {MockContentDataService} from "__mocks__/mcf/renderer/services/MockContentDataService";
import {MockMediaService} from "./services/MockMediaService";
import {IMediaClientFramework} from "src/mcf/renderer/MediaClientFramework";
import {MockTagService} from "./services/MockTagService";
import {MockMediaAppConnectionService} from "tests/__mocks__/mcf/renderer/services/MockMediaAppConnectionService";
import {MockMediaStationService} from "__mocks__/mcf/renderer/services/mediastation/MockMediaStationService";

export class MockMediaClientFramework implements  IMediaClientFramework{
    private _mockMediaAppDataService: MockMediaAppDataService = new MockMediaAppDataService();
    private _mockMediaAppConnectionService: MockMediaAppConnectionService = new MockMediaAppConnectionService();

    private _mockMediaStationService: MockMediaStationService = new MockMediaStationService();

    private _mockFolderService: MockFolderDataService = new MockFolderDataService();
    private _mockContentService: MockContentDataService = new MockContentDataService();
    private _mockMediaService: MockMediaService = new MockMediaService();
    private _mockTagService: MockTagService = new MockTagService();

    constructor() {}


    get folderService(): MockFolderDataService {
        return this._mockFolderService;
    }

    get contentService(): MockContentDataService {
        return this._mockContentService;
    }

    get mediaService(): MockMediaService {
        return this._mockMediaService;
    }

    get tagService(): MockTagService {
        return this._mockTagService;
    }

    get mediaAppDataService():MockMediaAppDataService {
        return this._mockMediaAppDataService;
    }

    get mediaAppConnectionService():MockMediaAppConnectionService {
        return this._mockMediaAppConnectionService;
    }

    get mediaStationService(): MockMediaStationService {
        return this._mockMediaStationService;
    }
}