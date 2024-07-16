import {Validator, ValidatorResult} from "jsonschema";


export class ValidateSettingsJson {

    constructor() {}

    /**
     * checks if the passed json is a valid structure for the default settings (see private function _createSchema() how this structure should be
     *
     * @param json
     * @param varsAndTypes  a JSON-object which holds key values for all vars that should be inside the checked JSON and their types (for example {"Vollbild": "boolean"}
     * @returns {ValidatorResult}   a validationResult-object (check for property .errors to see errors and .valid if JSON is valid or not). Returns null if the passed JSON is null
     */
    validate(json:any, varsAndTypes:any):ValidatorResult {
        let validator = new Validator();
        let schema;

        if(!json)
            return null;

        schema = this._createSchema(varsAndTypes);
        validator.schemas = {};

        let validationResult = validator.validate(json, schema, {
            nestedErrors: false,
            allowUnknownAttributes: false
        });

        return validationResult;
    }

    /**
     *
     * @param varsAndTypes
     * @returns {{type: string, properties: {}, required: *[]}}
     * @private
     */
    _createSchema(varsAndTypes){
        let schema = {
            "type": "object",
            "properties": {},
            "required": []
        };

        for(let key in varsAndTypes)
        {
            schema.properties[key] = {"type": varsAndTypes[key]};
            schema.required.push(key);
        }

        return schema;
    }
}