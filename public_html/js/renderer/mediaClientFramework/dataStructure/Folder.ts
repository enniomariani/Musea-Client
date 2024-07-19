import { Content } from "./Content";


export class Folder{
    
    private _id:number;
    private _name:string;
    private _parentFolder:Folder;
    private _subFolders:Folder[] = [];
    private _contents:Content[] = [];

    constructor(id:number) {
        this._id = id;
    }

    addContent(content:Content){
        this._contents.push(content);
    }

    removeContent(contentId: number): boolean {
        const contentIndex = this._contents.findIndex(content => content.id === contentId);

        if (contentIndex !== -1) {
            this._contents.splice(contentIndex, 1);
            return true;
        }
        return false;
    }

    containsContent(content: Content): boolean {
        return this._contents.includes(content);
    }

    addSubFolder(subFolder: Folder): void {
        this._subFolders.push(subFolder);
    }

    containsSubFolder(subFolder: Folder): boolean {
        return this._subFolders.includes(subFolder);
    }

    findFolder(id:number):Folder| null{
        if (this._id === id)
            return this;

        for (const subFolder of this._subFolders) {
            const foundFolder:Folder = subFolder.findFolder(id);
            if (foundFolder)
                return foundFolder;
        }
        return null;
    }

    findContent(contentId: number): Content | null {
        // Check if the content is in the current folder
        const foundContent = this._contents.find(content => content.id === contentId);
        if (foundContent)
            return foundContent;

        // Recursively search in subfolders
        for (const subFolder of this._subFolders) {
            const foundInSubFolder = subFolder.findContent(contentId);
            if (foundInSubFolder)
                return foundInSubFolder;
        }

        // Content not found
        return null;
    }

    findContentByNameParts(name:string):Content[]|null{
        return null;
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

    get parentFolder(): Folder {
        return this._parentFolder;
    }

    set parentFolder(value: Folder) {
        this._parentFolder = value;
    }

    get subFolders(): Folder[] {
        return this._subFolders;
    }
}