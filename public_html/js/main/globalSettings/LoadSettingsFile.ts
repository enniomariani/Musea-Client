import {readFileSync} from "fs";


export class LoadSettingsFile{
    constructor() {
    }

    /**
     * loads the file (UTF-8 encoded) from the passed filepath.
     *
     * @param absoluteFilePath
     * @returns {any}  returns a JSON-object if the file was found, if not, returns null
     */
    loadJSONSync(absoluteFilePath:string):any{
        let loadedData:string = null;
        let parsedJSON:any = null;

        try {
            loadedData = readFileSync(absoluteFilePath, 'utf8');
        } catch (err) {
            console.error('Error reading the file:', err);
            return null;
        }

        try{
            parsedJSON = JSON.parse(loadedData);
        }catch (err){
            console.error('Loaded data is not valid JSON!', loadedData);
            return null;
        }

        return parsedJSON;
    }
}