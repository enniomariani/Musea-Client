import {MediaStationRepository} from "./dataStructure/MediaStationRepository";
import {MediaStationDataService} from "src/mcf/renderer/services/mediastation/MediaStationDataService";
import {MediaStationLocalMetaData} from "./fileHandling/MediaStationLocalMetaData";
import {MediaAppDataService} from "src/mcf/renderer/services/MediaAppDataService";
import {NetworkService} from "./services/NetworkService";
import {NetworkConnectionHandler} from "./network/NetworkConnectionHandler";
import {ContentDataService} from "src/mcf/renderer/services/ContentDataService";
import {ContentNetworkService} from "./services/ContentNetworkService";
import {FolderDataService} from "src/mcf/renderer/services/FolderDataService";
import {MediaService} from "./services/MediaService";
import {MediaStationCacheService} from "src/mcf/renderer/services/mediastation/MediaStationCacheService";
import {TagDataService} from "./services/TagDataService";
import {MediaStationService} from "src/mcf/renderer/services/mediastation/MediaStationService";

export interface IMediaClientFramework {
    get mediaAppService(): MediaAppDataService
    get folderService(): FolderDataService
    get contentService(): ContentDataService
    get mediaService(): MediaService
    get mediaStationService(): MediaStationService
    get tagService(): TagDataService
}

export class MediaClientFramework implements IMediaClientFramework {

    protected _mediaStationMetaData: MediaStationLocalMetaData;
    protected _mediaStationRepository: MediaStationRepository;

    protected _networkConnectionHandler: NetworkConnectionHandler;
    protected _networkService: NetworkService;
    protected _contentNetworkService: ContentNetworkService;

    protected _mediaStationService: MediaStationService;

    protected _mediaAppService: MediaAppDataService;
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

        this._mediaStationService = new MediaStationService(this._mediaStationRepository, this._networkService);
        this._mediaAppService = new MediaAppDataService(this._mediaStationRepository);

        this._mediaService = new MediaService(this._mediaStationRepository);
        this._contentService = new ContentDataService(this._mediaStationRepository, this._mediaService);
        this._folderService = new FolderDataService(this._mediaStationRepository, this._contentService);

        this._tagService = new TagDataService(this._mediaStationRepository);
    }

    get mediaAppService(): MediaAppDataService {
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

    get mediaStationService(): MediaStationService {
        return this._mediaStationService;
    }

    get tagService(): TagDataService {
        return this._tagService;
    }
}