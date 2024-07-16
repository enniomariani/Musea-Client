import { Content } from "./Content";


export class Folder{
    
    private _id:number;
    private _name:string;
    private _parentFolder:Folder;
    private _subFolders:Folder[] = [];
    private _contents:Content[] = [];

    constructor() {}

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

    get parentFolder(): Folder {
        return this._parentFolder;
    }

    set parentFolder(value: Folder) {
        this._parentFolder = value;
    }

    get subFolders(): Folder[] {
        return this._subFolders;
    }

    set subFolders(value: Folder[]) {
        this._subFolders = value;
    }

    get contents(): Content[] {
        return this._contents;
    }

    set contents(value: Content[]) {
        this._contents = value;
    }


}