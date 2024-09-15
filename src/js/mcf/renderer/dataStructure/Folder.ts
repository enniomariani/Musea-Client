import {Content} from "./Content";


export class Folder {

    private _id: number;
    private _name: string;
    private _parentFolder: Folder;
    private _subFolders: Folder[] = [];
    private _contents: Content[] = [];

    constructor(id: number, private _createContent: (id: number, folderId:number) => Content = (id, folderId) => new Content(id, folderId)) {
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
                console.log("FOUND SUB-FOLDER: ", json.subFolders[i]);

                if (this._jsonPropertyExists(json.subFolders[i], "id"))
                    subFolder = new Folder(json.subFolders[i].id);

                this.addSubFolder(subFolder);
                subFolder.parentFolder = this;

                subFolder.importFromJSON(json.subFolders[i]);
            }
        }

        if (this._jsonPropertyExists(json, "contents")) {
            for (let i: number = 0; i < json.contents.length; i++) {
                console.log("FOUND CONTENTS: ", json.contents[i]);

                if (this._jsonPropertyExists(json.contents[i], "id"))
                    content = this._createContent(json.contents[i].id, this._id);

                content.importFromJSON(json.contents[i]);

                this.addContent(content);
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

    addContent(content: Content) {
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
     *
     * @param {number} id
     * @returns {Folder | null}
     */
    findFolder(id: number): Folder | null {
        if (this._id === id)
            return this;

        for (const subFolder of this._subFolders) {
            const foundFolder: Folder = subFolder.findFolder(id);
            if (foundFolder)
                return foundFolder;
        }
        return null;
    }

    /**
     * looks for the content in this folder and in all sub-folders
     *
     * @param {number} contentId
     * @returns {Content | null}
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

    getAllContentIDsInFolderAndSubFolders(): Map<number, number[]> {
        let allContents: Map<number, number[]> = new Map();
        let contentsOfThisFolder: number[] = [];
        let content: Content;
        let folder: Folder;

        console.log("GET ALL CONTENTS OF FOLDER (and its subfolders): ", this._id)

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
     * @param {string} namePart
     * @returns {Content[]}
     */
    findContentsByNamePart(namePart: string): Content[] {
        let allContentIds:Map<number, number[]> = this.getAllContentIDsInFolderAndSubFolders();
        let results:Content[] = [];
        let content:Content;

        for (const [folderId, contentIds] of allContentIds){
            for (const contentId of contentIds){
                content = this.findContent(contentId);

                console.log("found content: ", content)

                if(!content)
                    throw new Error("Content with this ID could not be found: " + contentId);

                console.log("search content for name-part: ", content.name, namePart,content.name.includes(namePart) );

                if(content.name.includes(namePart))
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

    get parentFolder(): Folder {
        return this._parentFolder;
    }

    set parentFolder(value: Folder) {
        this._parentFolder = value;
    }

    get subFolders(): Folder[] {
        return this._subFolders;
    }

    get contents(): Content[] {
        return this._contents;
    }
}