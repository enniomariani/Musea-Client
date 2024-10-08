import * as fs from 'fs';
import path from "node:path";

export class MainFileService {

    static ERROR_FILE_EXISTS:string = "FileService: file already exists, and overwriting is deactivated";
    static ERROR_DIRECTORY_DOES_NOT_EXIST:string = "FileService: folder does not exist!";
    static FILE_SAVED_SUCCESSFULLY:string = "FileService: file saved";
    static FILE_OR_FOLDER_CAN_NOT_BE_DELETED:string = "FileService: file or folder can not be deleted!";
    static FILE_DELETED_SUCCESSFULLY:string = "FileService: file or folder deleted";

    constructor() {}

    /**
     * writes a file to the passed path. If overrideExistingFile is false, it returns an error if the file already exists
     *
     * @param {string} filePath
     * @param {Buffer} fileData
     * @param {boolean} overrideExistingFile
     * @param {boolean} createDirectory
     * @returns {string}
     */
    async saveFile(filePath:string, fileData:Buffer, overrideExistingFile:boolean = true, createDirectory:boolean = true):Promise<string>{

        console.log("MainFileService: save File to: ", filePath)

        //this conversion is necessary because ArrayBufferView is a class from the web-context
        const directory:string = path.dirname(filePath);

        if(!fs.existsSync(directory)){
            if(!createDirectory)
                return MainFileService.ERROR_DIRECTORY_DOES_NOT_EXIST;
            else
                fs.mkdirSync(directory,{ recursive: true })
        }

        if(!overrideExistingFile && fs.existsSync(filePath))
            return MainFileService.ERROR_FILE_EXISTS;

        await new Promise<void>((resolve, reject) => {
            fs.writeFile(filePath, fileData, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });

        fileData = null;

        return MainFileService.FILE_SAVED_SUCCESSFULLY;
    }

    fileExists(path:string):boolean{
        return fs.existsSync(path);
    }

    /**
     * deletes files and directories (recursive)
     *
     * @param {string} path
     */
    delete(path:string):string{
        try {
            fs.rmSync(path);
            return MainFileService.FILE_DELETED_SUCCESSFULLY;
        } catch (error) {
            return MainFileService.FILE_OR_FOLDER_CAN_NOT_BE_DELETED;
        }
    }

    async loadFile(filePath: string): Promise<Buffer | null> {
        console.log("Attempting to load file: ", filePath);

        try {
            let loadedFile:Buffer = await fs.promises.readFile(filePath);
            console.log("MainFileService: File loaded successfully!");
            return loadedFile;
        } catch (error) {
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

            console.log("Files found in folder: ", files)
            return files;
        } else
            return [];
    }
}