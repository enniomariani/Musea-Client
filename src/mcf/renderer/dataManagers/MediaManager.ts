import {MediaStation} from "../dataStructure/MediaStation";
import {Image, IMedia, Video} from "../dataStructure/Media";
import {Content} from "../dataStructure/Content";

export const MediaType = {
    VIDEO: "video",
    IMAGE: "image",
} as const;

export type MediaType = typeof MediaType[keyof typeof MediaType];

export class MediaManager{

    constructor(){}

    /**
     * Create an Image-Object, add it to the media-array of the content and return the object
     * Throw an error if contentId can not be found in the mediaStation-folders
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
     * Create a Video-Object, add it to the media-array of the content and return the object
     * Throw an error if contentId can not be found in the mediaStation-folders
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
     * Return the media-type or null if there is not a media set for the mediaAppId
     * Throw an error if contentId can not be found in the mediaStation-folders
     */
    getMediaType(mediaStation:MediaStation, contentId:number, mediaAppId:number):MediaType|null{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);

        if(content.media.get(mediaAppId) instanceof Image)
            return MediaType.IMAGE;
        else if(content.media.get(mediaAppId) instanceof Video)
            return MediaType.VIDEO;
        else
            return null;
    }

    getFileName(mediaStation:MediaStation, contentId:number, mediaAppId:number):string|null{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);
        const media:IMedia | null = content.getMedia(mediaAppId);

        if(media)
            return media.fileName;
        else
            return null;
    }

    getIdOnMediaApp(mediaStation:MediaStation, contentId:number, mediaAppId:number):number{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);
        const media:IMedia = content.requireMedia(mediaAppId);
        return media.idOnMediaApp;
    }

    deleteMedia(mediaStation:MediaStation, contentId:number, mediaAppId:number):void{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);
        content.media.delete(mediaAppId);
    }
}