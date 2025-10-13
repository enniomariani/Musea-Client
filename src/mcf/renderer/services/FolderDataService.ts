import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Folder} from "../dataStructure/Folder";
import {Content} from "../dataStructure/Content";
import {FolderManager} from "../dataManagers/FolderManager";
import {ContentDataService} from "renderer/services/ContentDataService";


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
     * Create a new Folder and add it to the parentFolder
     *
     * @returns {number} The ID of the new Folder
     */
    createFolder(mediaStationId: number, parentFolderId: number, name: string): number {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const folder:Folder = this._folderManager.createFolder(mediaStation, name, parentFolderId);
        return folder.id;
    }

    /**
     * Get the name of the folder
     */
    getName(mediaStationId: number, id: number): string {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const folder: Folder = this._folderManager.requireFolder(mediaStation, id);
        return folder.name;
    }

    /**
     * Change the name of the folder with the passed id
     */
    changeName(mediaStationId: number, folderId: number, name: string): void {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        this._folderManager.changeName(mediaStation, folderId, name);
    }

    /**
     * Change the parentFolder of the folder with the passed id
     * @throws {Error} If the new parent-folder doesn't exist
     */
    changeParentFolder(mediaStationId:number, folderId:number, newParentId:number):void{
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        this._folderManager.changeParentFolder(mediaStation, folderId, newParentId);
    }

    /**
     * Return the parentFolder-id of the folder with the passed id
     * @throws {Error} If folder has no parent-folder
     */
    getIdOfParentFolder(mediaStationId: number, folderId: number): number {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const folder: Folder = this._folderManager.requireFolder(mediaStation, folderId);

        if (!folder.parentFolder)
            throw new Error("Folder with this ID does not have a parent-folder: " + folderId);

        return folder.parentFolder.id;
    }

    /**
     * Get the ids(key) and names (values) of the direct subfolders (folders inside subfolder not included)
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

    /**
     * Get the ids(key) and names (values) of the direct contents (contents in sub-folders not included)
     */
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
     * Delete the folder, all sub-folders, all contents and all media in it
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
     * Get all contents in the folder and its subfolder which have the namePart in their name (regardless of the position)
     * The search is case-insensitive
     *
     * @return {Map<number, string>} the ids(key) and names (values) of the contents
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