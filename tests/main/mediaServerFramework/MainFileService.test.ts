import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MainFileService} from "../../../public_html/js/main/mediaClientFramework/MainFileService";
import * as fs from 'fs';
import * as path from "node:path";

let fileService: MainFileService;
jest.mock('fs');
let mockedFs = fs as jest.Mocked<typeof fs>;

beforeEach(() => {
    fileService = new MainFileService();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("saveFile () ", () => {
    it("should call fs.save with the correct path and the passed file-data as ArrayBufferView", () => {
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

        //method to test
        returnValue = fileService.saveFile(filePath, buffer);

        //expect
        expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
        expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, buffer);
        expect(returnValue).toEqual(MainFileService.FILE_SAVED_SUCCESSFULLY);
    });

    it("should return an error if the passed parameter overrideExistingFile is true and the file already exists", () => {
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

        //method to test
        returnValue = fileService.saveFile(filePath, Buffer.from(fileData), false);

        //method to test / expect
        expect(returnValue).toEqual(MainFileService.ERROR_FILE_EXISTS);
        expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
    });

    it("should return an error if the folder where the file should be saved does not exist and createDirectory is false", () => {
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

        //method to test
        returnValue = fileService.saveFile(filePath, Buffer.from(fileData), false, false);

        //method to test / expect
        expect(returnValue).toBe(MainFileService.ERROR_DIRECTORY_DOES_NOT_EXIST);
        expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
    });

    it("should create the folder where the file should be saved if the folder does not exist and createDirectory is true", () => {
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

        //method to test
        returnValue = fileService.saveFile(filePath, Buffer.from(fileData), false, true);

        //method to test / expect
        expect(returnValue).toBe(MainFileService.FILE_SAVED_SUCCESSFULLY);
        expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
        expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, buffer);
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
    it("should return the correct fileData if a file is loaded", () => {
        //setup
        let filePath: string = "/path/to/nonexistent/directory/file.txt";
        let fileData: Uint8Array = new Uint8Array([0x00, 0xFF, 0xEF]);
        let returnValue: Buffer;

        mockedFs.readFileSync.mockImplementation((path: string): any => {
            const buffer: Buffer = Buffer.from(fileData);
            if (path === filePath)
                return buffer as Buffer;
            return null;
        });

        //method to test
        returnValue = fileService.loadFile(filePath);

        //method to test / expect
        expect(returnValue).toEqual(Buffer.from(fileData));
    });

    it("should return null if the file could not be loaded", () => {
        //setup
        let filePath: string = "/path/to/nonexistent/directory/file.txt";
        let returnValue: ArrayBufferView;

        mockedFs.readFileSync.mockImplementation(() => {
            throw new Error("file cannot be loaded");
        });

        //method to test
        returnValue = fileService.loadFile(filePath);

        //method to test / expect
        expect(returnValue).toEqual(null);
    });
});