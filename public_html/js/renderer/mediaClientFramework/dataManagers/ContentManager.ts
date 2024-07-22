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
        let newContent:Content = new Content(mediaStation.getNextContentId());
        newContent.name = name;

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

    deleteContent(mediaStation:MediaStation,id:number, folderId:number):void{
        let folder:Folder = mediaStation.rootFolder.findFolder(folderId);

        if(!folder)
            throw new Error("Folder with ID does not exist: "+ folderId);

        folder.removeContent(id);
    }
}