import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Folder} from "../dataStructure/Folder";
import {Content} from "../dataStructure/Content";
import {FolderManager} from "../dataManagers/FolderManager";


export class FolderService {

    private _mediaStationRepository:MediaStationRepository;
    private _folderManager:FolderManager;

    constructor(mediaStationRepository: MediaStationRepository, folderManager: FolderManager = new FolderManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._folderManager = folderManager;
    }

    createFolder(mediaStationId: number, parentFolderId: number, name: string): number {
        let folder: Folder;
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        folder = this._folderManager.createFolder(mediaStation, name, parentFolderId);

        this._mediaStationRepository.updateMediaStation(mediaStation);

        return folder.id;
    }

    changeName(mediaStationId: number, folderId: number, name: string): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);

        this._folderManager.changeName(mediaStation, folderId, name);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    getIdOfParentFolder(mediaStationId:number, folderId:number):number{
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let folder:Folder = this._folderManager.getFolder(mediaStation, folderId);

        if(!folder)
            throw new Error("Folder with this ID does not exist: " + folderId);

        if(!folder.parentFolder)
            throw new Error("Folder with this ID does not have a parent-folder: " + folderId);

        return folder.parentFolder.id;
    }

    /**
     * returns the direct subfolders of the passed folder-id
     *
     * @param {number} mediaStationId
     * @param {number} folderId
     * @returns {Map<number, string>}
     */
    getAllSubFoldersInFolder(mediaStationId:number, folderId:number):Map<number, string> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let folder:Folder = this._findFolder(mediaStation.rootFolder, folderId);
        let allSubFolders:Map<number, Folder> = folder.getAllSubFolders();
        let returnMap:Map<number, string> = new Map();

        allSubFolders.forEach((content, key) =>{
            returnMap.set(key, content.name );
        });

        return returnMap;
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