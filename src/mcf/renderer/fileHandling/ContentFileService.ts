export class ContentFileService {

    private _backendFileService: IBackendFileService;
    private _pathToFolder: string;

    constructor(backendFileService: IBackendFileService = window.backendFileService) {
        this._backendFileService = backendFileService;
    }

    init(pathToFolder: string): void {
        this._pathToFolder = pathToFolder;
    }

    saveFile(mediaStationId: number, contentJSONstr: string): void {
        let pathToFile: string = this._createFilePath(mediaStationId);
        let textEncoder: TextEncoder = new TextEncoder();
        let fileData: Uint8Array = textEncoder.encode(contentJSONstr);

        console.log("Save contents-File: ", pathToFile, contentJSONstr);
        this._backendFileService.saveFile(pathToFile, fileData);
    }

    deleteFile(mediaStationId: number): void {
        let pathToFile: string = this._createFilePath(mediaStationId);

        console.log("Delete contents-File: ", pathToFile);
        this._backendFileService.deleteFile(pathToFile);
    }

    async fileExists(mediaStationId: number): Promise<boolean> {
        let pathToFile: string = this._createFilePath(mediaStationId);
        let fileExists:boolean = await this._backendFileService.fileExists(pathToFile);
        console.log("FILE EXISTS? ", fileExists)
        return fileExists;
    }

    async loadFile(mediaStationId: number): Promise<any> {
        let pathToFile: string = this._createFilePath(mediaStationId);
        let textDecoder: TextDecoder = new TextDecoder();
        let uint8Array: Uint8Array = await this._backendFileService.loadFile(pathToFile);
        let jsonStr: string;
        let json: any;

        if(!uint8Array)
            return {};

        jsonStr = textDecoder.decode(uint8Array);
        json = JSON.parse(jsonStr);

        console.log("Load Media-File: ", json);
        return json;
    }

    private _createFilePath(mediaStationId: number): string {
        return this._pathToFolder + "\\" + mediaStationId.toString() + "\\" + mediaStationId.toString() + ".json";
    }
}