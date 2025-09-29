import {Image, IMedia, Video} from "./Media";

export class Content {
    private _id: number;
    private _name: string = "";
    private _media: Map<number, IMedia> = new Map();
    private _tagIds: number[] = [];
    private _lightIntensity: number = -1;

    private _folderId:number;

    constructor(id: number, idFolder:number) {
        this._id = id;
        this._folderId = idFolder;
    }

    importFromJSON(json: any): void {
        let media: IMedia | null = null;

        if (this._jsonPropertyExists(json, "id"))
            this._id = json.id;

        if (this._jsonPropertyExists(json, "name"))
            this._name = json.name;

        if (this._jsonPropertyExists(json, "lightIntensity"))
            this._lightIntensity = json.lightIntensity;

        if(this._jsonPropertyExists(json, "tagIds"))
            this._tagIds = json.tagIds;

        if (this._jsonPropertyExists(json, "media")) {
            for (let i: number = 0; i < json.media.length; i++) {

                if (this._jsonPropertyExists(json.media[i], "type")) {
                    switch (json.media[i].type) {
                        case    "video":
                            let video:Video = new Video();
                            if (this._jsonPropertyExists(json.media[i], "duration"))
                                video.duration = json.media[i].duration;
                            media = video;
                            break;
                        case    "image":
                            media = new Image();
                            break;
                        default:
                            media = null;
                    }
                }

                if(media){
                    if (this._jsonPropertyExists(json.media[i], "idOnMediaApp"))
                        media.idOnMediaApp = json.media[i].idOnMediaApp;

                    if (this._jsonPropertyExists(json.media[i], "mediaAppId"))
                        media.mediaAppId = json.media[i].mediaAppId;

                    if (this._jsonPropertyExists(json.media[i], "fileName"))
                        media.fileName = json.media[i].fileName;

                    this._media.set(media.mediaAppId, media);
                }
            }
        }
    }

    private _jsonPropertyExists(json: any, propName: string): boolean {
        if(json.hasOwnProperty(propName))
            return true;
        else
            throw new Error("Content: missing property in JSON: " + propName);
    }

    exportToJSON(): any {
        let allMedia: any[] = [];
        let image: Image;
        let video: Video;

        this._media.forEach((media: IMedia) => {
            if (media instanceof Image) {
                image = media;
                allMedia.push({mediaAppId: image.mediaAppId, type: "image",
                    idOnMediaApp: image.idOnMediaApp, fileName: image.fileName});
            } else if (media instanceof Video) {
                video = media;
                allMedia.push({
                    mediaAppId: video.mediaAppId,
                    type: "video",
                    idOnMediaApp: video.idOnMediaApp,
                    duration: video.duration,
                    fileName: video.fileName
                });
            }
        });

        return {
            id: this._id,
            name: this._name,
            lightIntensity: this._lightIntensity,
            tagIds: this._tagIds,
            media: allMedia
        };
    }

    /**
     * returns the duration of the longest video in the content (0 if there are no videos)
     *
     * @returns {number}
     */
    getMaxDuration(): number {
        let highestDuration: number = 0;
        let video: Video;

        this._media.forEach((media:IMedia)=>{
            if (media instanceof Video) {
                video = media as Video;

                if (video.duration > highestDuration)
                    highestDuration = video.duration;
            }
        });

        return highestDuration;
    }

    /**
     * Returns the Media or throws if it does not exist.
     */
    requireMedia(mediaAppId:number):IMedia {
        const media:IMedia | undefined = this._media.get(mediaAppId);

        if (!media)
            throw new Error("Media with mediaApp-ID " + mediaAppId + " does not exist in Content: " + this._id);

        return media;
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get media(): Map<number, IMedia> {
        return this._media;
    }

    get tagIds(): number[] {
        return this._tagIds;
    }

    set tagIds(value: number[]) {
        this._tagIds = value;
    }

    get lightIntensity(): number {
        return this._lightIntensity;
    }

    set lightIntensity(value: number) {
        this._lightIntensity = value;
    }

    get folderId(): number {
        return this._folderId;
    }

    set folderId(value: number) {
        this._folderId = value;
    }
}