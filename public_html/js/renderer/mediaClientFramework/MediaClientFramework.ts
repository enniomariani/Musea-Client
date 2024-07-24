import {MediaStationRepository} from "./dataStructure/MediaStationRepository";
import {MediaStationDataService} from "./services/MediaStationDataService";
import {MediaStationLocalMetaData} from "./fileHandling/MediaStationLocalMetaData";
import {MediaAppService} from "./services/MediaAppService";
import {NetworkService} from "./services/NetworkService";
import {NetworkConnectionHandler} from "./network/NetworkConnectionHandler";
import {ContentService} from "./services/ContentService";
import {ContentNetworkService} from "./services/ContentNetworkService";
import {MediaStationNetworkService} from "./services/MediaStationNetworkService";
import {FolderService} from "./services/FolderService";
import {MediaService} from "./services/MediaService";


export class MediaClientFramework {
    private _mediaStationMetaData: MediaStationLocalMetaData;
    private _mediaStationRepository: MediaStationRepository;

    private _networkConnectionHandler: NetworkConnectionHandler;
    private _networkService: NetworkService;
    private _contentNetworkService: ContentNetworkService;

    private _mediaStationDataService: MediaStationDataService;
    private _mediaStationNetworkService: MediaStationNetworkService;
    private _mediaAppService: MediaAppService;

    private _folderService: FolderService;
    private _contentService: ContentService;
    private _mediaService:MediaService;

    constructor(pathToDataFolder: string) {
        this._mediaStationMetaData = new MediaStationLocalMetaData();
        this._mediaStationRepository = new MediaStationRepository(this._mediaStationMetaData, pathToDataFolder);

        this._networkConnectionHandler = new NetworkConnectionHandler();
        this._networkService = new NetworkService(this._networkConnectionHandler);
        this._contentNetworkService = new ContentNetworkService(this._networkService);

        this._mediaStationDataService = new MediaStationDataService(this._mediaStationRepository);
        this._mediaStationNetworkService = new MediaStationNetworkService(this._networkService, this._mediaStationRepository);
        this._mediaAppService = new MediaAppService(this._mediaStationRepository, this._networkService);


        this._folderService = new FolderService(this._mediaStationRepository);
        this._contentService = new ContentService(this._mediaStationRepository, this._contentNetworkService);
        this._mediaService = new MediaService(this._mediaStationRepository);
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

    get folderService(): FolderService {
        return this._folderService;
    }

    get contentService(): ContentService {
        return this._contentService;
    }

    get mediaService(): MediaService {
        return this._mediaService;
    }
}