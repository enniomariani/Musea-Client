import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    NetworkConnectionHandler
} from "../../../../src/mcf/renderer/network/NetworkConnectionHandler";
import {MockNetworkInterface} from "../../../__mocks__/mcf/renderer/network/MockNetworkInterface";


let mockNetworkInterface: MockNetworkInterface;
let connectionHandler: NetworkConnectionHandler;

const onOpen = jest.fn();
const onClose = jest.fn();
const onError = jest.fn();
const onDataReceived = jest.fn();

const firstIP: string = "127.0.0.1";
const firstURL: string = "ws://" + firstIP + ":5000";

const mockBackendNetworkService: jest.Mocked<IBackendNetworkService> = {
    ping: jest.fn(),
}

beforeEach(() => {
    mockNetworkInterface = new MockNetworkInterface();
    connectionHandler = new NetworkConnectionHandler(mockBackendNetworkService);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createConnection() ", () => {
    it("should call connectToServer on the newly created networkInterface with the correct parameters", () => {
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);

        expect(mockNetworkInterface.connectToServer).toHaveBeenCalledTimes(1);
        expect(mockNetworkInterface.connectToServer).toHaveBeenCalledWith(firstURL, expect.anything(), onError, expect.anything(), expect.anything());
    });

    it("should call onOpen if the connection was created succesfully", () => {
        mockNetworkInterface.connectToServer = jest.fn();
        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen)=>{
            onOpen();
        });

        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);

        expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("should print an error if the connection already exists", () => {

        mockNetworkInterface.connectToServer = jest.fn();
        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen)=>{
            onOpen();
        });
        let logSpy = jest.spyOn(console, "error");

        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);

        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should call the passed onClose callback with the correct ip, if the connection was closed", () => {
        let secondIP: string = "127.0.0.2";
        mockNetworkInterface.connectToServer = jest.fn();
        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen, onError, onClose) => {
            if (url !== firstURL)
                onClose();
        });

        connectionHandler.createConnection(secondIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledWith(secondIP);
    });

    it("should remove the connection of the active connections if the connection was closed", () => {
        mockNetworkInterface.connectToServer = jest.fn();
        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen, onError, onClose) => {
            onOpen();
            onClose();
        });

        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);

        expect(connectionHandler.hasConnection(firstIP)).toBe(false);
    });

    it("should call the passed onDataReceived callback with the correct ip, if the connection received data", () => {
        let secondIP: string = "127.0.0.2";
        let data: Uint8Array = new Uint8Array([0x00, 0x11, 0xFE]);

        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen, onError, onClose, onDataReceived) => {
            if (url !== firstURL)
                onDataReceived(data);
            return true;
        });

        connectionHandler.createConnection(firstIP, jest.fn(), jest.fn(), jest.fn(), jest.fn(),mockNetworkInterface);
        connectionHandler.createConnection(secondIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);

        expect(onDataReceived).toHaveBeenCalledTimes(1);
        expect(onDataReceived).toHaveBeenCalledWith(secondIP, data);
    });
});

describe("hasConnection() ", () => {
    it("return true if a connection with the passed ip was created and not closed", () => {
        mockNetworkInterface.connectToServer = jest.fn();
        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen)=>{
            onOpen();
        });
        connectionHandler.createConnection(firstIP, jest.fn(), jest.fn(), jest.fn(), jest.fn(),mockNetworkInterface);

        expect(connectionHandler.hasConnection(firstIP)).toBe(true);
    });

    it("return false if a connection with the passed ip was created and closed afterwards", () => {
        mockNetworkInterface.connectToServer = jest.fn();
        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen)=>{
            onOpen();
        });
        connectionHandler.createConnection(firstIP, jest.fn(), jest.fn(), jest.fn(), jest.fn(), mockNetworkInterface);
        connectionHandler.closeConnection(firstIP);

        expect(connectionHandler.hasConnection(firstIP)).toBe(false);
    });

    it("return false if a connection with the passed ip was not created", () => {
        expect(connectionHandler.hasConnection(firstIP)).toBe(false);
    });
});


describe("sendData() ", () => {
    it("should call networkInterface.sendDataToServer with the data if the connection exists", () => {
        const data: Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let onChunkCallback = jest.fn();
        mockNetworkInterface.connectToServer = jest.fn();
        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen)=>{
            onOpen();
        });
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);

        connectionHandler.sendData(firstIP, data, onChunkCallback);

        expect(mockNetworkInterface.sendDataToServer).toHaveBeenCalledTimes(1);
        expect(mockNetworkInterface.sendDataToServer).toHaveBeenCalledWith(data, onChunkCallback);
    });

    it("should return false if the data could not have been sent", async () => {
        const data: Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let success: boolean;
        mockNetworkInterface.connectToServer.mockReturnValue(true);
        mockNetworkInterface.sendDataToServer.mockReturnValue(false);
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);

        success = await connectionHandler.sendData(firstIP, data);

        expect(success).toBe(false);
    });

    it("should return false and print an error if the connection does not exist", async () => {
        const data: Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let success: boolean;
        let logSpy = jest.spyOn(console, "error");

        success = await connectionHandler.sendData(firstIP, data);

        expect(success).toBe(false);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("closeConnection() ", () => {
    it("should call networkInterface.closeConnection", () => {
        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen)=>{
            onOpen();
        });
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);

        connectionHandler.closeConnection(firstIP);

        expect(mockNetworkInterface.closeConnection).toHaveBeenCalledTimes(1);
    });

    it("should remove the connection from the active ones", () => {
        let logSpy = jest.spyOn(console, "error");
        mockNetworkInterface.connectToServer.mockReturnValue(true);
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);

        connectionHandler.closeConnection(firstIP);
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived, mockNetworkInterface);

        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should print an error if the connection does not exist", () => {
        let logSpy = jest.spyOn(console, "error");

        connectionHandler.closeConnection(firstIP);

        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("ping() ", () => {
    it("should call mockBackendNetworkService.ping", async () => {
        await connectionHandler.ping(firstIP);

        expect(mockBackendNetworkService.ping).toHaveBeenCalledTimes(1);
        expect(mockBackendNetworkService.ping).toHaveBeenCalledWith(firstIP);
    });

    it("should return true if mockBackendNetworkService.ping returns true", async () => {
        let answer: boolean;
        mockBackendNetworkService.ping.mockReturnValue(true);

        answer = await connectionHandler.ping(firstIP);

        expect(answer).toBe(true);
    });

    it("should return false if mockBackendNetworkService.ping returns false", async () => {
        let answer: boolean;
        mockBackendNetworkService.ping.mockReturnValue(false);

        answer = await connectionHandler.ping(firstIP);

        expect(answer).toBe(false);
    });
});