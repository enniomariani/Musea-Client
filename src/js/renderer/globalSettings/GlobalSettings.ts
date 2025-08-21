

export class GlobalSettings {
    private _screenSaverTimeMS:number = null;
    private _pathToDataFolder:string = "";
    private _errorsInJSON:string = "";

    constructor() {}

    get errorsInJSON(): string {
        return this._errorsInJSON;
    }

    set errorsInJSON(value: string) {
        this._errorsInJSON = value;
    }

    get pathToDataFolder(): string {
        return this._pathToDataFolder;
    }

    set pathToDataFolder(value: string) {
        this._pathToDataFolder = value;
    }

    get screenSaverTimeMS() {
        return this._screenSaverTimeMS;
    }

    set screenSaverTimeMS(value:number) {
        this._screenSaverTimeMS = value;
    }

}
