import {Content} from "../dataStructure/Content.js";
import {Folder} from "../dataStructure/Folder.js";
import {MediaStation} from "../dataStructure/MediaStation.js";

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

        folder = mediaStation.rootFolder.requireFolder(folderId);
        folder.addContent(newContent);

        return newContent;
    }

    getContent(mediaStation:MediaStation,id:number):Content | null{
        return mediaStation.rootFolder.findContent(id);
    }

    /**
     * Returns the Content or throws if it does not exist.
     */
    requireContent(mediaStation:MediaStation, id:number):Content {
        const content:Content | null = mediaStation.rootFolder.findContent(id);

        if (!content)
            throw new Error("Content with this ID does not exist: " + id);

        return content;
    }

    changeName(mediaStation:MediaStation,id:number, name:string):void{
        const content:Content = this.requireContent(mediaStation, id);
        content.name = name;
    }

    changeFolder(mediaStation:MediaStation, contentId:number, newFolderId:number):void{
        const content:Content = this.requireContent(mediaStation, contentId);
        const newFolder:Folder = mediaStation.rootFolder.requireFolder(newFolderId);
        let oldFolder:Folder;

        oldFolder = mediaStation.rootFolder.requireFolder(content.folderId);

        oldFolder.removeContent(contentId);
        newFolder.addContent(content);

        content.folderId = newFolderId;
    }

    changeLightIntensity(mediaStation:MediaStation, id:number, intensity:number):void{
        const content:Content = this.requireContent(mediaStation, id);
        content.lightIntensity = intensity;
    }

    deleteContent(mediaStation:MediaStation,folderId:number, id:number):void{
        let folder:Folder = mediaStation.rootFolder.requireFolder(folderId);

        if(!folder.removeContent(id))
            throw new Error("Content with ID: " + id + " is not inside folder: "+ folderId);
    }
}