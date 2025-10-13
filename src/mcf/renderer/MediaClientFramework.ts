import {MediaStationRepository} from "./dataStructure/MediaStationRepository.js";
import {MediaStationLocalMetaData} from "./fileHandling/MediaStationLocalMetaData.js";
import {MediaAppDataService} from "renderer/services/MediaAppDataService.js";
import {NetworkService} from "renderer/network/NetworkService.js";
import {NetworkConnectionHandler} from "./network/NetworkConnectionHandler.js";
import {ContentDataService} from "renderer/services/ContentDataService.js";
import {MediaAppCommandService} from "renderer/network/MediaAppCommandService.js";
import {FolderDataService} from "renderer/services/FolderDataService.js";
import {MediaService} from "./services/MediaService.js";
import {TagDataService} from "./services/TagDataService.js";
import {MediaStationService} from "renderer/services/mediastation/MediaStationService.js";
import {MediaAppConnectionService} from "renderer/services/MediaAppConnectionService.js";
import {MediaStationDataService} from "renderer/services/mediastation/MediaStationDataService.js";
import {MediaStationCacheService} from "renderer/services/mediastation/MediaStationCacheService.js";
import {MediaStationCommandService} from "renderer/services/mediastation/MediaStationCommandService.js";
import {MediaStationContentsService} from "renderer/services/mediastation/MediaStationContentsService.js";
import {MediaStationSyncService} from "renderer/services/mediastation/MediaStationSyncService.js";
import {MediaAppSyncService} from "renderer/network/MediaAppSyncService.js";
import {MediaStationEventService} from "renderer/services/mediastation/MediaStationEventService.js";

export interface IMediaClientFramework {
    get mediaAppDataService(): MediaAppDataService
    get mediaAppConnectionService(): MediaAppConnectionService

    get mediaStationService(): MediaStationService

    get folderService(): FolderDataService
    get contentService(): ContentDataService
    get mediaService(): MediaService
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
    protected _mediaAppSyncService:MediaAppSyncService;
    private _mediaAppConnectionService: MediaAppConnectionService;

    protected _folderService: FolderDataService;
    protected _contentService: ContentDataService;
    protected _mediaService: MediaService;
    protected _tagService: TagDataService;

    /**
     * @remarks
     * All methods accepting a mediaStationId, folderId, contentId or tagId will throw an error
     * if the element with the corresponding id does not exist.
     *
     * @param {string} pathToDataFolder
     */
    constructor(pathToDataFolder: string) {
        this._mediaStationMetaData = new MediaStationLocalMetaData();

        this._mediaStationRepository = new MediaStationRepository(this._mediaStationMetaData, pathToDataFolder);

        this._networkConnectionHandler = new NetworkConnectionHandler();
        this._networkService = new NetworkService(this._networkConnectionHandler);
        this._contentNetworkService = new MediaAppCommandService(this._networkService);
        this._mediaAppConnectionService = new MediaAppConnectionService(this._mediaStationRepository, this._networkService);
        this._mediaAppSyncService = new MediaAppSyncService(this._networkService, this._mediaStationRepository);

        //media-station facade
        this._mediaStationService = new MediaStationService(new MediaStationDataService(this._mediaStationRepository),
            new MediaStationCacheService(this._mediaStationRepository),
            new MediaStationCommandService(this._mediaStationRepository, this._networkService, this._contentNetworkService),
            new MediaStationContentsService(this._networkService, this._mediaStationRepository),
            new MediaStationSyncService(this._networkService, this._mediaStationRepository, this._mediaAppConnectionService, this._mediaAppSyncService),
            new MediaStationEventService(this._networkService));
        this._mediaAppDataService = new MediaAppDataService(this._mediaStationRepository);

        this._mediaService = new MediaService(this._mediaStationRepository);
        this._contentService = new ContentDataService(this._mediaStationRepository, this._mediaService);
        this._folderService = new FolderDataService(this._mediaStationRepository, this._contentService);

        this._tagService = new TagDataService(this._mediaStationRepository);
    }

    /**
     * all services related to change data of media-apps (add, remove, change name, ...)
     */
    get mediaAppDataService(): MediaAppDataService {
        return this._mediaAppDataService;
    }

    /**
     * all services related to connections of media-apps: check online status, connect, disconnect, ...
     */
    get mediaAppConnectionService(): MediaAppConnectionService {
        return this._mediaAppConnectionService;
    }

    /**
     * all services related to change data of folders (add, remove, change name, search for content, delete, ...)
     */
    get folderService(): FolderDataService {
        return this._folderService;
    }

    /**
     * all services related to change data of contents (add, remove, change name, search for content, delete, ...)
     */
    get contentService(): ContentDataService {
        return this._contentService;
    }

    /**
     * all services related to change media-data: add media, remove, ...
     */
    get mediaService(): MediaService {
        return this._mediaService;
    }

    /**
     * all services related to a media-station: add, remove, change name, send media-commands, receive block/unblock-events,
     * sync, cache, ...
     */
    get mediaStationService(): MediaStationService {
        return this._mediaStationService;
    }

    /**
     * all services related to change tag-data: add tag, remove tag, rename, ...
     */
    get tagService(): TagDataService {
        return this._tagService;
    }
}