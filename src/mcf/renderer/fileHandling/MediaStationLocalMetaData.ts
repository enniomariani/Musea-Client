

export class MediaStationLocalMetaData {

    private _backendFileService:IBackendFileService;
    private _pathToFile:string = "";

    constructor(backendFileService:IBackendFileService = window.backendFileService) {
        this._backendFileService = backendFileService;
    }

    init(pathToFile:string):void{
        this._pathToFile = pathToFile;
    }

    /**
     * loads the map of mediastation-names (keys) and controller-ips (values) from the json-file specified in the init() method
     *
     * returns an empty map if there is no file saved
     *
     * @returns {Promise<Map<string, string>>}
     */
    async load():Promise<Map<string, string>>{
        let textDecoder:TextDecoder = new TextDecoder();
        let allMediaStations:Map<string, string> = new Map();
        let json:any;
        let jsonStr:string;
        let uint8Array:Uint8Array | null;
        let i:number;

        uint8Array = await this._backendFileService.loadFile(this._pathToFile);

        if(uint8Array){
            console.log("MediaStationLocalMetaData: file exists");
            jsonStr = textDecoder.decode(uint8Array);
            console.log("Loaded json-string: ", jsonStr);
            json = JSON.parse(jsonStr);

            for(i = 0; i < json.mediaStations.length; i++)
                allMediaStations.set(json.mediaStations[i].name, json.mediaStations[i].ip);
        }

        return allMediaStations;
    }

    /**
     * saves the map of media-station-names and controller-ips to the specified json-file in the init() function
     *
     * @param {Map<string, string>} mediaStationsAndControllers
     */
    async save(mediaStationsAndControllers:Map<string, string>):Promise<void>{
        let textEncoder:TextEncoder = new TextEncoder();
        let allMediaStations:any[] = [];
        let json:any = {mediaStations: allMediaStations};
        let jsonStr:string;
        let uint8Array:Uint8Array;

        mediaStationsAndControllers.forEach((controllerIp:string, mediaStationName:string) =>{
            allMediaStations.push({name: mediaStationName, ip: controllerIp});
        });

        jsonStr = JSON.stringify(json);
        uint8Array = textEncoder.encode(jsonStr);
        await this._backendFileService.saveFile(this._pathToFile,uint8Array);
    }
}