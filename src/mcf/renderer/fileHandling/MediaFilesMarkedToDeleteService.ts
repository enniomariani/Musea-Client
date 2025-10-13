import {IMainFileService} from "../../main";

export class MediaFilesMarkedToDeleteService {

    private _fileName: string = "ids_to_delete.json"

    private _backendFileService: IMainFileService;
    private _pathToDataFolder: string = "";

    constructor(backendFileService: IMainFileService = window.mcfBackendFiles) {
        this._backendFileService = backendFileService;
    }

    init(pathToFile: string): void {
        this._pathToDataFolder = pathToFile;
    }

    /**
     * adds an ID to the "Ids to delete" json and saves it
     *
     * @param {number} mediaStationId
     * @param {number} mediaAppId
     * @param {number} id
     * @returns {Promise<void>}
     */
    async addID(mediaStationId: number, mediaAppId: number, id: number): Promise<void> {
        let allIDs: Map<number, number[]> = new Map();
        let IDsOfMediaApp: number[];
        let filePath: string = this._pathToDataFolder + "\\" + mediaStationId.toString() + "\\" + this._fileName;

        if (await this._backendFileService.fileExists(filePath))
            allIDs = await this._loadIDsFromFile(filePath);

        if (!allIDs.has(mediaAppId))
            allIDs.set(mediaAppId, []);

        IDsOfMediaApp = allIDs.get(mediaAppId) as number[];
        IDsOfMediaApp.push(id);

        this._saveJSON(allIDs, filePath);
    }

    /**
     * removes an ID from the file
     *
     * throws an error if there was no ID saved before or if the passed ID was not saved
     *
     * @param {number} mediaStationId
     * @param {number} mediaAppId
     * @param {number} idToDelete
     * @returns {Promise<void>}
     */
    async removeID(mediaStationId: number, mediaAppId: number, idToDelete: number): Promise<void> {
        let allIDs: Map<number, number[]>;
        let idsOfMediaApp: number[];
        let indexOfIdToDelete: number;
        let filePath: string = this._pathToDataFolder + "\\" + mediaStationId.toString() + "\\" + this._fileName;

        if (await this._backendFileService.fileExists(filePath))
            allIDs = await this._loadIDsFromFile(filePath);
        else
            throw new Error("ID can't be removed because there are no saved IDs!");

        idsOfMediaApp = allIDs.get(mediaAppId) as number[];

        indexOfIdToDelete = idsOfMediaApp.indexOf(idToDelete);

        if (indexOfIdToDelete === -1)
            throw new Error("ID can not be deleted because it was not saved before: " + idToDelete);

        idsOfMediaApp.splice(indexOfIdToDelete, 1);

        this._saveJSON(allIDs, filePath);
    }

    private async _loadIDsFromFile(filePath: string): Promise<Map<number, number[]>> {
        let textDecoder: TextDecoder = new TextDecoder();
        let json: any;
        let jsonStr: string;
        let uint8Array: Uint8Array | null;
        let map: Map<number, number[]> = new Map();

        uint8Array = await this._backendFileService.loadFile(filePath);

        if (!uint8Array)
            return map;

        jsonStr = textDecoder.decode(uint8Array);
        json = JSON.parse(jsonStr);

        for (let i = 0; i < json.allIds.length; i++)
            map.set(json.allIds[i].mediaAppId, json.allIds[i].ids);

        return map;
    }

    private _saveJSON(allIDs: Map<number, number[]>, filePath: string): void {
        let textEncoder: TextEncoder = new TextEncoder();
        let json: any;
        let jsonStr: string;
        let uint8Array: Uint8Array;

        json = {allIds: []}

        for (let [key, ids] of allIDs) {
            json.allIds.push(
                {mediaAppId: key, ids: ids}
            );
        }

        jsonStr = JSON.stringify(json);

        uint8Array = textEncoder.encode(jsonStr);
        this._backendFileService.saveFile(filePath, uint8Array);
    }

    /**
     * returns all saved IDs
     *
     * @param {number} mediaStationId
     * @returns {Promise<number[]>}
     */
    async getAllIDS(mediaStationId: number): Promise<Map<number, number[]>> {
        let allIDs: Map<number, number[]> = new Map();
        let filePath: string = this._pathToDataFolder + "\\" + mediaStationId.toString() + "\\" + this._fileName;

        if (await this._backendFileService.fileExists(filePath))
            allIDs = await this._loadIDsFromFile(filePath);

        return allIDs;
    }
}