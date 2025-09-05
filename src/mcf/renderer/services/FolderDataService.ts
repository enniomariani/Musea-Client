import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Folder} from "../dataStructure/Folder";
import {Content} from "../dataStructure/Content";
import {FolderManager} from "../dataManagers/FolderManager";
import {ContentDataService} from "src/mcf/renderer/services/ContentDataService";


export class FolderDataService {

    private _mediaStationRepository: MediaStationRepository;
    private _folderManager: FolderManager;
    private _contentService: ContentDataService;

    constructor(mediaStationRepository: MediaStationRepository, contentService: ContentDataService, folderManager: FolderManager = new FolderManager()) {
        this._mediaStationRepository = mediaStationRepository;
        this._contentService = contentService;
        this._folderManager = folderManager;
    }

    createFolder(mediaStationId: number, parentFolderId: number, name: string): number {
        let folder: Folder;
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        folder = this._folderManager.createFolder(mediaStation, name, parentFolderId);

        this._mediaStationRepository.updateMediaStation(mediaStation);

        return folder.id;
    }

    getName(mediaStationId: number, id: number): string {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let folder: Folder = this._folderManager.getFolder(mediaStation, id);

        if (!folder)
            throw new Error("Folder with this ID does not exist: " + id);

        return folder.name;
    }

    changeName(mediaStationId: number, folderId: number, name: string): void {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        this._folderManager.changeName(mediaStation, folderId, name);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    changeParentFolder(mediaStationId:number, folderId:number, newParentId:number):void{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        this._folderManager.changeParentFolder(mediaStation, folderId, newParentId);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    getIdOfParentFolder(mediaStationId: number, folderId: number): number {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let folder: Folder = this._folderManager.getFolder(mediaStation, folderId);

        if (!folder)
            throw new Error("Folder with this ID does not exist: " + folderId);

        if (!folder.parentFolder)
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
    getAllSubFoldersInFolder(mediaStationId: number, folderId: number): Map<number, string> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let folder: Folder = this._findFolder(mediaStation.rootFolder, folderId);
        let allSubFolders: Map<number, Folder> = folder.getAllSubFolders();
        let returnMap: Map<number, string> = new Map();

        allSubFolders.forEach((content, key) => {
            returnMap.set(key, content.name);
        });

        return returnMap;
    }

    getAllContentsInFolder(mediaStationId: number, folderId: number): Map<number, string> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let folder: Folder = this._findFolder(mediaStation.rootFolder, folderId);
        let allContents: Map<number, Content> = folder.getAllContents();
        let returnMap: Map<number, string> = new Map();

        allContents.forEach((content, key) => {
            returnMap.set(key, content.name);
        });

        return returnMap;
    }

    /**
     * deletes the folder, all sub-folders, all contents and all media in it
     *
     * @param {number} mediaStationId
     * @param {number} folderId
     * @returns {Promise<void>}
     */
    async deleteFolder(mediaStationId: number, folderId: number): Promise<void> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let folder: Folder = this._folderManager.getFolder(mediaStation, folderId);

        if (!folder)
            throw new Error("Folder with this ID does not exist: " + folderId);

        let allContentIds: Map<number, number[]> = folder.getAllContentIDsInFolderAndSubFolders();

        for (const [folderId, contentIds] of allContentIds)
            for (const contentId of contentIds)
                await this._contentService.deleteContent(mediaStationId, folderId, contentId)

        this._folderManager.deleteFolder(mediaStation, folderId, folder.parentFolder.id);

        this._mediaStationRepository.updateMediaStation(mediaStation);
    }

    /**
     * returns all contents in the folder and its subfolder which have the namePart in their name (regardless of the position)
     *
     * the search is case-insensitive at the moment
     *
     * @param {number} mediaStationId
     * @param {number} folderId
     * @param {string} namePart
     * @returns {Map<number, string>}
     */
    findContentsByNamePart(mediaStationId: number, folderId: number, namePart: string): Map<number, string> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let folder: Folder = this._findFolder(mediaStation.rootFolder, folderId);
        let allContents: Content[] = folder.findContentsByNamePart(namePart);
        let returnMap: Map<number, string> = new Map();

        for(let i:number = 0; i < allContents.length; i++)
            returnMap.set(allContents[i].id, allContents[i].name);

        return returnMap;
    }

    private _findFolder(rootFolder: Folder, id: number): Folder {
        let folder: Folder = rootFolder.findFolder(id);

        if (!folder)
            throw new Error("Folder with this ID does not exist: " + id);
        else
            return folder;
    }
}