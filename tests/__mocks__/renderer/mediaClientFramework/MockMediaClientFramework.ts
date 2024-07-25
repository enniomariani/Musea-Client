import {MediaClientFramework} from "../../../../public_html/js/renderer/mediaClientFramework/MediaClientFramework";
import {
    MediaStationDataService
} from "../../../../public_html/js/renderer/mediaClientFramework/services/MediaStationDataService";
import {
    MediaStationNetworkService
} from "../../../../public_html/js/renderer/mediaClientFramework/services/MediaStationNetworkService";
import {MediaAppService} from "../../../../public_html/js/renderer/mediaClientFramework/services/MediaAppService";
import {FolderService} from "../../../../public_html/js/renderer/mediaClientFramework/services/FolderService";
import {ContentService} from "../../../../public_html/js/renderer/mediaClientFramework/services/ContentService";
import {MediaService} from "../../../../public_html/js/renderer/mediaClientFramework/services/MediaService";
import {MockMediaStationDataService} from "./services/MockMediaStationDataService";
import {MockMediaStationNetworkService} from "./services/MockMediaStationNetworkService";
import {MockMediaAppService} from "./services/MockMediaAppService";
import {MockFolderService} from "./services/MockFolderService";
import {MockContentService} from "./services/MockContentService";
import {MockMediaService} from "./services/MockMediaService";


export class MockMediaClientFramework extends MediaClientFramework{

    constructor(path) {
        super(path);
    }

    get mediaStationDataService(): MediaStationDataService {
        return new MockMediaStationDataService();
    }

    get mediaStationNetworkService(): MediaStationNetworkService {
        return new MockMediaStationNetworkService();
    }

    get mediaAppService(): MediaAppService {
        return new MockMediaAppService();
    }

    get folderService(): FolderService {
        return new MockFolderService();
    }

    get contentService(): ContentService {
        return new MockContentService();
    }

    get mediaService(): MediaService {
        return new MockMediaService();
    }
}