import {WS} from "jest-websocket-mock";
import {jest, expect, test, beforeEach, describe} from '@jest/globals'
import {NetworkInterface} from "../../../../src/js/mcf/renderer/network/NetworkInterface";

// create a WSS instance, listening on port 1234 on localhost
const serverPath:string = "wss://localhost:1234";
let server:WS = new WS(serverPath);
let networkInterface:NetworkInterface = new NetworkInterface();

beforeEach(() => {
    WS.clean();
    server = new WS(serverPath);
    networkInterface = new NetworkInterface();
});

describe("connectToServer(): ", () => {

    test("client connects successfully to server", async () =>{

        let eventHandler = jest.fn();
        let serverEventHandler = jest.fn();

        server.on("connection", serverEventHandler);

        networkInterface.addEventListener(NetworkInterface.CONNECTED, eventHandler);
        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        expect(networkInterface.connected).toBe(true);
        expect(eventHandler).toBeCalledTimes(1);
        expect(serverEventHandler).toBeCalledTimes(1);

        networkInterface.removeEventListener(NetworkInterface.CONNECTED, eventHandler);
    });

    test("if the connection is established, do not reconnect if connectToServer is called again", async () =>{

        let eventHandler = jest.fn();
        let connectionInitialised:boolean;

        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        networkInterface.addEventListener(NetworkInterface.CONNECTED, eventHandler);
        networkInterface.connectToServer(serverPath);

        expect(networkInterface.connected).toBe(true);
        expect(eventHandler).toBeCalledTimes(0);

        networkInterface.removeEventListener(NetworkInterface.CONNECTED, eventHandler);
    });

    test("fires error and closed-event on server-error", async () =>{

        let eventHandlerError = jest.fn();
        let eventHandlerClosed = jest.fn();

        networkInterface.addEventListener(NetworkInterface.ERROR, eventHandlerError);
        networkInterface.addEventListener(NetworkInterface.CLOSED, eventHandlerClosed);
        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        server.error();

        await server.closed; //wait until client closed the connection to server, otherwise the events would not have been fired

        expect(networkInterface.connected).toBe(false);
        expect(eventHandlerError).toBeCalledTimes(1);
        expect(eventHandlerClosed).toBeCalledTimes(1);

        networkInterface.removeEventListener(NetworkInterface.ERROR, eventHandlerError);
        networkInterface.removeEventListener(NetworkInterface.CLOSED, eventHandlerClosed);
    });

    test("fires close-event on server closed", async () =>{

        let eventHandler = jest.fn();

        networkInterface.addEventListener(NetworkInterface.CLOSED, eventHandler);
        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        server.close();

        await server.closed; //wait until client closed the connection to server, otherwise the events would not have been fired

        expect(eventHandler).toBeCalledTimes(1);
        expect(networkInterface.connected).toBe(false);

        networkInterface.removeEventListener(NetworkInterface.CLOSED, eventHandler);
    });

    test("calls onOpen callback when the server is connected", async () =>{
        let onOpenHandler = jest.fn();

        networkInterface.connectToServer(serverPath, onOpenHandler, null, null);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        expect(onOpenHandler).toBeCalledTimes(1);
    });

    test("calls onError callback when the connection could not be established", async () =>{
        let onErrorHandler = jest.fn();

        networkInterface.connectToServer("wrong-serverpath", null, onErrorHandler, null);

        expect(onErrorHandler).toBeCalledTimes(1);
    });

    test("prints the error when the connection could not be established", async () =>{
        let logSpy:any = jest.spyOn(global.console, 'error');

        networkInterface.connectToServer("wrong-serverpath", null, null, null);

        expect(logSpy).toBeCalledTimes(1);
    });

    test("calls onError callback when the server-connection threw an error", async () =>{
        let onErrorHandler = jest.fn();

        networkInterface.connectToServer(serverPath, null, onErrorHandler, null);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        server.error();

        expect(onErrorHandler).toBeCalledTimes(1);
    });

    test("calls onClose callback when the server closed", async () =>{
        let onClosedHandler = jest.fn();

        networkInterface.connectToServer(serverPath, null, null, onClosedHandler);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        server.close();

        await server.closed; //wait until client closed the connection to server, otherwise the events would not have been fired

        expect(onClosedHandler).toBeCalledTimes(1);
    });

    test("calls onDataReceived callback when the server sent a message", async () =>{
        let onDataReceivedHandler = jest.fn();
        let data:Uint8Array = new Uint8Array([0x00, 0xF0, 0x11, 0x1E]);

        networkInterface.connectToServer(serverPath, null, null, null, onDataReceivedHandler);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired
        server.send(data)
        server.close();

        expect(onDataReceivedHandler).toBeCalledTimes(1);
        expect(onDataReceivedHandler).toHaveBeenCalledWith(data);
    });

    test("throws an error if the received data is not a Uint8Array or a string", async () =>{
        let onDataReceivedHandler = jest.fn();
        let data:Blob = new Blob();

        networkInterface.connectToServer(serverPath, null, null, null, onDataReceivedHandler);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired
        expect(()=> server.send(data)).toThrow("Websocket received data which is neither a string nor a Uint8Array!");
        server.close();
    });
});

