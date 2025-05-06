import {MediaStation} from "../dataStructure/MediaStation";
import {Content} from "../dataStructure/Content";
import {Folder} from "../dataStructure/Folder";

export class ContentManager{
    constructor(){}

    /**
     * creates a Content-object and adds it to the folder with the passed ID in the mediaStation
     *
     * throws an error if the folder does not exist
     *
     * @param {MediaStation} mediaStation
     * @param {string} name
     * @param {number} folderId
     * @returns {Content}
     */
    createContent(mediaStation:MediaStation, name:string, folderId:number):Content{
        let folder:Folder;
        let newContent:Content = new Content(mediaStation.getNextContentId(), folderId);
        newContent.name = name;
        newContent.lightIntensity = 0;

        folder = mediaStation.rootFolder.findFolder(folderId);

        if(!folder)
            throw new Error("Folder with ID could not be found: "+ folderId);

        folder.addContent(newContent);

        return newContent;
    }

    getContent(mediaStation:MediaStation,id:number):Content | null{
        return mediaStation.rootFolder.findContent(id);
    }

    changeName(mediaStation:MediaStation,id:number, name:string):void{
        let content:Content = this.getContent(mediaStation, id);

        if(!content)
            throw new Error("Content with ID does not exist: "+ id);

        content.name = name;
    }

    changeFolder(mediaStation:MediaStation, contentId:number, newFolderId:number):void{
        let content:Content = this.getContent(mediaStation, contentId);
        let oldFolder:Folder;
        let newFolder:Folder = mediaStation.rootFolder.findFolder(newFolderId);

        if(!content)
            throw new Error("Content with ID does not exist: "+ contentId);

        if(!newFolder)
            throw new Error("Folder with ID does not exist: "+ newFolderId);

        oldFolder = mediaStation.rootFolder.findFolder(content.folderId);

        oldFolder.removeContent(contentId);
        newFolder.addContent(content);
    }

    changeLightIntensity(mediaStation:MediaStation, id:number, intensity:number):void{
        let content:Content = this.getContent(mediaStation, id);

        if(!content)
            throw new Error("Content with ID does not exist: "+ id);

        content.lightIntensity = intensity;
    }


    deleteContent(mediaStation:MediaStation,folderId:number, id:number):void{
        let folder:Folder = mediaStation.rootFolder.findFolder(folderId);

        if(!folder)
            throw new Error("Folder with ID does not exist: "+ folderId);

        if(!folder.removeContent(id))
            throw new Error("Content with ID: " + id + " is not inside folder: "+ folderId);
    }
}