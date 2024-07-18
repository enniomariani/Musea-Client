import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {SendCommandFactory} from "../../../../public_html/js/renderer/mediaClientFramework/network/SendCommandFactory";
import {ConvertNetworkData} from "renderer/mediaClientFramework/network/ConvertNetworkData";

let sendCommandFactory:SendCommandFactory;
let createdCommand:ArrayBuffer;

let correctArrayBuffer:Uint8Array = new Uint8Array([0x00, 0xFF, 0x1E, 0x22]);
jest.mock('renderer/mediaClientFramework/network/ConvertNetworkData');

let mockEncodeCommand = jest.fn((...parts:(string | Uint8Array)[]):Uint8Array=>{
    return null;
});


beforeEach(() => {
    sendCommandFactory = new SendCommandFactory();
    ConvertNetworkData.encodeCommand = mockEncodeCommand;
});

afterEach(() => {
    jest.clearAllMocks();
});

function createMock(...correctParts){
    mockEncodeCommand.mockImplementationOnce((...parts ):Uint8Array=>{

        for(let i:number = 0; i < correctParts.length; i++){
            console.log("check parts: ", parts[i], correctParts[i]);
            if(parts[i] !== correctParts[i])
                return null;
        }
        return correctArrayBuffer;
    });
}

describe("method should return the converted Code from ConvertNetworkData.encodeCommand: ", ()=>{
    it("pong()", ()=>{
        //setup
        createMock("network", "pong");

        //method to test
        createdCommand = sendCommandFactory.createPong();

        //tests
        expect(createdCommand).toEqual(correctArrayBuffer);
    });

    it("createContentFile()", ()=>{
        //setup
        let fileData:string = "testContentFileContent";
        createMock("contents", "put", fileData);

        //method to test
        createdCommand = sendCommandFactory.createContentFile(fileData);

        //tests
        expect(createdCommand).toEqual(correctArrayBuffer);
    });

    it("createMedia()", ()=>{
        //setup
        let mediaData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x1E, 0x22]);
        createMock("media", "put", mediaData);

        //method to test
        createdCommand = sendCommandFactory.createMedia(mediaData);

        //tests
        expect(createdCommand).toEqual(correctArrayBuffer);
    });
});