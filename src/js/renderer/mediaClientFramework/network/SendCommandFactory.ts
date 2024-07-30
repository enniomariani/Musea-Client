import {ConvertNetworkData} from "./ConvertNetworkData";

//TO DO: eventually delete? NOt sure if really needed!
export class SendCommandFactory{

    constructor() {}

    createPong():Uint8Array{
        return ConvertNetworkData.encodeCommand("network", "pong");
    }

    createContentFile(fileData:string):Uint8Array{
        return ConvertNetworkData.encodeCommand("contents", "put", fileData);
    }

    createMedia(data:Uint8Array):Uint8Array{
        return ConvertNetworkData.encodeCommand("media", "put", data);
    }
}