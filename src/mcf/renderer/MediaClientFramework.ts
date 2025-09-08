import {MediaStationRepository} from "./dataStructure/MediaStationRepository";
import {MediaStationLocalMetaData} from "./fileHandling/MediaStationLocalMetaData";
import {MediaAppDataService} from "src/mcf/renderer/services/MediaAppDataService";
import {NetworkService} from "src/mcf/renderer/network/NetworkService";
import {NetworkConnectionHandler} from "./network/NetworkConnectionHandler";
import {ContentDataService} from "src/mcf/renderer/services/ContentDataService";
import {MediaAppCommandService} from "src/mcf/renderer/network/MediaAppCommandService";
import {FolderDataService} from "src/mcf/renderer/services/FolderDataService";
import {MediaService} from "./services/MediaService";
import {TagDataService} from "./services/TagDataService";
import {MediaStationService} from "src/mcf/renderer/services/mediastation/MediaStationService";
import {MediaAppConnectionService} from "src/mcf/renderer/services/MediaAppConnectionService";
import {MediaStationDataService} from "src/mcf/renderer/services/mediastation/MediaStationDataService";
import {MediaStationCacheService} from "src/mcf/renderer/services/mediastation/MediaStationCacheService";
import {MediaStationCommandService} from "src/mcf/renderer/services/mediastation/MediaStationCommandService";
import {MediaStationContentsService} from "src/mcf/renderer/services/mediastation/MediaStationContentsService";
import {MediaStationSyncService} from "src/mcf/renderer/services/mediastation/MediaStationSyncService";

export interface IMediaClientFramework {
    get mediaAppDataService(): MediaAppDataService
    get mediaAppConnectionService(): MediaAppConnectionService

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
    protected _contentNetworkService: MediaAppCommandService;

    protected _mediaStationService: MediaStationService;

    protected _mediaAppDataService: MediaAppDataService;
    private _mediaAppConnectionService: MediaAppConnectionService;

    protected _folderService: FolderDataService;
    protected _contentService: ContentDataService;
    protected _mediaService: MediaService;
    protected _tagService: TagDataService;

    constructor(pathToDataFolder: string) {
        this._mediaStationMetaData = new MediaStationLocalMetaData();

        this._mediaStationRepository = new MediaStationRepository(this._mediaStationMetaData, pathToDataFolder);

        this._networkConnectionHandler = new NetworkConnectionHandler();
        this._networkService = new NetworkService(this._networkConnectionHandler);
        this._contentNetworkService = new MediaAppCommandService(this._networkService);
        this._mediaAppConnectionService = new MediaAppConnectionService(this._mediaStationRepository, this._networkService);

        //media-station facade
        this._mediaStationService = new MediaStationService(new MediaStationDataService(this._mediaStationRepository),
            new MediaStationCacheService(this._mediaStationRepository),
            new MediaStationCommandService(this._mediaStationRepository, this._networkService, this._contentNetworkService),
            new MediaStationContentsService(this._networkService, this._mediaStationRepository),
            new MediaStationSyncService(this._networkService, this._mediaStationRepository));
        this._mediaAppDataService = new MediaAppDataService(this._mediaStationRepository);

        this._mediaService = new MediaService(this._mediaStationRepository);
        this._contentService = new ContentDataService(this._mediaStationRepository, this._mediaService);
        this._folderService = new FolderDataService(this._mediaStationRepository, this._contentService);

        this._tagService = new TagDataService(this._mediaStationRepository);
    }

    get mediaAppDataService(): MediaAppDataService {
        return this._mediaAppDataService;
    }

    get mediaAppConnectionService(): MediaAppConnectionService {
        return this._mediaAppConnectionService;
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