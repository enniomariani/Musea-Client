import {MockMediaStationDataService} from "./services/MockMediaStationDataService";
import {MockMediaStationNetworkService} from "./services/MockMediaStationNetworkService";
import {MockMediaAppService} from "./services/MockMediaAppService";
import {MockFolderService} from "./services/MockFolderService";
import {MockContentService} from "./services/MockContentService";
import {MockMediaService} from "./services/MockMediaService";
import {MockMediaStationCacheService} from "./services/MockMediaStationCacheService";
import {IMediaClientFramework} from "../../../../src/mcf/renderer/MediaClientFramework";
import {MockTagService} from "./services/MockTagService";

export class MockMediaClientFramework implements  IMediaClientFramework{
    private _mockMediaStationDataService: MockMediaStationDataService = new MockMediaStationDataService();
    private _mockMediaStationNetworkService: MockMediaStationNetworkService = new MockMediaStationNetworkService();
    private _mockMediaAppService: MockMediaAppService = new MockMediaAppService();
    private _mockFolderService: MockFolderService = new MockFolderService();
    private _mockContentService: MockContentService = new MockContentService();
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

    get folderService(): MockFolderService {
        return this._mockFolderService;
    }

    get contentService(): MockContentService {
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