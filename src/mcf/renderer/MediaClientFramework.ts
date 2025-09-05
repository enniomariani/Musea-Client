import {MediaStationRepository} from "./dataStructure/MediaStationRepository";
import {MediaStationDataService} from "src/mcf/renderer/services/mediastation/MediaStationDataService";
import {MediaStationLocalMetaData} from "./fileHandling/MediaStationLocalMetaData";
import {MediaAppService} from "./services/MediaAppService";
import {NetworkService} from "./services/NetworkService";
import {NetworkConnectionHandler} from "./network/NetworkConnectionHandler";
import {ContentDataService} from "src/mcf/renderer/services/ContentDataService";
import {ContentNetworkService} from "./services/ContentNetworkService";
import {MediaStationNetworkService} from "src/mcf/renderer/services/mediastation/MediaStationNetworkService";
import {FolderDataService} from "src/mcf/renderer/services/FolderDataService";
import {MediaService} from "./services/MediaService";
import {MediaStationCacheService} from "src/mcf/renderer/services/mediastation/MediaStationCacheService";
import {TagDataService} from "./services/TagDataService";

export interface IMediaClientFramework {
    get mediaStationDataService(): MediaStationDataService
    get mediaStationNetworkService(): MediaStationNetworkService
    get mediaAppService(): MediaAppService
    get folderService(): FolderDataService
    get contentService(): ContentDataService
    get mediaService(): MediaService
    get mediaStationCacheService(): MediaStationCacheService
    get tagService(): TagDataService
}

export class MediaClientFramework implements IMediaClientFramework {

    protected _mediaStationMetaData: MediaStationLocalMetaData;
    protected _mediaStationRepository: MediaStationRepository;

    protected _networkConnectionHandler: NetworkConnectionHandler;
    protected _networkService: NetworkService;
    protected _contentNetworkService: ContentNetworkService;

    protected _mediaStationDataService: MediaStationDataService;
    protected _mediaStationNetworkService: MediaStationNetworkService;
    protected _mediaStationCacheService: MediaStationCacheService;
    protected _mediaAppService: MediaAppService;

    protected _folderService: FolderDataService;
    protected _contentService: ContentDataService;
    protected _mediaService: MediaService;
    protected _tagService: TagDataService;

    constructor(pathToDataFolder: string) {
        this._mediaStationMetaData = new MediaStationLocalMetaData();

        this._mediaStationRepository = new MediaStationRepository(this._mediaStationMetaData, pathToDataFolder);

        this._networkConnectionHandler = new NetworkConnectionHandler();
        this._networkService = new NetworkService(this._networkConnectionHandler);
        this._contentNetworkService = new ContentNetworkService(this._networkService);

        this._mediaStationDataService = new MediaStationDataService(this._mediaStationRepository);
        this._mediaStationNetworkService = new MediaStationNetworkService(this._networkService, this._mediaStationRepository);
        this._mediaStationCacheService = new MediaStationCacheService(this._mediaStationRepository);
        this._mediaAppService = new MediaAppService(this._mediaStationRepository, this._networkService);

        this._mediaService = new MediaService(this._mediaStationRepository);
        this._contentService = new ContentDataService(this._mediaStationRepository, this._contentNetworkService, this._mediaService);
        this._folderService = new FolderDataService(this._mediaStationRepository, this._contentService);

        this._tagService = new TagDataService(this._mediaStationRepository);
    }

    get mediaStationDataService(): MediaStationDataService {
        return this._mediaStationDataService;
    }

    get mediaStationNetworkService(): MediaStationNetworkService {
        return this._mediaStationNetworkService;
    }

    get mediaAppService(): MediaAppService {
        return this._mediaAppService;
    }

    get folderService(): FolderDataService {
        return this._folderService;
    }

    get contentService(): ContentDataService {
        return this._contentService;
    }

    get mediaService(): MediaService {
        return this._mediaService;
    }

    get mediaStationCacheService(): MediaStationCacheService {
        return this._mediaStationCacheService;
    }

    get tagService(): TagDataService {
        return this._tagService;
    }
}