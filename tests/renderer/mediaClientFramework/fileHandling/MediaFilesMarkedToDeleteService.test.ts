import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockBackendFileService} from "../../../__mocks__/main/MockBackendFileService";
import {
    MediaFilesMarkedToDeleteService
} from "../../../../src/js/mcf/renderer/fileHandling/MediaFilesMarkedToDeleteService";

let mediaFilesMarkedToDeleteService: MediaFilesMarkedToDeleteService;

let mockBackendFileService:MockBackendFileService;

const pathToSave: string = "path-to-folder/mediastations.json";
const mediaStationId:number = 3;

beforeEach(() => {
    mockBackendFileService = new MockBackendFileService();
    mediaFilesMarkedToDeleteService = new MediaFilesMarkedToDeleteService(mockBackendFileService);
});

afterEach(() => {
    jest.clearAllMocks();
});

function createJSONandConvertToBinary(ids:number[]):Uint8Array{
    let textEncoder:TextEncoder = new TextEncoder();
    let json:any;
    let jsonStr:string;

    json = {
        ids: ids
    }

    jsonStr = JSON.stringify(json);
    return textEncoder.encode(jsonStr);
}


describe("init() and addID() ", () => {

    it("should call saveFile from the backend with the new ID, if there was no ID saved before", async () => {
        //setup
        const idToSave:number = 5;
        const fileToSave:string = pathToSave + "\\" + mediaStationId.toString() + "\\ids_to_delete.json";
        mockBackendFileService.fileExists.mockImplementation((path:string)=>{
            return new Promise((resolve, reject)=>{
                    resolve(false);
            })
        });

        //method to test
        mediaFilesMarkedToDeleteService.init(pathToSave);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId, idToSave);

        //tests
        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFile).toHaveBeenCalledWith(fileToSave, createJSONandConvertToBinary([idToSave]));
    });

    it("should call saveFile from the backend with the new ID, if there were other IDs saved before", async () => {
        //setup
        let savedData:Uint8Array;
        let uint8Array:Uint8Array;
        const savedIDs:number[] = [5,30,0];
        const fileToSave:string = pathToSave + "\\" + mediaStationId.toString() + "\\ids_to_delete.json";

        mockBackendFileService.fileExists.mockImplementation((path:string)=>{
            return new Promise((resolve, reject)=>{
                if(savedData)
                    resolve(true);
                else
                    resolve(false);
            })
        });

        mockBackendFileService.loadFile.mockImplementation((path:string)=>{
            if(path === fileToSave)
                return savedData;
            else
                return null;
        });

        mockBackendFileService.saveFile.mockImplementation((path:string,data:Uint8Array)=>{
            if(path === fileToSave)
                savedData = data;
        });

        uint8Array = createJSONandConvertToBinary(savedIDs);

        //method to test
        mediaFilesMarkedToDeleteService.init(pathToSave);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId, savedIDs[0]);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId, savedIDs[1]);
        await mediaFilesMarkedToDeleteService.addID(mediaStationId, savedIDs[2]);

        //tests
        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(3);
        expect(mockBackendFileService.saveFile).toHaveBeenNthCalledWith(3, fileToSave, uint8Array);
    });
});

describe("init() and removeID() ", () => {

    it("should call saveFile from the backend with the ID removed, if there were IDs saved before", async () => {
        //setup
        let expectedUint8Array:any;
        let loadedUint8Array:Uint8Array;
        const savedIDs:number[] = [5,30,0];
        const idToDelete:number = 30;
        const fileToSave:string = pathToSave + "\\" + mediaStationId.toString() + "\\ids_to_delete.json";

        mockBackendFileService.fileExists.mockImplementation((path:string)=>{
            return new Promise((resolve, reject)=>{
                if(path === fileToSave)
                    resolve(true);
                else
                    resolve(false);
            })
        });

        loadedUint8Array = createJSONandConvertToBinary(savedIDs);
        expectedUint8Array = createJSONandConvertToBinary([5,0]);

        mockBackendFileService.loadFile.mockImplementation((path:string)=>{
            if(path === fileToSave)
                return loadedUint8Array;
            else
                return null;
        });

        //method to test
        mediaFilesMarkedToDeleteService.init(pathToSave);
        await mediaFilesMarkedToDeleteService.removeID(mediaStationId, idToDelete);

        //tests
        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFile).toHaveBeenCalledWith(fileToSave, expectedUint8Array);
    });

    it("should throw an error if there were no saved IDs before", async () => {
        //setup
        const idToDelete:number = 30;

        mockBackendFileService.fileExists.mockImplementation((path:string)=>{
            return new Promise((resolve, reject)=>{
                    resolve(false);
            })
        });

        //method to test
        mediaFilesMarkedToDeleteService.init(pathToSave);

        //tests
        expect(mediaFilesMarkedToDeleteService.removeID(mediaStationId, idToDelete)).rejects.toThrow(Error("ID can't be removed because there are no saved IDs!"))
    });

    it("should throw an error if the ID passed was not added before, but there are IDs saved", async () => {
        //setup
        let loadedUint8Array:Uint8Array;
        const savedIDs:number[] = [5,30,0];
        const idToDelete:number = 25;
        const fileToSave:string = pathToSave + "\\" + mediaStationId.toString() + "\\ids_to_delete.json";

        mockBackendFileService.fileExists.mockImplementation((path:string)=>{
            return new Promise((resolve, reject)=>{
                if(path === fileToSave)
                    resolve(true);
                else
                    resolve(false);
            })
        });

        loadedUint8Array = createJSONandConvertToBinary(savedIDs);

        mockBackendFileService.loadFile.mockImplementation((path:string)=>{
            if(path === fileToSave)
                return loadedUint8Array;
            else
                return null;
        });

        //method to test
        mediaFilesMarkedToDeleteService.init(pathToSave);

        //tests
        expect(mediaFilesMarkedToDeleteService.removeID(mediaStationId, idToDelete)).rejects.toThrow(Error("ID can not be deleted because it was not saved before: " + idToDelete))
    });
});

describe("init() and getAllIds() ", () => {

    it("should return the IDs loaded from the file loaded from the backend", async () => {
        //setup
        let loadedIDs:number[];
        let uint8Array:Uint8Array;
        const savedIDs:number[] = [5,30,0];
        const fileToSave:string = pathToSave + "\\" + mediaStationId.toString() + "\\ids_to_delete.json";

        mockBackendFileService.fileExists.mockImplementation((path:string)=>{
            return new Promise((resolve, reject)=>{
                    resolve(true);
            })
        });

        uint8Array = createJSONandConvertToBinary(savedIDs);

        mockBackendFileService.loadFile.mockImplementation((path:string)=>{
            if(path === fileToSave)
                return uint8Array;
            else
                return null;
        });

        //method to test
        mediaFilesMarkedToDeleteService.init(pathToSave);
        loadedIDs = await mediaFilesMarkedToDeleteService.getAllIDS(mediaStationId);

        //tests
        expect(loadedIDs).toEqual(savedIDs);
    });

    it("should return an empty array if there were no IDs saved yet", async () => {
        //setup
        let loadedIDs:number[];

        mockBackendFileService.fileExists.mockImplementation((path:string)=>{
            return new Promise((resolve, reject)=>{
                resolve(false);
            })
        });

        //method to test
        mediaFilesMarkedToDeleteService.init(pathToSave);
        loadedIDs = await mediaFilesMarkedToDeleteService.getAllIDS(mediaStationId);

        //tests
        expect(loadedIDs).toEqual([]);
    });
});