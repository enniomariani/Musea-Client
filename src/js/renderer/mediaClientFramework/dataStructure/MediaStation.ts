import {MediaApp} from "./MediaApp";
import {Folder} from "./Folder";
import {Tag} from "./Tag";


export class MediaStation{
    private _id:number;
    private _name:string;
    private _mediaApps:Map<number, MediaApp> = new Map();
    private _rootFolder:Folder = new Folder(0);

    private _folderIdCounter:number = 0;
    private _contentIdCounter:number = 0;
    private _mediaAppIdCounter:number = 0;
    private _tagIdCounter:number = 0;

    private _tags:Tag[];

    constructor(id:number) {
        this._id = id;
    }

    exportToJSON():string{
        let json:any = {
            name: this._name,
            folderIdCounter : this._folderIdCounter,
            contentIdCounter : this._contentIdCounter,
            mediaAppIdCounter : this._mediaAppIdCounter,
            tagIdCounter : this._tagIdCounter,
            mediaApps: [],
            tags: [],
            rootFolder : this._rootFolder.exportToJSON(),
        };

        this._mediaApps.forEach((mediaApp:MediaApp)=>{
            json.mediaApps.push({id: mediaApp.id, name: mediaApp.name, ip: mediaApp.ip, role: mediaApp.role});
        })

        return JSON.stringify(json);
    }

    importMediaAppsFromJSON(json:any):void{
        let mediaApp:MediaApp;

        if(this._jsonPropertyExists(json, "mediaAppIdCounter"))
            this._mediaAppIdCounter = json.mediaAppIdCounter;

        if(json.mediaApps){
            for(let i:number = 0; i < json.mediaApps.length; i++){
                console.    log("FOUND MEDIA-APP IN JSON: ", json.mediaApps[i], json.mediaApps[i].id, json.mediaApps[i].name)
                if(this._jsonPropertyExists(json.mediaApps[i], "id"))
                    mediaApp = new MediaApp(json.mediaApps[i].id);
                if(this._jsonPropertyExists(json.mediaApps[i], "name"))
                    mediaApp.name = json.mediaApps[i].name;
                if(this._jsonPropertyExists(json.mediaApps[i], "ip"))
                    mediaApp.ip = json.mediaApps[i].ip;
                if(this._jsonPropertyExists(json.mediaApps[i], "role"))
                    mediaApp.role = json.mediaApps[i].role;

                this._mediaApps.set(mediaApp.id, mediaApp);
            }
        }
    }

    /**
     * imports the whole data-structure from the JSON
     *
     * @param json
     */
    importFromJSON(json:any):void{
        console.log("IMPORT MEDIA-STATION FROM JSON: ", json)

        if(this._jsonPropertyExists(json, "name"))
            this._name = json.name;
        if(this._jsonPropertyExists(json, "folderIdCounter"))
            this._folderIdCounter = json.folderIdCounter;
        if(this._jsonPropertyExists(json, "contentIdCounter"))
            this._contentIdCounter= json.contentIdCounter;
        if(this._jsonPropertyExists(json, "mediaAppIdCounter"))
            this._mediaAppIdCounter = json.mediaAppIdCounter;
        if(this._jsonPropertyExists(json, "tagIdCounter"))
            this._tagIdCounter = json.tagIdCounter;

        this.importMediaAppsFromJSON(json);

        if(this._jsonPropertyExists(json, "rootFolder"))
            this._rootFolder.importFromJSON(json.rootFolder);
    }

    private _jsonPropertyExists(json:any, propName:string): boolean {
        if(json.hasOwnProperty(propName))
            return true;
        else
            throw new Error("MediaStation: missing property in JSON: " + propName);
    }

    /**
     * returns null and prints an error  if there is no controller-app defined
     *
     * @returns {string | null}
     */
    getControllerIp():string | null{
        let result:string;

        this._mediaApps.forEach((mediaApp:MediaApp) =>{
            if(mediaApp.role === MediaApp.ROLE_CONTROLLER)
                result =  mediaApp.ip;
        });

        if(result)
            return result;

        console.error("No controller-app is set for mediaStation: ", this._id, this._name)
        return null;
    }

    getNextMediaAppId():number{
        let actualID:number = this._mediaAppIdCounter;
        this._mediaAppIdCounter++;
        return actualID;
    }

    getNextFolderId():number{
        let actualID:number = this._folderIdCounter;
        this._folderIdCounter++;
        return actualID;
    }

    getNextTagId():number{
        let actualID:number = this._tagIdCounter;
        this._tagIdCounter++;
        return actualID;
    }

    getNextContentId():number{
        let actualID:number = this._contentIdCounter;
        this._contentIdCounter++;
        return actualID;
    }

    addMediaApp(id:number, name:string, ip:string, role:string):void{
        let mediaApp:MediaApp = new MediaApp(id);
        mediaApp.ip = ip;
        mediaApp.name = name;
        mediaApp.role = role;

        this._mediaApps.set(id, mediaApp);
    }

    getMediaApp(id:number):MediaApp{
        if(this._mediaApps.has(id))
            return this._mediaApps.get(id);
        else
            throw new Error("Media App with the following ID does not exist: "+ id);
    }

    getAllMediaApps():Map<number, MediaApp>{
        return this._mediaApps;
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