import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {ContentFileService} from "../../../../src/js/renderer/mediaClientFramework/fileHandling/ContentFileService";
import {MockBackendFileService} from "../../../__mocks__/main/MockBackendFileService";

let contentFileService: ContentFileService;

let mockBackendFileService: MockBackendFileService;

const pathToFolder: string = "path-to-folder";
let jsonToSave: any;
let jsonToSaveStr: string;
let fileData: Uint8Array;
let textEncoder: TextEncoder = new TextEncoder();

beforeEach(() => {
    jsonToSave = {
        name: "myName",
        folderIdCounter: 1,
        contentIdCounter: 1,
        mediaAppIdCounter: 1,
        tagIdCounter: 1,
        rootFolder: {id: 0, name: "Test", subfolders: []},
        mediaApps: [],
        tags: []
    }

    jsonToSaveStr = JSON.stringify(jsonToSave);
    fileData = textEncoder.encode(jsonToSaveStr);

    mockBackendFileService = new MockBackendFileService();

    contentFileService = new ContentFileService(mockBackendFileService);
});

afterEach(() => {
    jest.clearAllMocks();
});


describe("init() and saveFile() ", () => {
    it("should call saveFile from the backend with the correct parameters", () => {
        //setup
        let pathToSave: string = "\\0\\0.json";

        //method to test
        contentFileService.init(pathToFolder);
        contentFileService.saveFile(0, jsonToSaveStr);

        //tests
        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFile).toHaveBeenCalledWith(pathToFolder + pathToSave, fileData);
    });
});

describe("init() and deleteFile() ", () => {
    it("should call deleteFile from the backend with the correct parameters", () => {
        //setup
        let pathToSave: string = "\\0\\0.json";

        //method to test
        contentFileService.init(pathToFolder);
        contentFileService.deleteFile(0)

        //tests
        expect(mockBackendFileService.deleteFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.deleteFile).toHaveBeenCalledWith(pathToFolder + pathToSave);
    });

    it("should call deleteFile from the backend with the correct parameters (others than in test 1)", () => {
        //setup
        let pathToSave: string = "\\1\\1.json";

        //method to test
        contentFileService.init(pathToFolder);
        contentFileService.deleteFile(1)

        //tests
        expect(mockBackendFileService.deleteFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.deleteFile).toHaveBeenCalledWith(pathToFolder + pathToSave);
    });
});

describe("init() and load() ", () => {
    it("should call loadFile from the backend with the correct parameters ", async () => {
        //setup
        let pathToLoad: string = "\\0\\0.json";
        let returnedJSON:any;
        mockBackendFileService.loadFile.mockImplementationOnce(()=>{
            return new Promise((resolve,reject)=>{
                resolve(fileData)
            })
        });

        //method to test
        contentFileService.init(pathToFolder);
        returnedJSON = await contentFileService.loadFile(0);

        //tests
        expect(mockBackendFileService.loadFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.loadFile).toHaveBeenCalledWith(pathToFolder + pathToLoad);
        expect(returnedJSON).toEqual(jsonToSave);
    });

    it("should return an empty JSON if the backend returned null (the file does not exist)", async () => {
        //setup
        let returnedJSON:any;
        mockBackendFileService.loadFile.mockImplementationOnce(()=>{
            return new Promise((resolve,reject)=>{
                resolve(null)
            })
        });

        //method to test
        contentFileService.init(pathToFolder);
        returnedJSON = await contentFileService.loadFile(0);

        //tests
        expect(returnedJSON).toEqual({});
    });
});

describe("init () and fileExists() ", () => {
    it("should return true if backendFileService.fileExists returns true", async () => {
        //setup
        let answer: boolean;
        let pathToLoad: string = "\\0\\0.json";

        mockBackendFileService.fileExists.mockImplementationOnce((path: string): Promise<boolean> => {
            console.log("MOCK PATH: ", path, pathToLoad)
            return new Promise((resolve) =>{
                if (path === pathToFolder + pathToLoad)
                    resolve(true)
                else
                    resolve(false)
            });
        });

        //method to test
        contentFileService.init(pathToFolder);
        answer = await contentFileService.fileExists(0);

        //tests
        expect(answer).toBe(true);
    });

    it("should return false if backendFileService.fileExists returns false", async () => {
        //setup
        let answer: boolean;
        let pathToLoad: string = "\\1\\1.json";

        mockBackendFileService.fileExists.mockImplementationOnce((path: string): Promise<boolean> => {
            return new Promise((resolve) =>{
                if (path === pathToLoad)
                    resolve(true)
                else
                    resolve(false)
            });
        });

        //method to test
        contentFileService.init(pathToFolder);
        answer = await contentFileService.fileExists(2)

        //tests
        expect(answer).toBe(false);
    });
});