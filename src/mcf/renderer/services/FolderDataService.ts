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

    /**
     * creates a new Folder-object and adds it to the parentFolder
     *
     * throws an error if the mediaStation or the parentFolder does not exist
     *
     * @param {number} mediaStationId
     * @param {number} parentFolderId
     * @param {string} name
     * @returns {number}        returns the ID of the new Folder
     */
    createFolder(mediaStationId: number, parentFolderId: number, name: string): number {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const folder:Folder = this._folderManager.createFolder(mediaStation, name, parentFolderId);
        return folder.id;
    }

    /**
     * returns the name of the folder with the passed id
     * throws an error if the mediaStation or the folder don't exist
     *
     * @param {number} mediaStationId
     * @param {number} id
     * @returns {string}
     */
    getName(mediaStationId: number, id: number): string {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const folder: Folder = this._folderManager.requireFolder(mediaStation, id);
        return folder.name;
    }

    /**
     * changes the name of the folder with the passed id
     * throws an error if the mediaStation or the folder don't exist
     *
     * @param {number} mediaStationId
     * @param {number} folderId
     * @param {string} name
     */
    changeName(mediaStationId: number, folderId: number, name: string): void {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        this._folderManager.changeName(mediaStation, folderId, name);
    }

    /**
     * changes the parentFolder of the folder with the passed id
     * throws an error if the mediaStation, the folder or the new parent-folder don't exist
     '
     * @param {number} mediaStationId
     * @param {number} folderId
     * @param {number} newParentId
     */
    changeParentFolder(mediaStationId:number, folderId:number, newParentId:number):void{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        this._folderManager.changeParentFolder(mediaStation, folderId, newParentId);
    }

    /**
     * returns the parentFolder-id of the folder with the passed id
     * throws an error if the mediaStation or the folder don't exist or if the folder has no parent-folder
     * '
     * @param {number} mediaStationId
     * @param {number} folderId
     * @returns {number}
     */
    getIdOfParentFolder(mediaStationId: number, folderId: number): number {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const folder: Folder = this._folderManager.requireFolder(mediaStation, folderId);

        if (!folder.parentFolder)
            throw new Error("Folder with this ID does not have a parent-folder: " + folderId);

        return folder.parentFolder.id;
    }

    /**
     * returns the names of the direct subfolders of the passed folder-id
     *
     * @param {number} mediaStationId
     * @param {number} folderId
     * @returns {Map<number, string>}
     */
    getAllSubFoldersInFolder(mediaStationId: number, folderId: number): Map<number, string> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const folder: Folder = mediaStation.rootFolder.requireFolder(folderId);
        const allSubFolders: Map<number, Folder> = folder.getAllSubFolders();
        let returnMap: Map<number, string> = new Map();

        allSubFolders.forEach((content, key) => {
            returnMap.set(key, content.name);
        });

        return returnMap;
    }

    getAllContentsInFolder(mediaStationId: number, folderId: number): Map<number, string> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const folder: Folder = mediaStation.rootFolder.requireFolder(folderId);
        const allContents: Map<number, Content> = folder.getAllContents();
        let returnMap: Map<number, string> = new Map();

        allContents.forEach((content, key) => {
            returnMap.set(key, content.name);
        });

        return returnMap;
    }

    /**
     * deletes the folder, all sub-folders, all contents and all media in it
     *
     * throws an error if the mediaStation or the folder doesn't exist'
     *
     * @param {number} mediaStationId
     * @param {number} folderId
     * @returns {Promise<void>}
     */
    async deleteFolder(mediaStationId: number, folderId: number): Promise<void> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const folder: Folder = this._folderManager.requireFolder(mediaStation, folderId);
        const allContentIds: Map<number, number[]> = folder.getAllContentIDsInFolderAndSubFolders();

        for (const [folderId, contentIds] of allContentIds)
            for (const contentId of contentIds)
                await this._contentService.deleteContent(mediaStationId, folderId, contentId)

        this._folderManager.deleteFolder(mediaStation, folderId, this.getIdOfParentFolder(mediaStationId, folderId));
    }

    /**
     * returns all contents in the folder and its subfolder which have the namePart in their name (regardless of the position)
     *
     * the search is case-insensitive at the moment
     *
     */
    findContentsByNamePart(mediaStationId: number, folderId: number, namePart: string): Map<number, string> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const folder: Folder = mediaStation.rootFolder.requireFolder(folderId);
        const allContents: Content[] = folder.findContentsByNamePart(namePart);
        let returnMap: Map<number, string> = new Map();

        for(let i:number = 0; i < allContents.length; i++)
            returnMap.set(allContents[i].id, allContents[i].name);

        return returnMap;
    }
}