describe("sendDataToServer() ", ()=>{
    it ("should send passed data to server in one chunk", async () =>{

        let testData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11])
        let testDataWithChunkInfo:Uint8Array = new Uint8Array([0x01, 0x00, 0x00, 0xFF, 0x11])
        let response;

        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        response = await networkInterface.sendDataToServer(testData);

        let serverReceivedMessage = await server.nextMessage;

        expect(response).toBe(true);
        expect(serverReceivedMessage).toEqual(testDataWithChunkInfo);
    });

    it ("should send passed data to server in two chunks, if it is big enough (for test-purpose big enough = bigger than 2 bytes)", async () =>{

        let testData:Uint8Array = new Uint8Array([0x00, 0xFF])
        let response;

        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        response = await networkInterface.sendDataToServer(testData, 2);

        let serverReceivedMessage1 = await server.nextMessage;
        let serverReceivedMessage2 = await server.nextMessage;

        expect(response).toBe(true);
        expect(serverReceivedMessage1).toEqual(new Uint8Array([0x02, 0x00]));
        expect(serverReceivedMessage2).toEqual(new Uint8Array([0x00, 0xFF]));
    });

    it ("should send passed data to server in three chunks, if it is big enough (for test-purpose big enough = bigger than 2 bytes)", async () =>{

        let testData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11])
        let response;

        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        response = await networkInterface.sendDataToServer(testData, 2);

        let serverReceivedMessage1 = await server.nextMessage;
        let serverReceivedMessage2 = await server.nextMessage;
        let serverReceivedMessage3 = await server.nextMessage;

        expect(response).toBe(true);
        expect(serverReceivedMessage1).toEqual(new Uint8Array([0x03, 0x00]));
        expect(serverReceivedMessage2).toEqual(new Uint8Array([0x00, 0xff]));
        expect(serverReceivedMessage3).toEqual(new Uint8Array([0x11]));
    });

    it ("should send passed data to server in three bigger chunks (separated into 4 bytes)", async () =>{

        let testData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66])
        let response;

        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        response = await networkInterface.sendDataToServer(testData, 4);

        let serverReceivedMessage1 = await server.nextMessage;
        let serverReceivedMessage2 = await server.nextMessage;
        let serverReceivedMessage3 = await server.nextMessage;

        expect(response).toBe(true);
        expect(serverReceivedMessage1).toEqual(new Uint8Array([0x03, 0x00, 0x00, 0xFF]));
        expect(serverReceivedMessage2).toEqual(new Uint8Array([0x11, 0x22, 0x33, 0x44]));
        expect(serverReceivedMessage3).toEqual(new Uint8Array([0x55, 0x66]));
    });

    test("should return false if there is no connection", async () =>{

        let testData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11])
        let response:boolean;

        response = await networkInterface.sendDataToServer(testData);

        expect(response).toBe(false);
    });
});

describe("closeConnection() ", ()=>{
    test("should close the connection to the server", async () =>{
        //setup
        let eventHandler = jest.fn();

        networkInterface.addEventListener(NetworkInterface.CLOSED, eventHandler);
        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        //method to test
        networkInterface.closeConnection();

        await server.closed; //wait until client closed the connection to server, otherwise the events would not have been fired

        expect(eventHandler).toBeCalledTimes(1);
        expect(networkInterface.connected).toBe(false);

        networkInterface.removeEventListener(NetworkInterface.CLOSED, eventHandler);
    });
});