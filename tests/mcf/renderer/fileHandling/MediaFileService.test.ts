import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MediaFileService} from "renderer/fileHandling/MediaFileService.js";
import {ICachedMedia} from "renderer/fileHandling/MediaFileCacheHandler.js";
import {IMainFileService} from "main/MediaClientFrameworkMain.js";

let mediaFileService:MediaFileService;

const mockBackendFileService: jest.Mocked<IMainFileService> = {
    saveFile: jest.fn(),
    saveFileByPath: jest.fn(),
    loadFile: jest.fn(),
    deleteFile: jest.fn(),
    fileExists: jest.fn(),
    getAllFileNamesInFolder: jest.fn()
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
        const fileData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let pathToSave:string = "0\\cachedMedia\\2.1.jpeg";

        mediaFileService.init(pathToFolder);
        mediaFileService.saveFile(0, 2,1,"jpeg", fileData)

        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFile).toHaveBeenCalledWith(pathToFolder + pathToSave, fileData);
    });

    it("should call saveFile from the backend with the correct parameters (others than in test 1)", () => {
        const fileData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let pathToSave:string = "0\\cachedMedia\\2.5.mp4";

        mediaFileService.init(pathToFolder);
        mediaFileService.saveFile(0, 2,5,"mp4", fileData)

        expect(mockBackendFileService.saveFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFile).toHaveBeenCalledWith(pathToFolder + pathToSave, fileData);
    });
});

describe("init() and saveFileByPath() ", () => {
    const fileName = 'mockFile.txt';
    const fileContent = 'Hello, world!';
    const fileType = 'text/plain';

    const mockFile = new File([fileContent], fileName, { type: fileType });

    it("should call saveFileByPath from the backend with the correct parameters", () => {

        let pathToSave:string = "0\\cachedMedia\\2.1.jpeg";

        mediaFileService.init(pathToFolder);
        mediaFileService.saveFileByPath(0, 2,1,"jpeg", mockFile)

        expect(mockBackendFileService.saveFileByPath).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFileByPath).toHaveBeenCalledWith(pathToFolder + pathToSave, mockFile);
    });

    it("should call saveFile from the backend with the correct parameters (others than in test 1)", () => {
        let pathToSave:string = "0\\cachedMedia\\2.5.mp4";

        mediaFileService.init(pathToFolder);
        mediaFileService.saveFileByPath(0, 2,5,"mp4", mockFile)

        expect(mockBackendFileService.saveFileByPath).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.saveFileByPath).toHaveBeenCalledWith(pathToFolder + pathToSave, mockFile);
    });
});

describe("init() and deleteFile() ", () => {
    it("should call deleteFile from the backend with the correct parameters", () => {
        let pathToSave:string = "0\\cachedMedia\\2.1.jpeg";

        mediaFileService.init(pathToFolder);
        mediaFileService.deleteFile(0, 2,1,"jpeg")

        expect(mockBackendFileService.deleteFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.deleteFile).toHaveBeenCalledWith(pathToFolder + pathToSave);
    });

    it("should call deleteFile from the backend with the correct parameters (others than in test 1)", () => {
        let pathToSave:string = "0\\cachedMedia\\2.5.mp4";

        mediaFileService.init(pathToFolder);
        mediaFileService.deleteFile(0, 2,5,"mp4")

        expect(mockBackendFileService.deleteFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.deleteFile).toHaveBeenCalledWith(pathToFolder + pathToSave);
    });
});

describe("init() and loadFile() ", () => {
    it("should call loadFile from the backend with the correct parameters ", async () => {
        let fileData:Uint8Array | null;
        let loadedFileData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let pathToLoad:string = "0\\cachedMedia\\2.1.jpeg";

        mockBackendFileService.loadFile.mockImplementationOnce(()=>{
           return new Promise((resolve,reject)=>{
               resolve(loadedFileData)
           })
        });

        mediaFileService.init(pathToFolder);
        fileData = await mediaFileService.loadFile(0, 2,1,"jpeg")

        expect(mockBackendFileService.loadFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.loadFile).toHaveBeenCalledWith(pathToFolder + pathToLoad);
        expect(fileData).toEqual(loadedFileData);
    });

    it("should call loadFile from the backend with the correct parameters  (others than in test 1)", async () => {
        let loadedFileData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let pathToLoad:string = "0\\cachedMedia\\2.5.mp4";

        mockBackendFileService.loadFile.mockImplementationOnce(()=>{
            return new Promise((resolve,reject)=>{
                resolve(loadedFileData)
            })
        });

        mediaFileService.init(pathToFolder);
        const fileData:Uint8Array|null = await mediaFileService.loadFile(0, 2,5,"mp4")

        expect(mockBackendFileService.loadFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.loadFile).toHaveBeenCalledWith(pathToFolder + pathToLoad);
        expect(fileData).toEqual(loadedFileData);
    });

    it("should return null if the backend returned null (the file does not exist)", async () => {
        let pathToLoad:string = "0\\cachedMedia\\2.5.mp4";

        mockBackendFileService.loadFile.mockImplementationOnce(()=>{
            return new Promise((resolve,reject)=>{
                resolve(null)
            })
        });

        mediaFileService.init(pathToFolder);
        const fileData:Uint8Array|null = await mediaFileService.loadFile(0, 2,5,"mp4")

        expect(mockBackendFileService.loadFile).toHaveBeenCalledTimes(1);
        expect(mockBackendFileService.loadFile).toHaveBeenCalledWith(pathToFolder + pathToLoad);
        expect(fileData).toEqual(null);
    });
});

