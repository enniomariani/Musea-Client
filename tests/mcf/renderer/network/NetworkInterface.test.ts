import {WS} from "jest-websocket-mock";
import {jest, expect, beforeEach, describe, it} from '@jest/globals'
import {NetworkInterface} from "../../../../renderer/network/NetworkInterface.js";

// create a WSS instance, listening on port 1234 on localhost
const serverPath:string = "wss://localhost:1234";
let server:WS = new WS(serverPath);
let networkInterface:NetworkInterface = new NetworkInterface();

beforeEach(async () => {
    console.log("before each: clean up")
    WS.clean();
    await server.closed;
    server = new WS(serverPath);
    networkInterface = new NetworkInterface();
    console.log("end before each")
});

afterEach(() =>{
    jest.clearAllMocks();   //necesary, otherwise the console-errors-counts are not reseted
})

describe("connectToServer(): ", () => {

    it("client connects successfully to server", async () =>{
        let serverEventHandler = jest.fn();

        server.on("connection", serverEventHandler);

        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        expect(networkInterface.connected).toBe(true);
    });

    it("if the connection is established, do not reconnect if connectToServer is called again", async () =>{
        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        networkInterface.connectToServer(serverPath);
        expect(networkInterface.connected).toBe(true);
    });

    it("does not throw if connection-timeout fires after server closes connection", async () => {
        const onClosed = jest.fn();

        jest.useFakeTimers();

        networkInterface.connectToServer(serverPath, null, null, onClosed);

        server.close();

        expect(() => {
            jest.advanceTimersByTime(3001);
        }).not.toThrow();

        jest.useRealTimers();
    });

    it("calls onOpen callback when the server is connected", async () =>{
        let onOpenHandler = jest.fn();

        networkInterface.connectToServer(serverPath, onOpenHandler, null, null);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        expect(onOpenHandler).toHaveBeenCalledTimes(1);
    });

    it("calls onError callback when the connection could not be established", async () =>{
        let onErrorHandler = jest.fn();
        networkInterface.connectToServer("wrong-serverpath", null, onErrorHandler, null);
        expect(onErrorHandler).toHaveBeenCalledTimes(1);
    });

    it("prints the error when the connection could not be established", async () =>{
        let logSpy:any = jest.spyOn(console, 'error');
        networkInterface.connectToServer("wrong-serverpath", null, null, null);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("calls onError callback when the server-connection threw an error", async () =>{
        let onErrorHandler = jest.fn();

        networkInterface.connectToServer(serverPath, null, onErrorHandler, null);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        server.error();

        expect(onErrorHandler).toHaveBeenCalledTimes(1);
    });

    it("calls onClose callback when the server closed", async () =>{
        let onClosedHandler = jest.fn();

        networkInterface.connectToServer(serverPath, null, null, onClosedHandler);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        server.close();

        await server.closed; //wait until client closed the connection to server, otherwise the events would not have been fired

        expect(onClosedHandler).toHaveBeenCalledTimes(1);
    });

    it("calls onDataReceived callback when the server sent a message", async () =>{
        let onDataReceivedHandler = jest.fn();
        let data:Uint8Array = new Uint8Array([0x00, 0xF0, 0x11, 0x1E]);

        networkInterface.connectToServer(serverPath, null, null, null, onDataReceivedHandler);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired
        server.send(data)
        server.close();

        expect(onDataReceivedHandler).toHaveBeenCalledTimes(1);
        expect(onDataReceivedHandler).toHaveBeenCalledWith(data);
    });

    it("throws an error if the received data is not a Uint8Array or a string", async () =>{
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
        let response:boolean;

        networkInterface.connectToServer(serverPath);

        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        response = await networkInterface.sendDataToServer(testData, jest.fn());

        let serverReceivedMessage = await server.nextMessage;

        expect(response).toBe(true);
        expect(serverReceivedMessage).toEqual(testDataWithChunkInfo);
    });

    it ("should send passed data to server in two chunks, if it is big enough (for test-purpose big enough = bigger than 2 bytes)", async () =>{

        let testData:Uint8Array = new Uint8Array([0x00, 0xFF])
        let onChunkCallback = jest.fn();
        let response:boolean;
        let promise:Promise<boolean>;

        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        jest.useFakeTimers();
        promise = networkInterface.sendDataToServer(testData, onChunkCallback,2);

        jest.advanceTimersByTime(1600);
        //tidy up - must be before the await, otherwise the test does not work because of the fake-timers
        jest.useRealTimers();

        response = await promise;

        let serverReceivedMessage1 = await server.nextMessage;
        let serverReceivedMessage2 = await server.nextMessage;

        expect(response).toBe(true);
        expect(serverReceivedMessage1).toEqual(new Uint8Array([0x02, 0x00]));
        expect(serverReceivedMessage2).toEqual(new Uint8Array([0x00, 0xFF]));
        expect(onChunkCallback).toHaveBeenCalledTimes(2);
    });

    it ("should send passed data to server in three chunks, if it is big enough (for test-purpose big enough = bigger than 2 bytes)", async () =>{

        let testData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11])
        let response:boolean;
        let promise:Promise<boolean>;
        let onChunkCallback = jest.fn();

        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        jest.useFakeTimers();

        promise = networkInterface.sendDataToServer(testData, onChunkCallback, 2);

        jest.advanceTimersByTime(2400);
        //tidy up - must be before the await, otherwise the test does not work because of the fake-timers
        jest.useRealTimers();
        response = await promise;

        let serverReceivedMessage1 = await server.nextMessage;
        let serverReceivedMessage2 = await server.nextMessage;
        let serverReceivedMessage3 = await server.nextMessage;

        expect(response).toBe(true);
        expect(serverReceivedMessage1).toEqual(new Uint8Array([0x03, 0x00]));
        expect(serverReceivedMessage2).toEqual(new Uint8Array([0x00, 0xff]));
        expect(serverReceivedMessage3).toEqual(new Uint8Array([0x11]));
        expect(onChunkCallback).toHaveBeenCalledTimes(3);
    });

    it ("should send passed data to server in three bigger chunks (separated into 4 bytes)", async () =>{

        let testData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66])
        let response:boolean;
        let promise:Promise<boolean>;
        let onChunkCallback = jest.fn();

        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        jest.useFakeTimers();

        promise = networkInterface.sendDataToServer(testData, onChunkCallback, 4);
        jest.advanceTimersByTime(2400);
        //tidy up - must be before the await, otherwise the test does not work because of the fake-timers
        jest.useRealTimers();

        response = await promise;

        let serverReceivedMessage1 = await server.nextMessage;
        let serverReceivedMessage2 = await server.nextMessage;
        let serverReceivedMessage3 = await server.nextMessage;

        expect(response).toBe(true);
        expect(serverReceivedMessage1).toEqual(new Uint8Array([0x03, 0x00, 0x00, 0xFF]));
        expect(serverReceivedMessage2).toEqual(new Uint8Array([0x11, 0x22, 0x33, 0x44]));
        expect(serverReceivedMessage3).toEqual(new Uint8Array([0x55, 0x66]));
        expect(onChunkCallback).toHaveBeenCalledTimes(3);
    });

    it ("should print an error and return false if the connection is closed during the sending-process of multiple chunks", async () =>{

        let testData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66])
        let promise:Promise<boolean>;
        let answer:boolean;
        let onChunkCallback = jest.fn();

        let logSpy = jest.spyOn(console, "error")

        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        jest.useFakeTimers();

        promise = networkInterface.sendDataToServer(testData, onChunkCallback, 4);
        jest.advanceTimersByTime(800);
        jest.advanceTimersByTime(800);
        server.close();
        //tidy up - must be before the await, otherwise the test does not work because of the fake-timers
        jest.useRealTimers();

        answer = await promise;

        expect(answer).toBe(false);
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith("WebSocketConnection: connection was terminated during sending");
    });

    it("should return false if there is no connection", async () =>{
        let testData:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11])
        const response:boolean = await networkInterface.sendDataToServer(testData, jest.fn());
        expect(response).toBe(false);
    });
});

describe("closeConnection() ", ()=>{
    test("should close the connection to the server", async () =>{
        networkInterface.connectToServer(serverPath);
        await server.connected; //wait until client connected to server, otherwise the events would not have been fired

        networkInterface.closeConnection();

        await server.closed; //wait until client closed the connection to server, otherwise the events would not have been fired

        expect(networkInterface.connected).toBe(false);
    });
});