import {IMedia} from "./Media";


export class Content{

    private _id:number;
    private _name:string;
    private _media:IMedia[];
    private _tagIds:number[];

    constructor() {}

    getMaxDuration():number {

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