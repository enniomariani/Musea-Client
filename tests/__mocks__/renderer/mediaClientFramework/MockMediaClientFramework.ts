import {
    IMediaClientFramework
} from "../../../../src/js/renderer/mediaClientFramework/MediaClientFramework";
import {
    MediaStationDataService
} from "../../../../src/js/renderer/mediaClientFramework/services/MediaStationDataService";
import {
    MediaStationNetworkService
} from "../../../../src/js/renderer/mediaClientFramework/services/MediaStationNetworkService";
import {MediaAppService} from "../../../../src/js/renderer/mediaClientFramework/services/MediaAppService";
import {FolderService} from "../../../../src/js/renderer/mediaClientFramework/services/FolderService";
import {ContentService} from "../../../../src/js/renderer/mediaClientFramework/services/ContentService";
import {MediaService} from "../../../../src/js/renderer/mediaClientFramework/services/MediaService";
import {MockMediaStationDataService} from "./services/MockMediaStationDataService";
import {MockMediaStationNetworkService} from "./services/MockMediaStationNetworkService";
import {MockMediaAppService} from "./services/MockMediaAppService";
import {MockFolderService} from "./services/MockFolderService";
import {MockContentService} from "./services/MockContentService";
import {MockMediaService} from "./services/MockMediaService";
import {MockContent} from "./dataStructure/MockContent";
import {MockMediaStationCacheService} from "./services/MockMediaStationCacheService";

export class MockMediaClientFramework implements  IMediaClientFramework{
    private _mockMediaStationDataService: MockMediaStationDataService = new MockMediaStationDataService();
    private _mockMediaStationNetworkService: MockMediaStationNetworkService = new MockMediaStationNetworkService();
    private _mockMediaAppService: MockMediaAppService = new MockMediaAppService();
    private _mockFolderService: MockFolderService = new MockFolderService();
    private _mockContentService: MockContentService = new MockContentService();
    private _mockMediaService: MockMediaService = new MockMediaService();
    private _mockMediaStationCacheService: MockMediaStationCacheService = new MockMediaStationCacheService();

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

    get mockMediaStationCacheService(): MockMediaStationCacheService {
        return this._mockMediaStationCacheService;
    }
}