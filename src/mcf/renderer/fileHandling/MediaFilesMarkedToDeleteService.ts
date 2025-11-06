import {IMainFileService} from "main/MediaClientFrameworkMain.js";

export class MediaFilesMarkedToDeleteService {

    private _fileName: string = "ids_to_delete.json"

    private _backendFileService: IMainFileService;
    private _pathToDataFolder: string = "";

    constructor(backendFileService: IMainFileService = (window as any).mcfBackendFiles) {
        this._backendFileService = backendFileService;
    }

    init(pathToFile: string): void {
        this._pathToDataFolder = pathToFile;
    }

    /**
     * adds an ID to the "Ids to delete" json and saves it
     *
     * @param {number} mediaStationId
     * @param {number} mediaPlayerId
     * @param {number} id
     * @returns {Promise<void>}
     */
    async addID(mediaStationId: number, mediaPlayerId: number, id: number): Promise<void> {
        let allIDs: Map<number, number[]> = new Map();
        let IDsOfMediaPlayer: number[];
        let filePath: string = this._pathToDataFolder + "\\" + mediaStationId.toString() + "\\" + this._fileName;

        if (await this._backendFileService.fileExists(filePath))
            allIDs = await this._loadIDsFromFile(filePath);

        if (!allIDs.has(mediaPlayerId))
            allIDs.set(mediaPlayerId, []);

        IDsOfMediaPlayer = allIDs.get(mediaPlayerId) as number[];
        IDsOfMediaPlayer.push(id);

        this._saveJSON(allIDs, filePath);
    }

    /**
     * removes an ID from the file
     *
     * throws an error if there was no ID saved before or if the passed ID was not saved
     *
     * @param {number} mediaStationId
     * @param {number} mediaPlayerId
     * @param {number} idToDelete
     * @returns {Promise<void>}
     */
    async removeID(mediaStationId: number, mediaPlayerId: number, idToDelete: number): Promise<void> {
        let allIDs: Map<number, number[]>;
        let idsOfMediaPlayer: number[];
        let indexOfIdToDelete: number;
        let filePath: string = this._pathToDataFolder + "\\" + mediaStationId.toString() + "\\" + this._fileName;

        if (await this._backendFileService.fileExists(filePath))
            allIDs = await this._loadIDsFromFile(filePath);
        else
            throw new Error("ID can't be removed because there are no saved IDs!");

        idsOfMediaPlayer = allIDs.get(mediaPlayerId) as number[];

        indexOfIdToDelete = idsOfMediaPlayer.indexOf(idToDelete);

        if (indexOfIdToDelete === -1)
            throw new Error("ID can not be deleted because it was not saved before: " + idToDelete);

        idsOfMediaPlayer.splice(indexOfIdToDelete, 1);

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
            map.set(json.allIds[i].mediaPlayerId, json.allIds[i].ids);

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
                {mediaPlayerId: key, ids: ids}
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