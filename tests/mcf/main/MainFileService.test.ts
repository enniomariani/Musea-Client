import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MainFileService} from "../../../src/js/mcf/main/MainFileService";
import * as fs from 'fs';
import * as path from "node:path";

let fileService: MainFileService;
jest.mock("fs", () => ({
    promises: {
        readFile: jest.fn()
    },
    existsSync: jest.fn(),
    writeFile: jest.fn(),
    readdirSync: jest.fn(),
    statSync: jest.fn(),
    rmSync: jest.fn(),
    mkdirSync: jest.fn(),
}));

let mockedFs = fs as jest.Mocked<typeof fs>;


beforeEach(() => {


    fileService = new MainFileService();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("saveFile () ", () => {
    it("should call fs.writeFile with the correct path and the passed file-data as ArrayBufferView", async () => {
        //setup
        let filePath: string = "/path/to/existent/directory/file.txt";
        const directory = path.dirname(filePath);
        let fileData: Uint8Array = new Uint8Array([0x00, 0xFF, 0xEF]);
        let buffer = Buffer.from(fileData);
        let returnValue: string;
        mockedFs.existsSync.mockImplementation((path: string): boolean => {
            if (path === filePath)
                return false;
            else if (path === directory)
                return true;
        });
        // @ts-ignore
        mockedFs.writeFile.mockImplementation((path, data, callback) => callback(null));

        //method to test
        returnValue = await fileService.saveFile(filePath, buffer);

        //expect
        expect(fs.writeFile).toHaveBeenCalledTimes(1);
        expect(fs.writeFile).toHaveBeenCalledWith(filePath, buffer, expect.anything());
        expect(returnValue).toEqual(MainFileService.FILE_SAVED_SUCCESSFULLY);
    });

    it("should return an error if the passed parameter overrideExistingFile is true and the file already exists", async () => {
        //setup
        let filePath: string = "/path/to/existent/directory/file.txt";
        const directory = path.dirname(filePath);
        let returnValue: string;
        let fileData: Uint8Array = new Uint8Array([0x00, 0xFF, 0xEF]);
        mockedFs.existsSync.mockImplementation((path: string): boolean => {
            if (path === filePath)
                return true;
            else if (path === directory)
                return true;
        });
        // @ts-ignore
        mockedFs.writeFile.mockImplementation((path, data, callback) => callback(null));

        //method to test
        returnValue = await fileService.saveFile(filePath, Buffer.from(fileData), false);

        //method to test / expect
        expect(returnValue).toEqual(MainFileService.ERROR_FILE_EXISTS);
        expect(fs.writeFile).toHaveBeenCalledTimes(0);
    });

    it("should return an error if the folder where the file should be saved does not exist and createDirectory is false", async () => {
        //setup
        let filePath: string = "/path/to/nonexistent/directory/file.txt";
        const directory:string = path.dirname(filePath);
        let returnValue: string;
        let fileData: Uint8Array = new Uint8Array([0x00, 0xFF, 0xEF]);
        mockedFs.existsSync.mockImplementation((path: string) => {
            if (path === filePath)
                return false;
            else if (path === directory)
                return false;
        });

        // @ts-ignore
        mockedFs.writeFile.mockImplementation((path, data, callback) => callback(null));

        //method to test
        returnValue = await fileService.saveFile(filePath, Buffer.from(fileData), false, false);

        //method to test / expect
        expect(returnValue).toBe(MainFileService.ERROR_DIRECTORY_DOES_NOT_EXIST);
        expect(fs.writeFile).toHaveBeenCalledTimes(0);
    });

    it("should create the folder where the file should be saved if the folder does not exist and createDirectory is true", async () => {
        //setup
        let filePath: string = "/path/to/nonexistent/directory/file.txt";
        const directory:string = path.dirname(filePath);
        let returnValue: string;
        let fileData: Uint8Array = new Uint8Array([0x00, 0xFF, 0xEF]);
        let buffer = Buffer.from(fileData);
        mockedFs.existsSync.mockImplementation((path: string) => {
            if (path === filePath)
                return false;
            else if (path === directory)
                return false;
        });

        // @ts-ignore
        mockedFs.writeFile.mockImplementation((path, data, callback) => callback(null));

        //method to test
        returnValue = await fileService.saveFile(filePath, Buffer.from(fileData), false, true);

        //method to test / expect
        expect(returnValue).toBe(MainFileService.FILE_SAVED_SUCCESSFULLY);
        expect(fs.writeFile).toHaveBeenCalledTimes(1);
        expect(fs.writeFile).toHaveBeenCalledWith(filePath, buffer, expect.anything());
        expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
        expect(fs.mkdirSync).toHaveBeenCalledWith(directory, {recursive: true});
    });
});

describe("delete () ", () => {
    it("should call fs.rmSync if a file is passed", () => {
        //setup
        let filePath: string = "/path/to/nonexistent/directory/file.txt";
        let returnValue: string;

        //method to test
        returnValue = fileService.delete(filePath);

        //method to test / expect
        expect(fs.rmSync).toHaveBeenCalledTimes(1);
        expect(fs.rmSync).toHaveBeenCalledWith(filePath);
        expect(returnValue).toBe(MainFileService.FILE_DELETED_SUCCESSFULLY);
    });

    it("should call fs.rmSync if a folder-path is passed", () => {
        //setup
        let folderPath: string = "/path/to/nonexistent/directory";
        let returnValue: string;

        //method to test
        returnValue = fileService.delete(folderPath);

        //method to test / expect
        expect(fs.rmSync).toHaveBeenCalledTimes(1);
        expect(fs.rmSync).toHaveBeenCalledWith(folderPath);
        expect(returnValue).toBe(MainFileService.FILE_DELETED_SUCCESSFULLY);
    });

    it("should return an error string if file or folder cannot be deleted", () => {
        //setup
        let folderPath: string = "/path/to/nonexistent/directory";
        let returnValue: string;

        mockedFs.rmSync.mockImplementation(() => {
            throw new Error("file cannot be deleted");
        });

        //method to test
        returnValue = fileService.delete(folderPath);

        //method to test / expect
        expect(returnValue).toBe(MainFileService.FILE_OR_FOLDER_CAN_NOT_BE_DELETED);
    });
});

describe("loadFile () ", () => {

    it("should return the correct fileData if a file is loaded", async() => {
        //setup
        let filePath: string = "/path/to/nonexistent/directory/file.txt";
        let fileData: Buffer = new Buffer([0x00, 0xFF, 0xEF]);
        let returnValue: Buffer;

        // @ts-ignore
        mockedFs.promises.readFile.mockResolvedValue(fileData);

        //method to test
        returnValue = await fileService.loadFile(filePath);

        //method to test / expect
        expect(returnValue).toEqual(Buffer.from(fileData));
    });

    it("should return null if the file could not be loaded", async () => {
        //setup
        let filePath: string = "/path/to/nonexistent/directory/file.txt";
        let returnValue: ArrayBufferView;

        mockedFs.promises.readFile.mockRejectedValue(new Error("file cannot be loaded"));

        //method to test
        returnValue = await fileService.loadFile(filePath);

        //method to test / expect
        expect(returnValue).toEqual(null);
    });
});

describe("fileExists () ", () => {
    it("should return true if fs.existsSync returns true", () => {
        //setup
        let filePath: string = "/path/to/existent/directory/file.txt";
        let returnValue: boolean;

        mockedFs.existsSync.mockImplementation((path: string): boolean => {
            return true
        });

        //method to test
        returnValue = fileService.fileExists(filePath);

        //method to test / expect
        expect(returnValue).toBe(true);
    });

    it("should return false if fs.existsSync returns false", () => {
        //setup
        let filePath: string = "/path/to/nonexistent/directory/file.txt";
        let returnValue: boolean;

        mockedFs.existsSync.mockImplementation((path: string): boolean => {
            return false
        });

        //method to test
        returnValue = fileService.fileExists(filePath);

        //method to test / expect
        expect(returnValue).toBe(false);
    });
})

describe("getAllFileNamesInFolder() ", () => {
    //setup
    const folderPath: string = "/path/to/existent/directory/";

    it("should return an array of all file-names without the folder-names in the passed folder-directory", () => {
        //setup
        let returnValue: string[];
        let fileNames:string[] = ["file1.txt", "file2.jpeg", "file3.png", "file4.mp4"];
        const allFilesAndFolderNames: string[] = [fileNames[0], "folderName1", fileNames[1], fileNames[2], fileNames[3], "folderName2"];

        mockedFs.existsSync.mockImplementation((path: string): any => {
            if(path === folderPath)
                return true;
            else
                return false;
        });

        mockedFs.readdirSync.mockImplementation((path: string): any => {
            if(path === folderPath)
                return allFilesAndFolderNames;
        });

        mockedFs.statSync.mockImplementation((path: string): any =>{
            const splittedPath:string[] = path.split("\\");
            const fileOrFolderName:string = splittedPath.pop();

            return {isFile: ()=>{
                if(fileNames.indexOf(fileOrFolderName) >= 0)
                    return true;
                else
                    return false;
            }}
        });

        //method to test
        returnValue = fileService.getAllFileNamesInFolder(folderPath);

        //tests
        expect(returnValue).toEqual(fileNames);
    });

    it("should return an empty array if no file-names are found, only folders", () => {
        //setup
        let returnValue: string[];
        const allFilesAndFolderNames: string[] = ["folderName1", "folderName2"];

        mockedFs.existsSync.mockImplementation((path: string): any => {
            if(path === folderPath)
                return true;
            else
                return false;
        });

        mockedFs.readdirSync.mockImplementation((path: string): any => {
            if(path === folderPath)
                return allFilesAndFolderNames;
        });

        mockedFs.statSync.mockImplementation((path: string): any =>{
            return {isFile: ()=>{
                        return false;
                }}
        });

        //method to test
        returnValue = fileService.getAllFileNamesInFolder(folderPath);

        //tests
        expect(returnValue).toEqual([]);
    });

    it("should return an empty array if no files and folders are found", () => {
        //setup
        let returnValue: string[];

        mockedFs.existsSync.mockImplementation((path: string): any => {
            if(path === folderPath)
                return true;
            else
                return false;
        });

        mockedFs.readdirSync.mockImplementation((path: string): any => {
            if(path === folderPath)
                return [];
        });

        mockedFs.statSync.mockImplementation((path: string): any =>{
            return {isFile: ()=>{
                    return false;
                }}
        });

        //method to test
        returnValue = fileService.getAllFileNamesInFolder(folderPath);

        //tests
        expect(returnValue).toEqual([]);
    });

    it("should return an empty array if the folder does not exist", () => {
        //setup
        let returnValue: string[];

        mockedFs.existsSync.mockImplementation((path: string): any => {
                return false;
        });

        mockedFs.readdirSync.mockImplementation((path: string): any => {
            throw new Error("ERROR, FOLDER DOES NOT EXIST!")
        });

        //method to test
        returnValue = fileService.getAllFileNamesInFolder(folderPath);

        //tests
        expect(returnValue).toEqual([]);
    });
});