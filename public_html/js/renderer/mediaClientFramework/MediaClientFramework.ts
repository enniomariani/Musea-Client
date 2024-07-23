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


export class MediaClientFramework{

    private _mediaStationMetaData:MediaStationLocalMetaData = new MediaStationLocalMetaData();
    private _mediaStationRepository:MediaStationRepository = new MediaStationRepository(this._mediaStationMetaData);

    private _networkConnectionHandler:NetworkConnectionHandler = new NetworkConnectionHandler();
    private _networkService:NetworkService = new NetworkService(this._networkConnectionHandler);
    private _contentNetworkService:ContentNetworkService = new ContentNetworkService(this._networkService);

    private _mediaStationDataService:MediaStationDataService = new MediaStationDataService(this._mediaStationRepository);
    private _mediaStationNetworkService:MediaStationNetworkService = new MediaStationNetworkService(this._networkService, this._mediaStationRepository);
    private _mediaAppService:MediaAppService = new MediaAppService(this._mediaStationRepository, this._networkService);
    private _folderService:FolderService = new FolderService(this._mediaStationRepository);
    private _contentService:ContentService = new ContentService(this._mediaStationRepository, this._contentNetworkService);

    constructor() {
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
}