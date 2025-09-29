import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockBackendFileService} from "../../../__mocks__/mcf/main/MockBackendFileService";
import {
    MediaFilesMarkedToDeleteService
} from "../../../../src/mcf/renderer/fileHandling/MediaFilesMarkedToDeleteService";

let mediaFilesMarkedToDeleteService: MediaFilesMarkedToDeleteService;

let mockBackendFileService: MockBackendFileService;

const pathToSave: string = "path-to-folder/mediastations.json";
const mediaStationId: number = 3;

beforeEach(() => {
    mockBackendFileService = new MockBackendFileService();
    mediaFilesMarkedToDeleteService = new MediaFilesMarkedToDeleteService(mockBackendFileService);
});

afterEach(() => {
    jest.clearAllMocks();
});

function createJSONandConvertToBinary(idsApp1: number[] | undefined, idsApp2: number[] | undefined | null): Uint8Array {
    let textEncoder: TextEncoder = new TextEncoder();
    let json: any;
    let jsonStr: string;

    json = {
        allIds: []
    }

    if(idsApp1)
        json.allIds.push({mediaAppId: 0, ids: idsApp1});
    if(idsApp2)
        json.allIds.push({mediaAppId: 1, ids: idsApp2});

    jsonStr = JSON.stringify(json);

    console.log("CREATED JSON: ", jsonStr)
    return textEncoder.encode(jsonStr);
}


describe("init() and addID() ", () => {

    it("should call saveFile from the backend with the new ID, if there was no ID saved before", async () => {
        const idToSave: number = 5;
        const fileToSave: string = pathToSave + "\\" + mediaStationId.toString() + "\\ids_to_delete.json";
        mockBackendFileService.fileExists.mockImplementation((path: string) => {
            return new Promise((resolve, reject) => {
                resolve(false);
            })
        });

        mediaFilesMarkedToDeleteService.init(pathToSave);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId,0, idToSave);

        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFile).toHaveBeenCalledWith(fileToSave,
            createJSONandConvertToBinary([idToSave], null));
    });

    it("should call saveFile from the backend with the new ID, if there were other IDs saved before", async () => {
        let savedData: Uint8Array;
        let uint8Array: Uint8Array;
        const savedIDsApp1: number[] = [5, 30, 0];
        const savedIDsApp2: number[] = [21, 44, 22,9];
        const fileToSave: string = pathToSave + "\\" + mediaStationId.toString() + "\\ids_to_delete.json";

        mockBackendFileService.fileExists.mockImplementation((path: string) => {
            return new Promise((resolve, reject) => {
                if (savedData)
                    resolve(true);
                else
                    resolve(false);
            })
        });

        mockBackendFileService.loadFile.mockImplementation((path: string) => {
            if (path === fileToSave)
                return savedData;
            else
                return null;
        });

        mockBackendFileService.saveFile.mockImplementation((path: string, data: Uint8Array) => {
            if (path === fileToSave)
                savedData = data;
        });

        uint8Array = createJSONandConvertToBinary(savedIDsApp1, savedIDsApp2);

        mediaFilesMarkedToDeleteService.init(pathToSave);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId, 0, savedIDsApp1[0]);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId, 0, savedIDsApp1[1]);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId, 0, savedIDsApp1[2]);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId, 1, savedIDsApp2[0]);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId, 1, savedIDsApp2[1]);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId, 1, savedIDsApp2[2]);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId, 1, savedIDsApp2[3]);

        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(7);
        expect(mockBackendFileService.saveFile).toHaveBeenNthCalledWith(7, fileToSave, uint8Array);
    });
});

