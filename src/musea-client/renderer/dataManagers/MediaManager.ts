import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {Image, IMedia, SubtitleInternal, Video} from "renderer/dataStructure/Media.js";
import {Content} from "renderer/dataStructure/Content.js";

export const MediaType = {
    VIDEO: "video",
    IMAGE: "image",
} as const;

export interface PlayerRef {            // internal, not exported from index.ts
    readonly mediaStation: MediaStation;
    readonly contentId: number;
    readonly mediaPlayerId: number;
}

export type MediaType = typeof MediaType[keyof typeof MediaType];

export class MediaManager{

    constructor(){}

    /**
     * Create an Image-Object, add it to the media-array of the content and return the object
     * Throw an error if contentId can not be found in the mediaStation-folders
     */
    createImage(playerRef:PlayerRef, fileName:string):Image{
        const content:Content = playerRef.mediaStation.rootFolder.requireContent(playerRef.contentId);
        let newImage:Image = new Image();

        newImage.idOnMediaPlayer = -1;
        newImage.mediaPlayerId = playerRef.mediaPlayerId;
        newImage.fileName = fileName;

        content.media.set(playerRef.mediaPlayerId, newImage);

        return newImage;
    }

    /**
     * Create a Video-Object, add it to the media-array of the content and return the object
     * Throw an error if contentId can not be found in the mediaStation-folders
     */
    createVideo(playerRef:PlayerRef, duration:number, fileName:string, subtitles:SubtitleInternal[]):Video{
        const content:Content = playerRef.mediaStation.rootFolder.requireContent(playerRef.contentId);
        let newVideo:Video = new Video();

        newVideo.idOnMediaPlayer = -1;
        newVideo.mediaPlayerId = playerRef.mediaPlayerId;
        newVideo.duration = duration;
        newVideo.subtitles = subtitles;
        newVideo.fileName = fileName;

        content.media.set(playerRef.mediaPlayerId, newVideo);

        return newVideo;
    }

    /**
     * Return the media-type or null if there is not a media set for the mediaPlayerId
     * Throw an error if contentId can not be found in the mediaStation-folders
     */
    getMediaType(playerRef:PlayerRef):MediaType|null{
        const content:Content = playerRef.mediaStation.rootFolder.requireContent(playerRef.contentId);

        if(content.media.get(playerRef.mediaPlayerId) instanceof Image)
            return MediaType.IMAGE;
        else if(content.media.get(playerRef.mediaPlayerId) instanceof Video)
            return MediaType.VIDEO;
        else
            return null;
    }

    getFileName(playerRef:PlayerRef):string|null{
        const content:Content = playerRef.mediaStation.rootFolder.requireContent(playerRef.contentId);
        const media:IMedia | null = content.getMedia(playerRef.mediaPlayerId);

        if(media)
            return media.fileName;
        else
            return null;
    }

    getIdOnMediaPlayer(playerRef:PlayerRef):number{
        const content:Content = playerRef.mediaStation.rootFolder.requireContent(playerRef.contentId);
        const media:IMedia = content.requireMedia(playerRef.mediaPlayerId);
        return media.idOnMediaPlayer;
    }

    deleteMedia(playerRef:PlayerRef):void{
        const content:Content = playerRef.mediaStation.rootFolder.requireContent(playerRef.contentId);
        content.media.delete(playerRef.mediaPlayerId);
    }
}