describe("init () and fileExists() ", () => {
    it("should return true if backendFileService.fileExists returns true", async () => {
        let answer:boolean;
        let pathToLoad:string = pathToFolder + "0\\cachedMedia\\2.1.jpeg";

        mockBackendFileService.fileExists.mockImplementationOnce((path:string):Promise<boolean> =>{
            console.log("MOCK PATH: ", path, pathToLoad)

            return new Promise((resolve) =>{
                if(path === pathToLoad)
                    resolve(true);
                else
                    resolve(false);
            })

        });

        mediaFileService.init(pathToFolder);
        answer = await mediaFileService.fileExists(0, 2,1,"jpeg")

        expect(answer).toBe(true);
    });

    it("should return false if backendFileService.fileExists returns false", async () => {
        let answer:boolean;
        let pathToLoad:string = "0\\cachedMedia\\6.2.jpeg";

        mockBackendFileService.fileExists.mockImplementationOnce((path:string):Promise<boolean>=>{
            return new Promise((resolve) =>{
                if(path === pathToLoad)
                    resolve(true);
                else
                    resolve(false);
            })
        });

        mediaFileService.init(pathToFolder);
        answer = await mediaFileService.fileExists(0, 2,1,"jpeg")

        expect(answer).toBe(false);
    });
});

describe("init () and getAllCachedMedia() ", () => {
    it("should return the data in form of an ICachedMedia-array of the loaded-file-names from the backend", async () => {
        let answer:ICachedMedia[];
        const expectedAnswer:ICachedMedia[]= [
            {contentId: 1, mediaAppId: 2, fileExtension: "png"},
            {contentId: 2, mediaAppId: 3, fileExtension: "jpeg"},
            {contentId: 5, mediaAppId: 0, fileExtension: "mp4"},
            {contentId: 0, mediaAppId: 0, fileExtension: "jpeg"},
            {contentId: 0, mediaAppId: 1, fileExtension: "jpeg"}
        ]
        let fileNames:string[] = ["1.2.png", "2.3.jpeg", "5.0.mp4", "0.0.jpeg", "0.1.jpeg"]

        mockBackendFileService.getAllFileNamesInFolder.mockImplementationOnce((path:string):Promise<string[]> =>{
            console.log("MOCK PATH: ", path, pathToFolder)

            return new Promise((resolve) =>{
                if(path === pathToFolder + "0\\cachedMedia\\")
                    resolve(fileNames);
                else
                    resolve([]);
            })
        });

        mediaFileService.init(pathToFolder);
        answer = await mediaFileService.getAllCachedMedia(0);

        expect(answer).toEqual(expectedAnswer);
    });

    it("should return an empty array if there were no files in the folder", async () => {
        let answer:ICachedMedia[];
        mockBackendFileService.getAllFileNamesInFolder.mockImplementationOnce((path:string):Promise<string[]> =>{
            return new Promise((resolve) =>{
                    resolve([]);
            })
        });

        mediaFileService.init(pathToFolder);
        answer = await mediaFileService.getAllCachedMedia(0);

        expect(answer).toEqual([]);
    });

    it("should throw an error if a file does have less than two points in it", async () => {
        let fileNames:string[] = ["1.2.png", "23.jpeg", "5.0.mp4", "0.0.jpeg", "0.1.jpeg"]

        mockBackendFileService.getAllFileNamesInFolder.mockImplementationOnce((path:string):Promise<string[]> =>{

            return new Promise((resolve) =>{
                if(path === pathToFolder + "0\\cachedMedia\\")
                    resolve(fileNames);
                else
                    resolve([]);
            })
        });

        mediaFileService.init(pathToFolder);
        expect(mediaFileService.getAllCachedMedia(0)).rejects.toThrow(Error("Not-valid file found in the cache-folder: 23.jpeg"));
    });

    it("should throw an error if a file does have more than two points in it", async () => {
        let fileNames:string[] = ["1.2.png", "2.2.3.jpeg", "5.0.mp4", "0.0.jpeg", "0.1.jpeg"]

        mockBackendFileService.getAllFileNamesInFolder.mockImplementationOnce((path:string):Promise<string[]> =>{

            return new Promise((resolve) =>{
                if(path === pathToFolder + "0\\cachedMedia\\")
                    resolve(fileNames);
                else
                    resolve([]);
            })
        });

        mediaFileService.init(pathToFolder);
        expect(mediaFileService.getAllCachedMedia(0)).rejects.toThrow(Error("Not-valid file found in the cache-folder: 2.2.3.jpeg"));
    });
});