import {Folder} from "./Folder";
import {TagRegistry} from "renderer/registries/TagRegistry";
import {Tag} from "renderer/dataStructure/Tag";
import {MediaAppRegistry} from "renderer/registries/MediaAppRegistry";
import {MediaApp} from "renderer/dataStructure/MediaApp";

export class MediaStation {
    private _id: number;
    private _name: string = "";
    private _rootFolder: Folder = new Folder(0);

    private _folderIdCounter: number = -1;
    private _contentIdCounter: number = -1;
    private _mediaAppIdCounter: number = -1;
    private _tagIdCounter: number = -1;

    private _tagRegistry:TagRegistry;
    private _mediaAppRegistry:MediaAppRegistry;

    constructor(id: number, tagRegistry:TagRegistry, mediaAppRegistry:MediaAppRegistry) {
        this._id = id;
        this._tagRegistry = tagRegistry;
        this._mediaAppRegistry = mediaAppRegistry;
        this.reset();
    }

    /**
     * resets the mediastation, preserves its ID and its name
     */
    reset(): void {
        this._rootFolder = new Folder(0);
        this._rootFolder.name = "root";

        this._folderIdCounter = 1;    //must be 1 because the root-folder has the id 0
        this._contentIdCounter = 0;
        this._mediaAppIdCounter = 0;
        this._tagIdCounter = 0;

        this._tagRegistry.reset();
        this._mediaAppRegistry.reset();
    }

    exportToJSON(date:Date): string {
        const allTags:Map<number, Tag> = this._tagRegistry.getAll();

        let json: any = {
            lastSync: date.toLocaleString(),
            name: this._name,
            folderIdCounter: this._folderIdCounter,
            contentIdCounter: this._contentIdCounter,
            mediaAppIdCounter: this._mediaAppIdCounter,
            tagIdCounter: this._tagIdCounter,
            mediaApps: [],
            tags: [],
            rootFolder: this._rootFolder.exportToJSON(),
        };

        for(const [key, tag] of allTags)
            json.tags.push({id: tag.id, name: tag.name});

        this._mediaAppRegistry.getAll().forEach((mediaApp: MediaApp) => {
            json.mediaApps.push({id: mediaApp.id, name: mediaApp.name, ip: mediaApp.ip, role: mediaApp.role});
        });

        return JSON.stringify(json);
    }

    /**
     *
     * imports the whole data-structure from the JSON
     *
     * before it imports the data, it deletes the root-folder and all mediaApps
     *
     * @param json
     * @param {boolean} preserveName
     * @param {Folder} newRootFolder
     */
    importFromJSON(json: any,preserveName:boolean, newRootFolder: Folder = new Folder(0)): void {

        if(!preserveName){
            if (this._jsonPropertyExists(json, "name"))
                this._name = json.name;
        }

        if (this._jsonPropertyExists(json, "folderIdCounter"))
            this._folderIdCounter = json.folderIdCounter;
        if (this._jsonPropertyExists(json, "contentIdCounter"))
            this._contentIdCounter = json.contentIdCounter;
        if (this._jsonPropertyExists(json, "tagIdCounter"))
            this._tagIdCounter = json.tagIdCounter;
        if (this._jsonPropertyExists(json, "mediaAppIdCounter"))
            this._mediaAppIdCounter = json.mediaAppIdCounter;

        if (this._jsonPropertyExists(json, "mediaApps"))
            this._mediaAppRegistry.importFromJSON(json.mediaApps);

        if (this._jsonPropertyExists(json, "tags")) {
            this._tagRegistry.reset();

            for (let i: number = 0; i < json.tags.length; i++)
                this._tagRegistry.add(json.tags[i].id, json.tags[i].name);
        }

        if (this._jsonPropertyExists(json, "rootFolder")) {
            this._rootFolder = newRootFolder;
            this._rootFolder.importFromJSON(json.rootFolder);
        }
    }

    private _jsonPropertyExists(json: any, propName: string): boolean {
        if (json.hasOwnProperty(propName))
            return true;
        else
            throw new Error("MediaStation: missing property in JSON: " + propName);
    }

    getNextMediaAppId(): number {
        let actualID: number = this._mediaAppIdCounter;
        this._mediaAppIdCounter++;
        return actualID;
    }

    getNextFolderId(): number {
        let actualID: number = this._folderIdCounter;
        this._folderIdCounter++;
        return actualID;
    }

    getNextTagId(): number {
        let actualID: number = this._tagIdCounter;
        this._tagIdCounter++;
        return actualID;
    }

    getNextContentId(): number {
        let actualID: number = this._contentIdCounter;
        this._contentIdCounter++;
        return actualID;
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

    get rootFolder(): Folder {
        return this._rootFolder;
    }

    set rootFolder(value: Folder) {
        this._rootFolder = value;
    }

    get tagRegistry(): TagRegistry {
        return this._tagRegistry;
    }

    get mediaAppRegistry(): MediaAppRegistry {
        return this._mediaAppRegistry;
    }
}