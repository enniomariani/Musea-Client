import {MediaApp} from "./MediaApp";
import {Folder} from "./Folder";
import {Tag} from "./Tag";


export class MediaStation{
    private _id:number;
    private _name:string;
    private _mediaApps:MediaApp[] = [];
    private _rootFolder:Folder;

    private _folderIdCounter:number = 0;
    private _contentIdCounter:number = 0;
    private _mediaAppIdCounter:number = 0;
    private _tagIdCounter:number = 0;

    private _tags:Tag[];

    constructor(id:number) {
        this._id = id;
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

    get mediaApps(): MediaApp[] {
        return this._mediaApps;
    }

    set mediaApps(value: MediaApp[]) {
        this._mediaApps = value;
    }
}