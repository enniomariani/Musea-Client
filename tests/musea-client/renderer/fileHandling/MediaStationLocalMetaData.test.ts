import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    MediaStationLocalMetaData
} from "renderer/fileHandling/MediaStationLocalMetaData.js";
import {MockBackendFileService} from "mocks/main/MockBackendFileService.js";

let mediaStationLocalMetaData: MediaStationLocalMetaData;

let mockBackendFileService:MockBackendFileService;

const pathToSave: string = "path-to-folder/mediastations.json";
let data: Map<string, string>;
let jsonToSave: any;
let jsonToSaveStr: string;
let fileData:Uint8Array;
let textEncoder: TextEncoder = new TextEncoder();

beforeEach(() => {
    data = new Map();
    data.set("Station 1", "controller-ip1");
    data.set("Station 2", "controller-ip2");

    jsonToSave = {
        mediaStations: [
            {
                name: "Station 1",
                ip: "controller-ip1",
            },
            {
                name: "Station 2",
                ip: "controller-ip2",
            }
        ]
    }

    jsonToSaveStr = JSON.stringify(jsonToSave);
    fileData = textEncoder.encode(jsonToSaveStr);

    mockBackendFileService = new MockBackendFileService();
    mediaStationLocalMetaData = new MediaStationLocalMetaData(mockBackendFileService);
});

afterEach(() => {
    jest.clearAllMocks();
});


describe("init() and save() ", () => {

    it("should call saveFile from the backend with the correct parameters", () => {
        mediaStationLocalMetaData.init(pathToSave);
        mediaStationLocalMetaData.save(data);

        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFile).toHaveBeenCalledWith(pathToSave, fileData);
    });
});

describe("init() and load() ", () => {
    it("should call loadFile from the backend with the correct parameters ", async () => {
        let returnedMap:Map<string, string>;
        mockBackendFileService.loadFile.mockImplementationOnce(()=>{
           return new Promise((resolve,reject)=>{
               resolve(fileData)
           })
        });

        mediaStationLocalMetaData.init(pathToSave);
        returnedMap = await mediaStationLocalMetaData.load();

        expect(mockBackendFileService.loadFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.loadFile).toHaveBeenCalledWith(pathToSave);
        expect(returnedMap).toEqual(data);
    });

    it("should return an empty map if the backend returned null (the file does not exist)", async () => {
        let returnedMap:Map<string, string>;
        let expectedMap:Map<string, string> = new Map();
        mockBackendFileService.loadFile.mockImplementationOnce(()=>{
            return new Promise((resolve,reject)=>{
                resolve(null)
            })
        });

        mediaStationLocalMetaData.init(pathToSave);
        returnedMap = await mediaStationLocalMetaData.load();

        expect(returnedMap).toEqual(expectedMap);
    });
});