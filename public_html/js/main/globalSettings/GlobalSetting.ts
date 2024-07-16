export class GlobalSetting{

    static TYPE_NUMBER:string = "number";
    static TYPE_BOOLEAN:string = "boolean";
    static TYPE_STRING:string = "string";

    _value = null;
    _varType = null;
    _nameInSettingsFile = null;
    _name = null;

    /**
     *
     * @param {string} nameInSettingsFile   the name of the var in the settings file
     * @param {string} name the name of the var in the code (only use this name in the code!)
     * @param {string}varType one of the static Types of GlobalSettings throws an error if the var-typeis not one of the static types defined in this class
     * @param {any} defaultValue the default-value of the var, if it is not found in the settings.txt file
     */
    constructor(nameInSettingsFile:string, name:string, varType:string, defaultValue:any) {

        if(!(varType === GlobalSetting.TYPE_BOOLEAN || varType === GlobalSetting.TYPE_NUMBER || varType === GlobalSetting.TYPE_STRING))
            throw new Error("GlobalSetting: varType must be of one of the types defined in the GlobalSetting class (example: TYPE_NUMBER)!");

        if(varType === GlobalSetting.TYPE_NUMBER && typeof defaultValue !== "number")
            throw new Error("GlobalSetting: varType is NUMBER, but the defaultValue is not of type number!");

        if(varType === GlobalSetting.TYPE_BOOLEAN && typeof defaultValue !== "boolean")
            throw new Error("GlobalSetting: varType is BOOLEAN, but the defaultValue is not of type boolean!");

        if(varType === GlobalSetting.TYPE_STRING && typeof defaultValue !== "string")
            throw new Error("GlobalSetting: varType is STRING, but the defaultValue is not of type string!");

        this._nameInSettingsFile = nameInSettingsFile;
        this._name = name;
        this._varType = varType;
        this._value = defaultValue;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get varType() {
        return this._varType;
    }

    get nameInSettingsFile() {
        return this._nameInSettingsFile;
    }

    get name() {
        return this._name;
    }
}