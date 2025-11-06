import {MockMediaPlayerDataService} from "./services/MockMediaPlayerDataService.js";
import {MockFolderDataService} from "./services/MockFolderDataService.js";
import {MockContentDataService} from "./services/MockContentDataService.js";
import {MockMediaService} from "./services/MockMediaService.js";
import {IMediaClientFramework} from "renderer/MediaClientFramework.js";
import {MockTagService} from "./services/MockTagService.js";
import {MockMediaPlayerConnectionService} from "./services/MockMediaPlayerConnectionService.js";
import {MockMediaStationService} from "./services/mediastation/MockMediaStationService.js";

export class MockMediaClientFramework implements  IMediaClientFramework{
    private _mockMediaPlayerDataService: MockMediaPlayerDataService = new MockMediaPlayerDataService();
    private _mockMediaPlayerConnectionService: MockMediaPlayerConnectionService = new MockMediaPlayerConnectionService();

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

    get mediaPlayerDataService():MockMediaPlayerDataService {
        return this._mockMediaPlayerDataService;
    }

    get mediaPlayerConnectionService():MockMediaPlayerConnectionService {
        return this._mockMediaPlayerConnectionService;
    }

    get mediaStationService(): MockMediaStationService {
        return this._mockMediaStationService;
    }
}