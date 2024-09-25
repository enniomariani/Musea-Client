import {MediaApp} from "./MediaApp";
import {Folder} from "./Folder";
import {Tag} from "./Tag";


export class MediaStation {
    private _id: number;
    private _name: string;
    private _mediaApps: Map<number, MediaApp>;
    private _rootFolder: Folder;

    private _folderIdCounter: number;
    private _contentIdCounter: number;
    private _mediaAppIdCounter: number;
    private _tagIdCounter: number;

    private _tags: Map<number, Tag>;

    constructor(id: number) {
        this._id = id;
        this.reset();
    }

    /**
     * resets the mediastation, preserves its ID and its name
     */
    reset(): void {
        this._mediaApps = new Map();
        this._rootFolder = new Folder(0);
        this._rootFolder.name = "root";

        this._folderIdCounter = 1;    //must be 1 because the root-folder has the id 0
        this._contentIdCounter = 0;
        this._mediaAppIdCounter = 0;
        this._tagIdCounter = 0;

        this._tags = new Map();
    }

    exportToJSON(): string {
        let json: any = {
            name: this._name,
            folderIdCounter: this._folderIdCounter,
            contentIdCounter: this._contentIdCounter,
            mediaAppIdCounter: this._mediaAppIdCounter,
            tagIdCounter: this._tagIdCounter,
            mediaApps: [],
            tags: [],
            rootFolder: this._rootFolder.exportToJSON(),
        };

        for(const [key, tag] of this._tags)
            json.tags.push({id: tag.id, name: tag.name});

        this._mediaApps.forEach((mediaApp: MediaApp) => {
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
     * @param {boolean} preserverName
     * @param {Folder} newRootFolder
     */
    importFromJSON(json: any,preserverName:boolean, newRootFolder: Folder = new Folder(0)): void {
        console.log("IMPORT MEDIA-STATION FROM JSON: ", json)

        if(!preserverName){
            if (this._jsonPropertyExists(json, "name"))
                this._name = json.name;
        }

        if (this._jsonPropertyExists(json, "folderIdCounter"))
            this._folderIdCounter = json.folderIdCounter;
        if (this._jsonPropertyExists(json, "contentIdCounter"))
            this._contentIdCounter = json.contentIdCounter;
        if (this._jsonPropertyExists(json, "tagIdCounter"))
            this._tagIdCounter = json.tagIdCounter;

        this._importMediaAppsFromJSON(json);

        if (this._jsonPropertyExists(json, "tags")) {
            this._tags = new Map();

            for (let i: number = 0; i < json.tags.length; i++)
                this.addTag(json.tags[i].id, json.tags[i].name);
        }

        if (this._jsonPropertyExists(json, "rootFolder")) {
            this._rootFolder = newRootFolder;
            this._rootFolder.importFromJSON(json.rootFolder);
        }
    }

    private _importMediaAppsFromJSON(json: any): void {
        let mediaApp: MediaApp;

        if (this._jsonPropertyExists(json, "mediaAppIdCounter"))
            this._mediaAppIdCounter = json.mediaAppIdCounter;

        this._mediaApps = new Map();

        if (json.mediaApps) {
            for (let i: number = 0; i < json.mediaApps.length; i++) {
                console.log("FOUND MEDIA-APP IN JSON: ", json.mediaApps[i], json.mediaApps[i].id, json.mediaApps[i].name)
                if (this._jsonPropertyExists(json.mediaApps[i], "id"))
                    mediaApp = new MediaApp(json.mediaApps[i].id);
                if (this._jsonPropertyExists(json.mediaApps[i], "name"))
                    mediaApp.name = json.mediaApps[i].name;
                if (this._jsonPropertyExists(json.mediaApps[i], "ip"))
                    mediaApp.ip = json.mediaApps[i].ip;
                if (this._jsonPropertyExists(json.mediaApps[i], "role"))
                    mediaApp.role = json.mediaApps[i].role;

                this._mediaApps.set(mediaApp.id, mediaApp);
            }
        }
    }

    private _jsonPropertyExists(json: any, propName: string): boolean {
        if (json.hasOwnProperty(propName))
            return true;
        else
            throw new Error("MediaStation: missing property in JSON: " + propName);
    }

    /**
     * returns null and prints an error  if there is no controller-app defined
     *
     * @returns {string | null}
     */
    getControllerIp(): string | null {
        let result: string;

        this._mediaApps.forEach((mediaApp: MediaApp) => {
            if (mediaApp.role === MediaApp.ROLE_CONTROLLER)
                result = mediaApp.ip;
        });

        if (result)
            return result;

        console.error("No controller-app is set for mediaStation: ", this._id, this._name)
        return null;
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

    addMediaApp(id: number, name: string, ip: string, role: string): void {
        let mediaApp: MediaApp = new MediaApp(id);
        mediaApp.ip = ip;
        mediaApp.name = name;
        mediaApp.role = role;

        this._mediaApps.set(id, mediaApp);
    }

    getMediaApp(id: number): MediaApp {
        if (this._mediaApps.has(id))
            return this._mediaApps.get(id);
        else
            throw new Error("Media App with the following ID does not exist: " + id);
    }

    getAllMediaApps(): Map<number, MediaApp> {
        return this._mediaApps;
    }

    /**
     * adds a tag, if a tag with the same ID alread exists, it is replaced
     *
     * @param {number} id
     * @param {string} name
     */
    addTag(id: number, name: string): void {
        let tag: Tag = new Tag();
        tag.id = id;
        tag.name = name;

        this._tags.set(id, tag);
    }

    removeTag(id: number): void {
        if (this._tags.has(id))
            this._tags.delete(id);
        else
            throw new Error("Tag with the following ID does not exist: " + id);
    }

    getTag(id: number): Tag {
        let tag: Tag = this._tags.get(id);

        if (tag)
            return tag;
        else
            throw new Error("Tag with the following ID does not exist: " + id);
    }

    getAllTags(): Map<number, Tag> {
        return this._tags;
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
}