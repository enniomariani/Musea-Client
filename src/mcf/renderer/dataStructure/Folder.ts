import {Content} from "./Content.js";


export class Folder {

    private _id: number;
    private _name: string = "";
    private _parentFolder: Folder | null = null;
    private _subFolders: Folder[] = [];
    private _contents: Content[] = [];

    constructor(id: number, private _createContent: (id: number, folderId: number) => Content = (id, folderId) => new Content(id, folderId)) {
        this._id = id;
    }

    importFromJSON(json: any, parentFolder: Folder | null = null): void {
        let subFolder: Folder;
        let content: Content;

        if (parentFolder)
            this._parentFolder = parentFolder;

        if (this._jsonPropertyExists(json, "id"))
            this._id = json.id;

        if (this._jsonPropertyExists(json, "name"))
            this._name = json.name;

        if (this._jsonPropertyExists(json, "subFolders")) {
            for (let i: number = 0; i < json.subFolders.length; i++) {
                if (this._jsonPropertyExists(json.subFolders[i], "id")) {
                    subFolder = new Folder(json.subFolders[i].id);
                    this.addSubFolder(subFolder);
                    subFolder.parentFolder = this;
                    subFolder.importFromJSON(json.subFolders[i]);
                }
            }
        }

        if (this._jsonPropertyExists(json, "contents")) {
            for (let i: number = 0; i < json.contents.length; i++) {
                if (this._jsonPropertyExists(json.contents[i], "id")) {
                    content = this._createContent(json.contents[i].id, this._id);
                    content.importFromJSON(json.contents[i]);
                    this.addContent(content);
                }
            }
        }
    }

    private _jsonPropertyExists(json: any, propName: string): boolean {
        if (json.hasOwnProperty(propName))
            return true;
        else
            throw new Error("Folder: missing property in JSON: " + propName);
    }

    exportToJSON(): any {
        let subFolders: any[] = [];
        let contents: any[] = [];

        this._subFolders.forEach((folder: Folder) => {
            subFolders.push(folder.exportToJSON());
        });

        this._contents.forEach((content: Content) => {
            contents.push(content.exportToJSON());
        });

        let json: any = {
            id: this._id,
            name: this._name,
            contents: contents,
            subFolders: subFolders
        };

        return json;
    }

    addContent(content: Content): void {
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

    getAllContents(): Map<number, Content> {
        let map: Map<number, Content> = new Map();

        for (let i: number = 0; i < this._contents.length; i++)
            map.set(this._contents[i].id, this._contents[i]);

        return map;
    }

    containsContent(content: Content): boolean {
        return this._contents.includes(content);
    }

    addSubFolder(subFolder: Folder): void {
        this._subFolders.push(subFolder);
    }

    removeSubFolder(folderId: number): boolean {
        const folderIndex = this._subFolders.findIndex(folder => folder.id === folderId);

        if (folderIndex !== -1) {
            this._subFolders.splice(folderIndex, 1);
            return true;
        }
        return false;
    }

    getAllSubFolders(): Map<number, Folder> {
        let map: Map<number, Folder> = new Map();

        for (let i: number = 0; i < this._subFolders.length; i++)
            map.set(this._subFolders[i].id, this._subFolders[i]);

        return map;
    }

    containsSubFolder(subFolder: Folder): boolean {
        return this._subFolders.includes(subFolder);
    }

    /**
     * looks for the folder in this folder and in all sub-folders
     */
    findFolder(id: number): Folder | null {
        if (this._id === id)
            return this;

        for (const subFolder of this._subFolders) {
            const foundFolder: Folder | null = subFolder.findFolder(id);
            if (foundFolder)
                return foundFolder;
        }
        return null;
    }

    /**
     * looks for the folder in this folder and in all sub-folders, throws an error if not found
     */
    requireFolder(id: number): Folder {
        if (this._id === id)
            return this;

        for (const subFolder of this._subFolders) {
            const foundFolder: Folder | null = subFolder.findFolder(id);
            if (foundFolder)
                return foundFolder;
        }
        throw new Error("Folder with ID " + id + " could not be found as sub-Folder of folder: " + this._id);
    }

    /**
     * looks for the content in this folder and in all sub-folders
     */
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

    /**
     * looks for the folder in this folder and in all sub-folders, throws an error if not found
     */
    requireContent(id: number): Content {
        // Check if the content is in the current folder
        const foundContent: Content | undefined = this._contents.find(content => content.id === id);
        if (foundContent)
            return foundContent;

        // Recursively search in subfolders
        for (const subFolder of this._subFolders) {
            const foundInSubFolder = subFolder.findContent(id);
            if (foundInSubFolder)
                return foundInSubFolder;
        }

        // Content not found
        throw new Error("Content with ID " + id + " could not be found as sub-Folder of folder: " + this._id);
    }

    /**
     * returns a map with the folder-id as key and an array of content-ids of the contents that are directly inside this folder
     *
     * @returns {Map<number, number[]>}
     */
    getAllContentIDsInFolderAndSubFolders(): Map<number, number[]> {
        let allContents: Map<number, number[]> = new Map();
        let contentsOfThisFolder: number[] = [];
        let content: Content;
        let folder: Folder;

        for (folder of this._subFolders)
            allContents = new Map([...allContents, ...folder.getAllContentIDsInFolderAndSubFolders()])

        //add the contents of this folder
        for (content of this._contents)
            contentsOfThisFolder.push(content.id);

        allContents.set(this._id, contentsOfThisFolder);

        return allContents;
    }

    /**
     * looks for contents in this folder and all subfolders which contain the passed string in their name
     *
     * the search is case-insenstive
     *
     * @param {string} namePart
     * @returns {Content[]}
     */
    findContentsByNamePart(namePart: string): Content[] {
        let allContentIds: Map<number, number[]> = this.getAllContentIDsInFolderAndSubFolders();
        let results: Content[] = [];
        let content: Content;
        let namePartLowerCase: string = namePart.toLowerCase();

        for (const [folderId, contentIds] of allContentIds) {
            for (const contentId of contentIds) {
                content = this.requireContent(contentId);

                if (content.name.toLowerCase().includes(namePartLowerCase))
                    results.push(content);
            }
        }

        return results;
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

    get parentFolder(): Folder | null {
        return this._parentFolder;
    }

    set parentFolder(value: Folder | null) {
        this._parentFolder = value;
    }

    get subFolders(): Folder[] {
        return this._subFolders;
    }

    get contents(): Content[] {
        return this._contents;
    }
}