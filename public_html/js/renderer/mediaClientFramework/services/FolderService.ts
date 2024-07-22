import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Folder} from "../dataStructure/Folder";
import {Content} from "../dataStructure/Content";


export class FolderService {

    private _mediaStationRepository:MediaStationRepository;

    constructor(mediaStationRepository: MediaStationRepository) {
        this._mediaStationRepository = mediaStationRepository;
    }

    getAllContentsInFolder(mediaStationId:number, folderId:number):Map<number, string> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let folder:Folder = this._findFolder(mediaStation.rootFolder, folderId);
        let allContents:Map<number, Content> = folder.getAllContents();
        let returnMap:Map<number, string> = new Map();

        allContents.forEach((content, key) =>{
            returnMap.set(key, content.name );
        });

        return returnMap;
    }

    private _findFolder(rootFolder:Folder, id: number): Folder {
        let folder: Folder = rootFolder.findFolder(id);

        if (!folder)
            throw new Error("Folder with this ID does not exist: " + id);
        else
            return folder;
    }

    private _findMediaStation(id: number): MediaStation {
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(id);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);
        else
            return mediaStation;
    }
}