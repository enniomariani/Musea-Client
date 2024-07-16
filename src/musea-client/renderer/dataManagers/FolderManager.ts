import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {Folder} from "renderer/dataStructure/Folder.js";

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

        parentFolder = mediaStation.rootFolder.requireFolder(parentFolderId);

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
        return mediaStation.rootFolder.requireFolder(id);
    }

    changeName(mediaStation:MediaStation,id:number, name:string):void{
        const folder:Folder = this.requireFolder(mediaStation, id);
        folder.name = name;
    }

    changeParentFolder(mediaStation:MediaStation, folderId:number, newParentId:number):void{
        const folder:Folder = this.requireFolder(mediaStation, folderId);
        const newParentFolder:Folder = this.requireFolder(mediaStation, newParentId);

        folder.parentFolder?.removeSubFolder(folderId);
        newParentFolder.addSubFolder(folder);
        folder.parentFolder = newParentFolder;
    }

    deleteFolder(mediaStation:MediaStation, id:number, parentFolderId:number):void{
        let parentFolder:Folder = mediaStation.rootFolder.requireFolder(parentFolderId);

        if(!parentFolder.removeSubFolder(id))
            throw new Error("Folder with ID: " + id + " is not inside folder: "+ parentFolderId);
    }
}