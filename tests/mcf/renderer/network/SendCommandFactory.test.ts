import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {SendCommandFactory} from "../../../../src/mcf/renderer/network/SendCommandFactory";
import {ConvertNetworkData} from "../../../../src/mcf/renderer/network/ConvertNetworkData";

let sendCommandFactory:SendCommandFactory;
let createdCommand:ArrayBuffer;

let correctArrayBuffer:Uint8Array = new Uint8Array([0x00, 0xFF, 0x1E, 0x22]);
jest.mock('../../../../src/mcf/renderer/network/ConvertNetworkData');

let mockEncodeCommand = jest.fn((...parts:(string | Uint8Array)[]):Uint8Array =>{
    return new Uint8Array();
});


beforeEach(() => {
    sendCommandFactory = new SendCommandFactory();
    ConvertNetworkData.encodeCommand = mockEncodeCommand;
});

afterEach(() => {
    jest.clearAllMocks();
});

function createMock(...correctParts: (string | Uint8Array)[]){
    mockEncodeCommand.mockImplementationOnce((...parts ):Uint8Array =>{

        for(let i:number = 0; i < correctParts.length; i++){
            console.log("check parts: ", parts[i], correctParts[i]);
            if(parts[i] !== correctParts[i])
                return new Uint8Array();
        }
        return correctArrayBuffer;
    });
}

describe("method should return the converted Code from ConvertNetworkData.encodeCommand: ", ()=>{
    it("pong()", ()=>{
        createMock("network", "pong");

        createdCommand = sendCommandFactory.createPong();

        expect(createdCommand).toEqual(correctArrayBuffer);
    });

    it("createContentFile()", ()=>{
        let fileData:string = "testContentFileContent";
        createMock("contents", "put", fileData);

        createdCommand = sendCommandFactory.createContentFile(fileData);

        expect(createdCommand).toEqual(correctArrayBuffer);
    });

    it("createMedia()", ()=>{
        let mediaData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x1E, 0x22]);
        createMock("media", "put", mediaData);

        createdCommand = sendCommandFactory.createMedia(mediaData);

        expect(createdCommand).toEqual(correctArrayBuffer);
    });
});