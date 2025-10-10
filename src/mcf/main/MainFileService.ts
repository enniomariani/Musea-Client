import * as fs from 'fs';
import path from "node:path";

export const FileServiceMessage = {
    ERROR_FILE_EXISTS: "FileService: file already exists, and overwriting is deactivated",
    ERROR_DIRECTORY_DOES_NOT_EXIST: "FileService: folder does not exist!",
    FILE_SAVED_SUCCESSFULLY: "FileService: file saved",
    FILE_OR_FOLDER_CAN_NOT_BE_DELETED: "FileService: file or folder can not be deleted!",
    FILE_DELETED_SUCCESSFULLY: "FileService: file or folder deleted"
} as const;

export type FileServiceMessage = typeof FileServiceMessage[keyof typeof FileServiceMessage];

export class MainFileService {
    constructor() {}

    /**
     * Write a file to the passed path. If overrideExistingFile is false, it returns an error if the file already exists
     */
    async saveFile(filePath:string, fileData:Buffer, overrideExistingFile:boolean = true, createDirectory:boolean = true):Promise<FileServiceMessage>{
        const directory:string = path.dirname(filePath);

        if(!fs.existsSync(directory)){
            if(!createDirectory)
                return FileServiceMessage.ERROR_DIRECTORY_DOES_NOT_EXIST;
            else
                fs.mkdirSync(directory,{ recursive: true })
        }

        if(!overrideExistingFile && fs.existsSync(filePath))
            return FileServiceMessage.ERROR_FILE_EXISTS;

        await new Promise<void>((resolve, reject) => {
            fs.writeFile(filePath, fileData, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });

        return FileServiceMessage.FILE_SAVED_SUCCESSFULLY;
    }

    fileExists(path:string):boolean{
        return fs.existsSync(path);
    }

    /**
     * Delete files and directories (recursive)
     */
    delete(path:string):FileServiceMessage{
        try {
            fs.rmSync(path);
            return FileServiceMessage.FILE_DELETED_SUCCESSFULLY;
        } catch (error) {
            return FileServiceMessage.FILE_OR_FOLDER_CAN_NOT_BE_DELETED;
        }
    }

    async loadFile(filePath: string): Promise<Buffer | null> {
        try {
            let loadedFile:Buffer = await fs.promises.readFile(filePath);
            return loadedFile;
        } catch (error:any) {
            console.error("MainFileService: Failed to load file:", filePath, "Error:", error.message);
            return null;
        }
    }

    getAllFileNamesInFolder(pathToFolder:string):string[]{
        if(fs.existsSync(pathToFolder)){
            const filesAndFolders:string[] = fs.readdirSync(pathToFolder);

            const files:string[] = filesAndFolders.filter((item) => {
                const itemPath:string = path.join(pathToFolder, item);
                const stats:fs.Stats = fs.statSync(itemPath);
                return stats.isFile();
            });

            return files;
        } else
            return [];
    }
}