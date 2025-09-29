import {MediaStation} from "../dataStructure/MediaStation";
import {Image, IMedia, Video} from "../dataStructure/Media";
import {Content} from "../dataStructure/Content";

export class MediaManager{

    static MEDIA_TYPE_VIDEO:string = "TYPE_VIDEO";
    static MEDIA_TYPE_IMAGE:string = "TYPE_IMAGE";

    constructor(){}

    /**
     * creates an Image-Object, adds it to the media-array of the content and returns the object
     *
     * throws an error if contentId can not be found in the mediaStation-folders
     *
     * @param {MediaStation} mediaStation
     * @param {number} contentId
     * @param {number} mediaAppId
     * @param {string} fileName
     * @returns {Image}
     */
    createImage(mediaStation:MediaStation, contentId:number, mediaAppId:number, fileName:string):Image{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);
        let newImage:Image = new Image();

        newImage.idOnMediaApp = -1;
        newImage.mediaAppId = mediaAppId;
        newImage.fileName = fileName;

        content.media.set(mediaAppId, newImage);

        return newImage;
    }

    /**
     * creates an Video-Object, adds it to the media-array of the content and returns the object
     *
     * throws an error if contentId can not be found in the mediaStation-folders
     *
     * @param {MediaStation} mediaStation
     * @param {number} contentId
     * @param {number} mediaAppId
     * @param {number} duration
     * @param {string} fileName
     * @returns {Video}
     */
    createVideo(mediaStation:MediaStation, contentId:number, mediaAppId:number, duration:number, fileName:string):Video{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);
        let newVideo:Video = new Video();

        newVideo.idOnMediaApp = -1;
        newVideo.mediaAppId = mediaAppId;
        newVideo.duration = duration;
        newVideo.fileName = fileName;

        content.media.set(mediaAppId, newVideo);

        return newVideo;
    }

    /**
     * returns one of the static MEDIA_TYPE strings of this class and null if there is not a media set for the mediaAppId
     *
     * throws an error if contentId can not be found in the mediaStation-folders
     *
     * @param {MediaStation} mediaStation
     * @param {number} contentId
     * @param {number} mediaAppId
     * @returns {string | null}
     */
    getMediaType(mediaStation:MediaStation, contentId:number, mediaAppId:number):string|null{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);

        if(content.media.get(mediaAppId) instanceof Image)
            return MediaManager.MEDIA_TYPE_IMAGE;
        else if(content.media.get(mediaAppId) instanceof Video)
            return MediaManager.MEDIA_TYPE_VIDEO;
        else
            return null;
    }

    getFileName(mediaStation:MediaStation, contentId:number, mediaAppId:number):string|null{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);

        if(content.media.get(mediaAppId) !== null && content.media.get(mediaAppId) !== undefined)
            return content.media.get(mediaAppId).fileName;
        else
            return null;
    }

    getIdOnMediaApp(mediaStation:MediaStation, contentId:number, mediaAppId:number):number{
        const content:Content | null = mediaStation.rootFolder.requireContent(contentId);
        let media:IMedia;

        media = content.media.get(mediaAppId);

        return media.idOnMediaApp;
    }

    deleteMedia(mediaStation:MediaStation, contentId:number, mediaAppId:number):void{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);
        content.media.delete(mediaAppId);
    }
}