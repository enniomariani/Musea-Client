import {MediaStation} from "../dataStructure/MediaStation";
import {Folder} from "../dataStructure/Folder";

export class FolderManager{
    constructor(){}

    /**
     * creates a Folder-object and adds it to the paremnt-folder with the passed ID in the mediaStation
     *
     * throws an error if the parent-folder does not exist
     *
     * @param {MediaStation} mediaStation
     * @param {string} name
     * @param {number} parentFolderId
     * @returns {Folder}
     */
    createFolder(mediaStation:MediaStation, name:string, parentFolderId:number):Folder{
        let parentFolder:Folder;
        let newFolder:Folder = new Folder(mediaStation.getNextFolderId());
        newFolder.name = name;

        parentFolder = mediaStation.rootFolder.findFolder(parentFolderId);

        if(!parentFolder)
            throw new Error("Folder with ID could not be found: "+ parentFolderId);

        parentFolder.addSubFolder(newFolder);
        newFolder.parentFolder = parentFolder;

        return newFolder;
    }

    getFolder(mediaStation:MediaStation,id:number):Folder | null{
        return mediaStation.rootFolder.findFolder(id);
    }

    /**
     * Returns the Folder or throws if it does not exist.
     */
    requireFolder(mediaStation:MediaStation, id:number):Folder {
        const folder:Folder | null = mediaStation.rootFolder.findFolder(id);

        if (!folder)
            throw new Error("Folder with this ID does not exist: " + id);

        return folder;
    }

    changeName(mediaStation:MediaStation,id:number, name:string):void{
        let folder:Folder = this.getFolder(mediaStation, id);

        if(!folder)
            throw new Error("Folder with ID does not exist: "+ id);

        folder.name = name;
    }

    changeParentFolder(mediaStation:MediaStation, folderId:number, newParentId:number):void{
        let folder:Folder = this.getFolder(mediaStation, folderId);
        let newParentFolder:Folder = this.getFolder(mediaStation, newParentId);

        if(!folder)
            throw new Error("Folder with ID does not exist: "+ folderId);

        if(!newParentFolder)
            throw new Error("Parent-Folder with ID does not exist: "+ newParentId);

        folder.parentFolder.removeSubFolder(folderId);
        newParentFolder.addSubFolder(folder);
        folder.parentFolder = newParentFolder;
    }

    deleteFolder(mediaStation:MediaStation, id:number, parentFolderId:number):void{
        let parentFolder:Folder = mediaStation.rootFolder.findFolder(parentFolderId);

        if(!parentFolder)
            throw new Error("Parent-Folder with ID does not exist: "+ parentFolderId);

        if(!parentFolder.removeSubFolder(id))
            throw new Error("Folder with ID: " + id + " is not inside folder: "+ parentFolderId);
    }
}