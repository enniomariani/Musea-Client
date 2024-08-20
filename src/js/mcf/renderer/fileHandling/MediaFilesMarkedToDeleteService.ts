export class MediaFilesMarkedToDeleteService {

    private _fileName: string = "ids_to_delete.json"

    private _backendFileService: IBackendFileService;
    private _pathToDataFolder: string;

    constructor(backendFileService: IBackendFileService = window.backendFileService) {
        this._backendFileService = backendFileService;
    }

    init(pathToFile: string): void {
        this._pathToDataFolder = pathToFile;
    }

    /**
     * adds an ID to the "Ids to delete" json and saves it
     *
     * @param {number} mediaStationId
     * @param {number} id
     * @returns {Promise<void>}
     */
    async addID(mediaStationId: number, id: number): Promise<void> {
        let allIDs: number[] = [];
        let filePath: string = this._pathToDataFolder + "\\" + mediaStationId.toString() + "\\" + this._fileName;

        if (await this._backendFileService.fileExists(filePath))
            allIDs = await this._loadIDsFromFile(filePath);

        allIDs.push(id);
        this._saveJSON(allIDs, filePath);
    }

    /**
     * removes an ID from the file
     *
     * throws an error if there was no ID saved before or if the passed ID was not saved
     *
     * @param {number} mediaStationId
     * @param {number} idToDelete
     * @returns {Promise<void>}
     */
    async removeID(mediaStationId: number, idToDelete: number): Promise<void> {
        let allIDs: number[] = [];
        let indexOfIdToDelete: number;
        let filePath: string = this._pathToDataFolder + "\\" + mediaStationId.toString() + "\\" + this._fileName;

        if (await this._backendFileService.fileExists(filePath))
            allIDs = await this._loadIDsFromFile(filePath);
        else
            throw new Error("ID can't be removed because there are no saved IDs!");

        indexOfIdToDelete = allIDs.indexOf(idToDelete);

        if (indexOfIdToDelete === -1)
            throw new Error("ID can not be deleted because it was not saved before: " + idToDelete);

        allIDs.splice(indexOfIdToDelete, 1);

        this._saveJSON(allIDs, filePath);
    }

    private async _loadIDsFromFile(filePath: string): Promise<number[]> {
        let textDecoder: TextDecoder = new TextDecoder();
        let json: any;
        let jsonStr: string;
        let uint8Array: Uint8Array;

        uint8Array = await this._backendFileService.loadFile(filePath);

        if (uint8Array) {
            jsonStr = textDecoder.decode(uint8Array);
            json = JSON.parse(jsonStr);

            return json.ids;
        }

        return [];
    }

    private _saveJSON(allIDs: number[], filePath: string): void {
        let textEncoder: TextEncoder = new TextEncoder();
        let json: any;
        let jsonStr: string;
        let uint8Array: Uint8Array;

        json = {
            ids: allIDs
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
    async getAllIDS(mediaStationId: number): Promise<number[]> {
        let allIDs: number[] = [];
        let filePath: string = this._pathToDataFolder + "\\" + mediaStationId.toString() + "\\" + this._fileName;

        if (await this._backendFileService.fileExists(filePath))
            allIDs = await this._loadIDsFromFile(filePath);

        return allIDs;
    }
}