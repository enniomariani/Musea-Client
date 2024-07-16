import {IMedia, Video} from "./Media";


export class Content{

    private _id:number;
    private _name:string;
    private _media:IMedia[] = [];
    private _tagIds:number[] = [];

    constructor() {}

    getMaxDuration():number {
        let i:number;
        let highestDuration:number = 0;
        let video:Video;

        for(i = 0; i < this._media.length; i++){

            if(this._media[i] instanceof Video){
                video = this._media[i] as Video;

                if(video.duration > highestDuration)
                    highestDuration = video.duration;
            }
        }

        return highestDuration;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get media(): IMedia[] {
        return this._media;
    }

    set media(value: IMedia[]) {
        this._media = value;
    }

    get tagIds(): number[] {
        return this._tagIds;
    }

    set tagIds(value: number[]) {
        this._tagIds = value;
    }
}