import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {Image, IMedia, Video} from "renderer/dataStructure/Media.js";
import {Content} from "renderer/dataStructure/Content.js";

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
    createImage(mediaStation:MediaStation, contentId:number, mediaPlayerId:number, fileName:string):Image{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);
        let newImage:Image = new Image();

        newImage.idOnMediaPlayer = -1;
        newImage.mediaPlayerId = mediaPlayerId;
        newImage.fileName = fileName;

        content.media.set(mediaPlayerId, newImage);

        return newImage;
    }

    /**
     * Create a Video-Object, add it to the media-array of the content and return the object
     * Throw an error if contentId can not be found in the mediaStation-folders
     */
    createVideo(mediaStation:MediaStation, contentId:number, mediaPlayerId:number, duration:number, fileName:string):Video{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);
        let newVideo:Video = new Video();

        newVideo.idOnMediaPlayer = -1;
        newVideo.mediaPlayerId = mediaPlayerId;
        newVideo.duration = duration;
        newVideo.fileName = fileName;

        content.media.set(mediaPlayerId, newVideo);

        return newVideo;
    }

    /**
     * Return the media-type or null if there is not a media set for the mediaPlayerId
     * Throw an error if contentId can not be found in the mediaStation-folders
     */
    getMediaType(mediaStation:MediaStation, contentId:number, mediaPlayerId:number):MediaType|null{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);

        if(content.media.get(mediaPlayerId) instanceof Image)
            return MediaType.IMAGE;
        else if(content.media.get(mediaPlayerId) instanceof Video)
            return MediaType.VIDEO;
        else
            return null;
    }

    getFileName(mediaStation:MediaStation, contentId:number, mediaPlayerId:number):string|null{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);
        const media:IMedia | null = content.getMedia(mediaPlayerId);

        if(media)
            return media.fileName;
        else
            return null;
    }

    getIdOnMediaPlayer(mediaStation:MediaStation, contentId:number, mediaPlayerId:number):number{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);
        const media:IMedia = content.requireMedia(mediaPlayerId);
        return media.idOnMediaPlayer;
    }

    deleteMedia(mediaStation:MediaStation, contentId:number, mediaPlayerId:number):void{
        const content:Content = mediaStation.rootFolder.requireContent(contentId);
        content.media.delete(mediaPlayerId);
    }
}