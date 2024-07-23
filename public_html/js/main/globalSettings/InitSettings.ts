import {ipcMain} from "electron";
import {dirname, join} from "path";
import {LoadSettingsFile} from "./LoadSettingsFile";
import {ValidateSettingsJson} from "./ValidateSettingsJson";
import {ValidationError, ValidatorResult} from "jsonschema";
import {GlobalSettings} from "./GlobalSettings";
import {GlobalSettingsFactory} from "./GlobalSettingsFactory";
import {fileURLToPath} from "url";


export class InitSettings {
    private settingsValidationErrors: (string|ValidationError)[] = [];

    //name of the settings-file
    private fileNameSettings: string = "settings.txt";
    private _dirname: string = dirname(fileURLToPath(import.meta.url));

    constructor() {}

    /**
     * loads the settings.txt file, sets the global settings and overrides the values of the global settings with the values found in the settings-file
     */
    init(environment:string):any{
        let loadSettingsFile: LoadSettingsFile = new LoadSettingsFile();
        let jsonValidation: ValidateSettingsJson = new ValidateSettingsJson();
        let settingsJSON: any = null;
        let filePath: string
        let validationResult: ValidatorResult;
        let globalSettings: GlobalSettings = new GlobalSettings();
        let allSettingsByName:any;

        //add settings that should be loaded from the settings.txt file
        this.createSettings(globalSettings);

        // Construct the full path to the settings.txt file: the main-script is normally in js/main and the settings.txt (a JSON-file)
        //in the folder outside the index.html, so move 3 folders up from this script
        if (environment === 'development')
            filePath = join(this._dirname, '..', '..','..', 'daten', this.fileNameSettings);
        else     //file must be inside the resources/daten folder!
            filePath = join(process.resourcesPath, 'daten', this.fileNameSettings);

        //load settings file and validate it
        settingsJSON = loadSettingsFile.loadJSONSync(filePath);
        validationResult = jsonValidation.validate(settingsJSON, globalSettings.getJsonWithAllSettingFileNamesAndVarTypes());

        //override the default-value for all globalSettings with the values loaded from the settings-file
        globalSettings.setValuesFromSettingsFileJSON(settingsJSON);

        if (!validationResult)
            this.settingsValidationErrors.push("no settings file found: " + filePath);
        else if (!validationResult.valid)
            this.settingsValidationErrors = validationResult.errors;
        else
            this.settingsValidationErrors = null;

        allSettingsByName = globalSettings.getJsonWithAllNamesAndValues();

        ipcMain.handle('app:load-settings', (event, args) => {
            let pathToDataFolder: string;

            //this is necessary because the path to the data-folder is in public_html/daten in the dev-environment but
            //in the resources-folder in the production-environment. If in the production-env nothing is specified as path, it looks in the asar-package
            pathToDataFolder = environment === 'development' ? join(this._dirname, '..', '..', '..', 'daten\\') : join(process.resourcesPath, '\\daten\\');

            console.log("Main: send global-settings-json to renderer: ", allSettingsByName, pathToDataFolder, this.settingsValidationErrors);

            return {pathToDataFolder: pathToDataFolder, json: allSettingsByName, errorsInJson: this.settingsValidationErrors};
        });

        return allSettingsByName;
    }


    /**
     * adds the settings which should be loaded from the settings-file
     * Is in a separate function that it can be edited easily in projects
     */
    private createSettings(globalSettings: GlobalSettings) {
        let settings: any = GlobalSettingsFactory.getGlobalSettings();

        for (let i: number = 0; i < settings.length; i++)
            globalSettings.addSetting(settings[i]);
    }
}