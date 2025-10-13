import {IMainFileService} from "main/MediaClientFrameworkMain.js";
import { jest } from '@jest/globals';

export class MockBackendFileService implements IMainFileService{

    saveFile: jest.Mock<(path: string, data: Uint8Array<ArrayBufferLike>) => Promise<string>>;
    saveFileByPath: jest.Mock<(path: string, fileInstance: File) => Promise<string>>;
    loadFile: jest.Mock<(path: string) => Promise<Uint8Array<ArrayBufferLike> | null>>;
    deleteFile: jest.Mock<(path: string) => string>;
    fileExists: jest.Mock<(path: string) => Promise<boolean>>;
    getAllFileNamesInFolder: jest.Mock<(path: string) => Promise<string[]>>;

    constructor() {
        this.saveFile = jest.fn();
        this.saveFileByPath = jest.fn();
        this.loadFile = jest.fn();
        this.deleteFile = jest.fn();
        this.fileExists = jest.fn();
        this.getAllFileNamesInFolder = jest.fn();
    }
}