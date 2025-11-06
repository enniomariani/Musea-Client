import {MediaStationRepository} from "renderer/dataStructure/MediaStationRepository.js";
import {MediaStationLocalMetaData} from "renderer/fileHandling/MediaStationLocalMetaData.js";
import {MediaPlayerDataService} from "renderer/services/MediaPlayerDataService.js";
import {NetworkService} from "renderer/network/NetworkService.js";
import {NetworkConnectionHandler} from "renderer/network/NetworkConnectionHandler.js";
import {ContentDataService} from "renderer/services/ContentDataService.js";
import {MediaPlayerCommandService} from "renderer/network/MediaPlayerCommandService.js";
import {FolderDataService} from "renderer/services/FolderDataService.js";
import {MediaService} from "renderer/services/MediaService.js";
import {TagDataService} from "renderer/services/TagDataService.js";
import {MediaStationService} from "renderer/services/mediastation/MediaStationService.js";
import {MediaPlayerConnectionService} from "renderer/services/MediaPlayerConnectionService.js";
import {MediaStationDataService} from "renderer/services/mediastation/MediaStationDataService.js";
import {MediaStationCacheService} from "renderer/services/mediastation/MediaStationCacheService.js";
import {MediaStationCommandService} from "renderer/services/mediastation/MediaStationCommandService.js";
import {MediaStationContentsService} from "renderer/services/mediastation/MediaStationContentsService.js";
import {MediaStationSyncService} from "renderer/services/mediastation/MediaStationSyncService.js";
import {MediaPlayerSyncService} from "renderer/network/MediaPlayerSyncService.js";
import {MediaStationEventService} from "renderer/services/mediastation/MediaStationEventService.js";

export interface IMediaClientFramework {
    get mediaPlayerDataService(): MediaPlayerDataService
    get mediaPlayerConnectionService(): MediaPlayerConnectionService

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
    protected _contentNetworkService: MediaPlayerCommandService;

    protected _mediaStationService: MediaStationService;

    protected _mediaPlayerDataService: MediaPlayerDataService;
    protected _mediaPlayerSyncService:MediaPlayerSyncService;
    private _mediaPlayerConnectionService: MediaPlayerConnectionService;

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
        this._contentNetworkService = new MediaPlayerCommandService(this._networkService);
        this._mediaPlayerConnectionService = new MediaPlayerConnectionService(this._mediaStationRepository, this._networkService);
        this._mediaPlayerSyncService = new MediaPlayerSyncService(this._networkService, this._mediaStationRepository);

        //media-station facade
        this._mediaStationService = new MediaStationService(new MediaStationDataService(this._mediaStationRepository),
            new MediaStationCacheService(this._mediaStationRepository),
            new MediaStationCommandService(this._mediaStationRepository, this._networkService, this._contentNetworkService),
            new MediaStationContentsService(this._networkService, this._mediaStationRepository),
            new MediaStationSyncService(this._networkService, this._mediaStationRepository, this._mediaPlayerConnectionService, this._mediaPlayerSyncService),
            new MediaStationEventService(this._networkService));
        this._mediaPlayerDataService = new MediaPlayerDataService(this._mediaStationRepository);

        this._mediaService = new MediaService(this._mediaStationRepository);
        this._contentService = new ContentDataService(this._mediaStationRepository, this._mediaService);
        this._folderService = new FolderDataService(this._mediaStationRepository, this._contentService);

        this._tagService = new TagDataService(this._mediaStationRepository);
    }

    /**
     * all services related to change data of media-players (add, remove, change name, ...)
     */
    get mediaPlayerDataService(): MediaPlayerDataService {
        return this._mediaPlayerDataService;
    }

    /**
     * all services related to connections of media-players: check online status, connect, disconnect, ...
     */
    get mediaPlayerConnectionService(): MediaPlayerConnectionService {
        return this._mediaPlayerConnectionService;
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