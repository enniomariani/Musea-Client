import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MediaFileService} from "../../../../src/js/renderer/mediaClientFramework/fileHandling/MediaFileService";

let mediaFileService:MediaFileService;

const mockBackendFileService: jest.Mocked<IBackendFileService> = {
    saveFile: jest.fn(),
    loadFile: jest.fn(),
    deleteFile: jest.fn(),
    fileExists: jest.fn()
}

const pathToFolder:string = "path-to-folder";

beforeEach(() => {
    mediaFileService = new MediaFileService(mockBackendFileService);
});

afterEach(() => {
    jest.clearAllMocks();
});


describe("init() and saveFile() ", () => {
    it("should call saveFile from the backend with the correct parameters", () => {
        //setup
        const fileData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let pathToSave:string = "0\\2.1.jpeg";

        //method to test
        mediaFileService.init(pathToFolder);
        mediaFileService.saveFile(0, 2,1,"jpeg", fileData)

        //tests
        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFile).toHaveBeenCalledWith(pathToFolder + pathToSave, fileData);
    });

    it("should call saveFile from the backend with the correct parameters (others than in test 1)", () => {
        //setup
        const fileData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let pathToSave:string = "0\\2.5.mp4";

        //method to test
        mediaFileService.init(pathToFolder);
        mediaFileService.saveFile(0, 2,5,"mp4", fileData)

        //tests
        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFile).toHaveBeenCalledWith(pathToFolder + pathToSave, fileData);
    });
});

describe("init() and deleteFile() ", () => {
    it("should call deleteFile from the backend with the correct parameters", () => {
        //setup
        let pathToSave:string = "0\\2.1.jpeg";

        //method to test
        mediaFileService.init(pathToFolder);
        mediaFileService.deleteFile(0, 2,1,"jpeg")

        //tests
        expect(mockBackendFileService.deleteFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.deleteFile).toHaveBeenCalledWith(pathToFolder + pathToSave);
    });

    it("should call deleteFile from the backend with the correct parameters (others than in test 1)", () => {
        //setup
        let pathToSave:string = "0\\2.5.mp4";

        //method to test
        mediaFileService.init(pathToFolder);
        mediaFileService.deleteFile(0, 2,5,"mp4")

        //tests
        expect(mockBackendFileService.deleteFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.deleteFile).toHaveBeenCalledWith(pathToFolder + pathToSave);
    });
});

describe("init() and loadFile() ", () => {
    it("should call loadFile from the backend with the correct parameters ", async () => {
        //setup
        let fileData:Uint8Array;
        let loadedFileData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let pathToLoad:string = "0\\2.1.jpeg";

        mockBackendFileService.loadFile.mockImplementationOnce(()=>{
           return new Promise((resolve,reject)=>{
               resolve(loadedFileData)
           })
        });

        //method to test
        mediaFileService.init(pathToFolder);
        fileData = await mediaFileService.loadFile(0, 2,1,"jpeg")

        //tests
        expect(mockBackendFileService.loadFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.loadFile).toHaveBeenCalledWith(pathToFolder + pathToLoad);
        expect(fileData).toEqual(loadedFileData);
    });

    it("should call loadFile from the backend with the correct parameters  (others than in test 1)", async () => {
        //setup
        let fileData:Uint8Array;
        let loadedFileData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let pathToLoad:string = "0\\2.5.mp4";

        mockBackendFileService.loadFile.mockImplementationOnce(()=>{
            return new Promise((resolve,reject)=>{
                resolve(loadedFileData)
            })
        });

        //method to test
        mediaFileService.init(pathToFolder);
        fileData = await mediaFileService.loadFile(0, 2,5,"mp4")

        //tests
        expect(mockBackendFileService.loadFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.loadFile).toHaveBeenCalledWith(pathToFolder + pathToLoad);
        expect(fileData).toEqual(loadedFileData);
    });

    it("should return null if the backend returned null (the file does not exist)", async () => {
        //setup
        let fileData:Uint8Array;
        let pathToLoad:string = "0\\2.5.mp4";

        mockBackendFileService.loadFile.mockImplementationOnce(()=>{
            return new Promise((resolve,reject)=>{
                resolve(null)
            })
        });

        //method to test
        mediaFileService.init(pathToFolder);
        fileData = await mediaFileService.loadFile(0, 2,5,"mp4")

        //tests
        expect(mockBackendFileService.loadFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.loadFile).toHaveBeenCalledWith(pathToFolder + pathToLoad);
        expect(fileData).toEqual(null);
    });
});

describe("init () and fileExists() ", () => {
    it("should return true if backendFileService.fileExists returns true", async () => {
        //setup
        let answer:boolean;
        let pathToLoad:string = pathToFolder + "0\\2.1.jpeg";

        mockBackendFileService.fileExists.mockImplementationOnce((path:string):Promise<boolean> =>{
            console.log("MOCK PATH: ", path, pathToLoad)

            return new Promise((resolve) =>{
                if(path === pathToLoad)
                    resolve(true);
                else
                    resolve(false);
            })

        });

        //method to test
        mediaFileService.init(pathToFolder);
        answer = await mediaFileService.fileExists(0, 2,1,"jpeg")

        //tests
        expect(answer).toBe(true);
    });

    it("should return false if backendFileService.fileExists returns false", async () => {
        //setup
        let answer:boolean;
        let pathToLoad:string = "0\\6.2.jpeg";

        mockBackendFileService.fileExists.mockImplementationOnce((path:string):Promise<boolean>=>{
            return new Promise((resolve) =>{
                if(path === pathToLoad)
                    resolve(true);
                else
                    resolve(false);
            })
        });

        //method to test
        mediaFileService.init(pathToFolder);
        answer = await mediaFileService.fileExists(0, 2,1,"jpeg")

        //tests
        expect(answer).toBe(false);
    });
});