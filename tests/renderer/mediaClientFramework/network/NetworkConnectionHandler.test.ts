import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {
    NetworkConnectionHandler
} from "../../../../src/js/renderer/mediaClientFramework/network/NetworkConnectionHandler";
import {MockNetworkInterface} from "../../../__mocks__/renderer/mediaClientFramework/network/MockNetworkInterface";


let mockNetworkInterface: MockNetworkInterface;
let connectionHandler: NetworkConnectionHandler;

const onOpen = jest.fn();
const onClose = jest.fn();
const onError = jest.fn();
const onDataReceived = jest.fn();

const firstIP: string = "127.0.0.1";
const firstURL: string = "ws://" + firstIP + ":5000";

const mockBackendNetworkService: jest.Mocked<IBackenNetworkService> = {
    ping: jest.fn(),
}

beforeEach(() => {
    mockNetworkInterface = new MockNetworkInterface();
    connectionHandler = new NetworkConnectionHandler(() => mockNetworkInterface, mockBackendNetworkService);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createConnection() ", () => {
    it("should call connectToServer on the newly created networkInterface with the correct parameters", () => {
        //method to test
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived);

        //tests
        expect(mockNetworkInterface.connectToServer).toHaveBeenCalledTimes(1);
        expect(mockNetworkInterface.connectToServer).toHaveBeenCalledWith(firstURL, onOpen, onError, expect.anything(), expect.anything());
    });

    it("should return true if the created networkInterface returns true", () => {
        //setup
        let success: boolean = false;
        mockNetworkInterface.connectToServer.mockReturnValueOnce(true);

        //method to test
        success = connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived);

        //tests
        expect(success).toBe(true);
    });

    it("should return false if the created networkInterface returns false", () => {
        //setup
        let success: boolean = true;
        mockNetworkInterface.connectToServer.mockReturnValueOnce(false);

        //method to test
        success = connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived);

        //tests
        expect(success).toBe(false);
    });

    it("should return false and print an error if the connection already exists", () => {
        let success: boolean = true;
        mockNetworkInterface.connectToServer.mockReturnValue(true);
        let logSpy = jest.spyOn(console, "error");

        //method to test
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived);
        success = connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived);

        //tests
        expect(success).toBe(false);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should call the passed onClose callback with the correct ip, if the connection was closed", () => {
        let secondIP: string = "127.0.0.2";
        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen, onError, onClose) => {
            if (url !== firstURL)
                onClose();
            return true;
        });

        //method to test
        connectionHandler.createConnection(firstIP, jest.fn(), jest.fn(), jest.fn(), jest.fn());
        connectionHandler.createConnection(secondIP, onOpen, onError, onClose, onDataReceived);

        //tests
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledWith(secondIP);
    });

    it("should call the passed onDataReceived callback with the correct ip, if the connection received data", () => {
        let secondIP: string = "127.0.0.2";
        let data: Uint8Array = new Uint8Array([0x00, 0x11, 0xFE]);

        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen, onError, onClose, onDataReceived) => {
            if (url !== firstURL)
                onDataReceived(data);
            return true;
        });

        //method to test
        connectionHandler.createConnection(firstIP, jest.fn(), jest.fn(), jest.fn(), jest.fn());
        connectionHandler.createConnection(secondIP, onOpen, onError, onClose, onDataReceived);

        //tests
        expect(onDataReceived).toHaveBeenCalledTimes(1);
        expect(onDataReceived).toHaveBeenCalledWith(secondIP, data);
    });
});

describe("hasConnection() ", () => {
    it("return true if a connection with the passed ip was created and not closed", () => {
        //setup
        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen, onError, onClose) => {
            return true;
        });
        connectionHandler.createConnection(firstIP, jest.fn(), jest.fn(), jest.fn(), jest.fn());

        //method to test
        expect(connectionHandler.hasConnection(firstIP)).toBe(true);
    });

    it("return false if a connection with the passed ip was created and closed afterwards", () => {
        //setup
        mockNetworkInterface.connectToServer.mockImplementation((url, onOpen, onError, onClose) => {
            return true;
        });
        connectionHandler.createConnection(firstIP, jest.fn(), jest.fn(), jest.fn(), jest.fn());
        connectionHandler.closeConnection(firstIP);

        //method to test
        expect(connectionHandler.hasConnection(firstIP)).toBe(false);
    });

    it("return false if a connection with the passed ip was not created", () => {
        //method to test
        expect(connectionHandler.hasConnection(firstIP)).toBe(false);
    });
});


describe("sendData() ", () => {
    it("should call networkInterface.sendDataToServer with the data if the connection exists", () => {
        //setup
        const data: Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        mockNetworkInterface.connectToServer.mockReturnValue(true);
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived);

        //method to test
        connectionHandler.sendData(firstIP, data);

        //tests
        expect(mockNetworkInterface.sendDataToServer).toHaveBeenCalledTimes(1);
        expect(mockNetworkInterface.sendDataToServer).toHaveBeenCalledWith(data);
    });

    it("should return false if the data could not have been sent", () => {
        //setup
        const data: Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let success: boolean;
        mockNetworkInterface.connectToServer.mockReturnValue(true);
        mockNetworkInterface.sendDataToServer.mockReturnValue(false);
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived);

        //method to test
        success = connectionHandler.sendData(firstIP, data);

        //tests
        expect(success).toBe(false);
    });

    it("should return false and print an error if the connection does not exist", () => {
        //setup
        const data: Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);
        let success: boolean;
        let logSpy = jest.spyOn(console, "error");

        //method to test
        success = connectionHandler.sendData(firstIP, data);

        //tests
        expect(success).toBe(false);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("closeConnection() ", () => {
    it("should call networkInterface.closeConnection", () => {
        //setup
        mockNetworkInterface.connectToServer.mockReturnValue(true);
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived);

        //method to test
        connectionHandler.closeConnection(firstIP);

        //tests
        expect(mockNetworkInterface.closeConnection).toHaveBeenCalledTimes(1);
    });

    it("should remove the connection from the active ones", () => {
        //setup
        let success: boolean;
        mockNetworkInterface.connectToServer.mockReturnValue(true);
        connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived);

        //method to test
        connectionHandler.closeConnection(firstIP);
        success = connectionHandler.createConnection(firstIP, onOpen, onError, onClose, onDataReceived);

        //tests
        expect(success).toBe(true);
    });

    it("should print an error if the connection does not exist", () => {
        //setup
        let logSpy = jest.spyOn(console, "error");

        //method to test
        connectionHandler.closeConnection(firstIP);

        //tests
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("ping() ", () => {
    it("should call mockBackendNetworkService.ping", async () => {
        //setup

        //method to test
        await connectionHandler.ping(firstIP);

        //tests
        expect(mockBackendNetworkService.ping).toHaveBeenCalledTimes(1);
        expect(mockBackendNetworkService.ping).toHaveBeenCalledWith(firstIP);
    });

    it("should return true if mockBackendNetworkService.ping returns true", async () => {
        //setup
        let answer: boolean;
        mockBackendNetworkService.ping.mockReturnValue(true);

        //method to test
        answer = await connectionHandler.ping(firstIP);

        //tests
        expect(answer).toBe(true);
    });

    it("should return false if mockBackendNetworkService.ping returns false", async () => {
        //setup
        let answer: boolean;
        mockBackendNetworkService.ping.mockReturnValue(false);

        //method to test
        answer = await connectionHandler.ping(firstIP);

        //tests
        expect(answer).toBe(false);
    });

});