import {MockMediaStationDataService} from "tests/__mocks__/mcf/renderer/services/mediastation/MockMediaStationDataService";
import {MockMediaStationNetworkService} from "tests/__mocks__/mcf/renderer/services/mediastation/MockMediaStationNetworkService";
import {MockMediaAppService} from "./services/MockMediaAppService";
import {MockFolderDataService} from "tests/__mocks__/mcf/renderer/services/MockFolderDataService";
import {MockContentDataService} from "__mocks__/mcf/renderer/services/MockContentDataService";
import {MockMediaService} from "./services/MockMediaService";
import {MockMediaStationCacheService} from "tests/__mocks__/mcf/renderer/services/mediastation/MockMediaStationCacheService";
import {IMediaClientFramework} from "@app/mcf/renderer/MediaClientFramework";
import {MockTagService} from "./services/MockTagService";

export class MockMediaClientFramework implements  IMediaClientFramework{
    private _mockMediaStationDataService: MockMediaStationDataService = new MockMediaStationDataService();
    private _mockMediaStationNetworkService: MockMediaStationNetworkService = new MockMediaStationNetworkService();
    private _mockMediaAppService: MockMediaAppService = new MockMediaAppService();
    private _mockFolderService: MockFolderDataService = new MockFolderDataService();
    private _mockContentService: MockContentDataService = new MockContentDataService();
    private _mockMediaService: MockMediaService = new MockMediaService();
    private _mockMediaStationCacheService: MockMediaStationCacheService = new MockMediaStationCacheService();
    private _mockTagService: MockTagService = new MockTagService();

    constructor() {}

    get mediaStationDataService(): MockMediaStationDataService {
        return this._mockMediaStationDataService;
    }

    get mediaStationNetworkService(): MockMediaStationNetworkService {
        return this._mockMediaStationNetworkService;
    }

    get mediaAppService(): MockMediaAppService {
        return this._mockMediaAppService;
    }

    get folderService(): MockFolderDataService {
        return this._mockFolderService;
    }

    get contentService(): MockContentDataService {
        return this._mockContentService;
    }

    get mediaService(): MockMediaService {
        return this._mockMediaService;
    }

    get mediaStationCacheService(): MockMediaStationCacheService {
        return this._mockMediaStationCacheService;
    }

    get tagService(): MockTagService {
        return this._mockTagService;
    }
}