describe("init() and removeID() ", () => {

    it("should call saveFile from the backend with the ID removed, if there were IDs saved before", async () => {
        let expectedUint8Array: any;
        let loadedUint8Array: Uint8Array;
        const savedIDs: number[] = [5, 30, 0];
        const idToDelete: number = 30;
        const fileToSave: string = pathToSave + "\\" + mediaStationId.toString() + "\\ids_to_delete.json";

        mockBackendFileService.fileExists.mockImplementation((path: string) => {
            return new Promise((resolve, reject) => {
                if (path === fileToSave)
                    resolve(true);
                else
                    resolve(false);
            })
        });

        loadedUint8Array = createJSONandConvertToBinary(savedIDs, null);
        expectedUint8Array = createJSONandConvertToBinary([5, 0], null);

        mockBackendFileService.loadFile.mockImplementation((path: string) => {
            if (path === fileToSave)
                return loadedUint8Array;
            else
                return null;
        });

        mediaFilesMarkedToDeleteService.init(pathToSave);
        await mediaFilesMarkedToDeleteService.removeID(mediaStationId,0,  idToDelete);

        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFile).toHaveBeenCalledWith(fileToSave, expectedUint8Array);
    });

    it("should throw an error if there were no saved IDs before", async () => {
        const idToDelete: number = 30;

        mockBackendFileService.fileExists.mockImplementation((path: string) => {
            return new Promise((resolve, reject) => {
                resolve(false);
            })
        });

        mediaFilesMarkedToDeleteService.init(pathToSave);

        expect(mediaFilesMarkedToDeleteService.removeID(mediaStationId,0, idToDelete)).rejects.toThrow(Error("ID can't be removed because there are no saved IDs!"))
    });

    it("should throw an error if the ID passed was not added before, but there are IDs saved", async () => {
        let loadedUint8Array: Uint8Array;
        const savedIDs: number[] = [5, 30, 0];
        const idToDelete: number = 25;
        const fileToSave: string = pathToSave + "\\" + mediaStationId.toString() + "\\ids_to_delete.json";

        mockBackendFileService.fileExists.mockImplementation((path: string) => {
            return new Promise((resolve, reject) => {
                if (path === fileToSave)
                    resolve(true);
                else
                    resolve(false);
            })
        });

        loadedUint8Array = createJSONandConvertToBinary(savedIDs, null);

        mockBackendFileService.loadFile.mockImplementation((path: string) => {
            if (path === fileToSave)
                return loadedUint8Array;
            else
                return null;
        });

        mediaFilesMarkedToDeleteService.init(pathToSave);

        expect(mediaFilesMarkedToDeleteService.removeID(mediaStationId, 0, idToDelete)).rejects.toThrow(Error("ID can not be deleted because it was not saved before: " + idToDelete))
    });
});

describe("init() and getAllIds() ", () => {

    it("should return the IDs loaded from the file loaded from the backend", async () => {
        let loadedIDs: Map<number, number[]>;
        let uint8Array: Uint8Array;
        const savedIDs: Map<number, number[]> = new Map();
        savedIDs.set(0,[5, 30, 0]);
        const fileToSave: string = pathToSave + "\\" + mediaStationId.toString() + "\\ids_to_delete.json";

        mockBackendFileService.fileExists.mockImplementation((path: string) => {
            return new Promise((resolve, reject) => {
                resolve(true);
            })
        });

        uint8Array = createJSONandConvertToBinary(savedIDs.get(0), null);

        mockBackendFileService.loadFile.mockImplementation((path: string) => {
            if (path === fileToSave)
                return uint8Array;
            else
                return null;
        });

        mediaFilesMarkedToDeleteService.init(pathToSave);
        loadedIDs = await mediaFilesMarkedToDeleteService.getAllIDS(mediaStationId);

        expect(loadedIDs).toEqual(savedIDs);
    });

    it("should return an empty array if there were no IDs saved yet", async () => {
        let loadedIDs: Map<number, number[]>

        mockBackendFileService.fileExists.mockImplementation((path: string) => {
            return new Promise((resolve, reject) => {
                resolve(false);
            })
        });

        mediaFilesMarkedToDeleteService.init(pathToSave);
        loadedIDs = await mediaFilesMarkedToDeleteService.getAllIDS(mediaStationId);

        expect(loadedIDs).toEqual(new Map());
    });
});