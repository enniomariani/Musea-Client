import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {NetworkService} from "../../../../src/js/mcf/renderer/services/NetworkService";
import {
    MockNetworkConnectionHandler
} from "../../../__mocks__/renderer/mediaClientFramework/network/MockNetworkConnectionHandler";
import {ConvertNetworkData} from "../../../../src/js/mcf/renderer/network/ConvertNetworkData";

let mockNetworkConnectionHandler:MockNetworkConnectionHandler;
let networkService:NetworkService;

const ip1:string = "127.0.0.1";


beforeEach(() => {
    mockNetworkConnectionHandler = new MockNetworkConnectionHandler();
    networkService = new NetworkService(mockNetworkConnectionHandler);
});

afterEach(() => {
    jest.clearAllMocks();
});

function mockOpenConnection(receiveImmediateCommand = null) {
    mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClose, onDataReceived)=>{
        onOpen();
        if(receiveImmediateCommand !== null)
            onDataReceived(ip, receiveImmediateCommand);
    });
}

function mockOpenConnectionAndReceiveDataLater(ip, command) {
    let dataReceived;
    mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClosed, onDataReceived)=>{
        onOpen();
        dataReceived = onDataReceived;
    });
    mockNetworkConnectionHandler.sendData.mockImplementationOnce((ip, data)=>{
        dataReceived(ip, command)
    });
}

describe("openConnection() ",  ()=>{
    it("should call createConnection() of the connectionHandler with correct parameters", async()=>{
        //setup
        mockOpenConnection();
        //method to test
        await networkService.openConnection(ip1);

        //tests
        expect(mockNetworkConnectionHandler.createConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.createConnection).toHaveBeenCalledWith(ip1, expect.anything(), expect.anything(), expect.anything(), expect.anything());
    });

    it("should return true if connection was created succesfully", async()=>{
        //setup
        let answer:boolean;
        mockOpenConnection();
        //method to test
        answer = await networkService.openConnection(ip1);

        //tests
        expect(answer).toBe(true);
    });

    it("should return true if connection already exists and print an info", async()=>{
        //setup
        let answer:boolean;
        let logSpy = jest.spyOn(console, "info");
        mockOpenConnection();

        mockNetworkConnectionHandler.hasConnection.mockReturnValueOnce(true);
        //method to test
        answer = await networkService.openConnection(ip1);

        //tests
        expect(answer).toBe(true);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should return false if connection was not created succesfully", async()=>{
        //setup
        let answer:boolean;
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError)=>{
            onError();
        });
        //method to test
        answer = await networkService.openConnection(ip1);

        //tests
        expect(answer).toBe(false);
    });

    it("should answer with pong if it receives ping signal", async()=>{
        //setup
        let pingCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "ping");

        mockOpenConnection(pingCommand);
        //method to test
        await networkService.openConnection(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "pong"));
    });

    it("should not answer if the received command is not a valid network-command", async()=>{
        //setup
        let nonValidCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "xyz");
        mockOpenConnection(nonValidCommand);

        //method to test
        await networkService.openConnection(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(0);
    });

    it("should not answer if the received command is not a valid command", async()=>{
        //setup
        let nonValidCommand:Uint8Array = ConvertNetworkData.encodeCommand("asdfasdfasdx");
        mockOpenConnection(nonValidCommand);

        //method to test
        await networkService.openConnection(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(0);
    });

    it("should not answer if the received command is not a valid command - 2", async()=>{
        //setup
        let nonValidCommand:Uint8Array = new Uint8Array([0x00, 0xFF]);
        mockOpenConnection(nonValidCommand);

        //method to test
        await networkService.openConnection(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(0);
    });
});

describe("closeConnection() ",  ()=> {
    it("should call mockNetworkConnectionHandler.closeConnection", async () => {
        // Method to test
        networkService.closeConnection(ip1);

        //tests
        expect(mockNetworkConnectionHandler.closeConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.closeConnection).toHaveBeenCalledWith(ip1);
    });
});

describe("pcRespondsToPing() ",  ()=>{
    it("should call mockNetworkConnectionHandler.ping and return its answer", async()=>{
        //setup
        let answer:boolean;
        mockNetworkConnectionHandler.ping.mockImplementationOnce((ip)=>{
            return new Promise((resolve, reject) => {resolve(true)});
        });

        // Method to test
        const answerPromise = networkService.pcRespondsToPing(ip1);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        answer = await answerPromise;

        //tests
        expect(mockNetworkConnectionHandler.ping).toHaveBeenCalledTimes(1);
        expect(answer).toBe(true);
    });

    it("should return false if PC is not reachable after 3 seconds", async () => {
        jest.useFakeTimers();

        // Setup
        mockNetworkConnectionHandler.ping.mockImplementationOnce(() => new Promise(() => { }));

        // Method to test
        const answerPromise = networkService.pcRespondsToPing(ip1);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        const answer = await answerPromise;

        // Tests
        expect(answer).toBe(false);

        jest.useRealTimers();
    });
});

describe("isMediaAppOnline() ",  ()=>{
    it("should call mockNetworkConnectionHandler.sendData with a ping-command", async()=>{
        //setup
        let pongCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "pong");

        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand);

        //method to test
        await networkService.openConnection(ip1);
        await networkService.isMediaAppOnline(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "ping"));
    });

    it("should return true if it received a pong-command", async()=>{
        //setup
        let pongCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "pong");
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand);

        let answer:boolean;
        //method to test
        await networkService.openConnection(ip1);
        answer = await networkService.isMediaAppOnline(ip1);

        //tests
        expect(answer).toBe(true);
    });

    it("should return null if it received a wrong command", async()=>{
        //setup
        let pongCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "poiiing");
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand);

        let answer:boolean;
        //method to test
        await networkService.openConnection(ip1);
        answer = await networkService.isMediaAppOnline(ip1);

        //tests
        expect(answer).toBe(null);
    });

    it("should return false if it received nothing after 3 seconds", async()=>{
        //setup
        let answer:boolean;
        let answerPromise:Promise<boolean>;
        jest.useFakeTimers();

        mockOpenConnection();

        //method to test
        await networkService.openConnection(ip1);
        answerPromise = networkService.isMediaAppOnline(ip1);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        answer = await answerPromise;

        //tests
        expect(answer).toBe(false);

        //tidy up
        jest.useRealTimers();
    });
});

describe("sendRegistration() ",  ()=>{
    it("should call networkConnectionHandler.sendData with a registration-command", async()=>{
        //setup
        let registrationAcceptedCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "registration", "accepted");
        mockOpenConnectionAndReceiveDataLater(ip1, registrationAcceptedCommand);

        //method to test
        await networkService.openConnection(ip1);
        await networkService.sendRegistration(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "register", "admin"));
    });

    it("should return true if it received a registration-accepted-command", async()=>{
        //setup
        let registrationAcceptedCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "registration", "accepted");
        let answer:boolean;
        mockOpenConnectionAndReceiveDataLater(ip1, registrationAcceptedCommand);

        //method to test
        await networkService.openConnection(ip1);
        answer = await networkService.isMediaAppOnline(ip1);

        //tests
        expect(answer).toBe(true);
    });

    it("should return false if it received a registration-rejected-command", async()=>{
        //setup
        let registrationRejectedCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "registration", "rejected");
        let answer:boolean;
        mockOpenConnectionAndReceiveDataLater(ip1, registrationRejectedCommand);

        //method to test
        await networkService.openConnection(ip1);
        answer = await networkService.isMediaAppOnline(ip1);

        //tests
        expect(answer).toBe(false);
    });

    it("should return null if it received a wrong command", async()=>{
        //setup
        let pongCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "acceppted");
        let answer:boolean;
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand);

        //method to test
        await networkService.openConnection(ip1);
        answer = await networkService.isMediaAppOnline(ip1);

        //tests
        expect(answer).toBe(null);
    });

    it("should return false if it received nothing after 3 seconds", async()=>{
        //setup
        let answer:boolean;
        let answerPromise:Promise<boolean>;
        jest.useFakeTimers();

        mockOpenConnection();

        //method to test
        await networkService.openConnection(ip1);
        answerPromise = networkService.isMediaAppOnline(ip1);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        answer = await answerPromise;

        //tests
        expect(answer).toBe(false);

        //tidy up
        jest.useRealTimers();
    });
});

describe("unregisterAndClose() ",  ()=>{
    it("should call networkConnectionHandler.sendData with the correct close-connection-command", async()=>{
        //setup
        jest.useFakeTimers();

        //method to test
        networkService.unregisterAndCloseConnection(ip1);

        jest.advanceTimersByTime(3000);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "disconnect"));

        //tidy up
        jest.useRealTimers();
    });

    it("should call networkConnectionHandler.closeConnection if the connection was not closed by the server after the timeout", async()=>{
        //setup
        jest.useFakeTimers();

        //method to test
        networkService.unregisterAndCloseConnection(ip1);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        //tests
        expect(mockNetworkConnectionHandler.closeConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.closeConnection).toHaveBeenCalledWith(ip1);

        //tidy up
        jest.useRealTimers();
    });

    it("should NOT call networkConnectionHandler.closeConnection if the connection was closed by the server before the timeout", async()=>{
        //setup
        let onCloseFunc:any;
        jest.useFakeTimers();
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClose, onDataReceived)=>{
            onOpen();
            onCloseFunc = onClose;
        });

        mockNetworkConnectionHandler.sendData.mockImplementationOnce((ip, command)=>{
            onCloseFunc(ip);
        });

        //method to test
        await networkService.openConnection(ip1);
        networkService.unregisterAndCloseConnection(ip1);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        //tests
        expect(mockNetworkConnectionHandler.closeConnection).toHaveBeenCalledTimes(0);

        //tidy up
        jest.useRealTimers();
    });
});

describe("getContentFileFrom() ",  ()=>{
    it("should call mockNetworkConnectionHandler.sendData with the correct-command", async()=>{
        //setup
        let contentCommand:Uint8Array = ConvertNetworkData.encodeCommand("contents", "get");

        mockOpenConnectionAndReceiveDataLater(ip1, contentCommand);

        //method to test
        await networkService.openConnection(ip1);
        await networkService.getContentFileFrom(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, contentCommand);
    });

    it("should return the content-JSON-string if it received a correct content-command", async()=>{
        //setup
        let contentJSON:string = "{content-JSON}";
        let contentCommand:Uint8Array = ConvertNetworkData.encodeCommand("contents", "put", contentJSON);
        mockOpenConnectionAndReceiveDataLater(ip1, contentCommand);

        let answer:string;
        //method to test
        await networkService.openConnection(ip1);
        answer = await networkService.getContentFileFrom(ip1);

        //tests
        expect(answer).toBe(contentJSON);
    });

    it("should return null and print an error if it received a wrong command", async()=>{
        //setup
        let wrongCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "poiiing");
        let answer:string;
        let logSpy = jest.spyOn(console, "error");
        mockOpenConnectionAndReceiveDataLater(ip1, wrongCommand);

        //method to test
        await networkService.openConnection(ip1);
        answer = await networkService.getContentFileFrom(ip1);

        //tests
        expect(answer).toBe(null);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should return null if it received nothing after 3 seconds", async()=>{
        //setup
        let answer:string;
        let answerPromise:Promise<string>;
        jest.useFakeTimers();

        mockOpenConnection();

        //method to test
        await networkService.openConnection(ip1);
        answerPromise = networkService.getContentFileFrom(ip1);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        answer = await answerPromise;

        //tests
        expect(answer).toBe(null);

        //tidy up
        jest.useRealTimers();
    });
});

describe("sendMediaFileToIp() ",  ()=>{
    let mediaType:string = "jpeg";
    let mediaFile:Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);

    it("should call mockNetworkConnectionHandler.sendData with the correct-command", async()=>{
        //setup
        let contentCommand:Uint8Array = ConvertNetworkData.encodeCommand("media", "put", mediaType, mediaFile);

        mockOpenConnectionAndReceiveDataLater(ip1, contentCommand);

        //method to test
        await networkService.openConnection(ip1);
        await networkService.sendMediaFileToIp(ip1, mediaType, mediaFile);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, contentCommand);
    });

    it("should return the id of the newly saved media if it received a correct media-command", async()=>{
        //setup
        let returnedID:number = 20;
        let contentCommand:Uint8Array = ConvertNetworkData.encodeCommand("media", "put", returnedID.toString());
        let answer:number;

        mockOpenConnectionAndReceiveDataLater(ip1, contentCommand);
        //method to test
        await networkService.openConnection(ip1);
        answer = await networkService.sendMediaFileToIp(ip1, mediaType, mediaFile);

        //tests
        expect(answer).toBe(returnedID);
    });

    it("should return null if it received a wrong command", async()=>{
        //setup
        let wrongCommand:Uint8Array = ConvertNetworkData.encodeCommand("media", "puttt", "whatever");
        let answer:number;
        mockOpenConnectionAndReceiveDataLater(ip1, wrongCommand);

        //method to test
        await networkService.openConnection(ip1);
        answer = await networkService.sendMediaFileToIp(ip1, mediaType, mediaFile);

        //tests
        expect(answer).toBe(null);
    });

    it("should return null if it received nothing after 3 seconds", async()=>{
        //setup
        let answer:number;
        let answerPromise:Promise<number>;
        jest.useFakeTimers();

        mockOpenConnection();

        //method to test
        await networkService.openConnection(ip1);
        answerPromise = networkService.sendMediaFileToIp(ip1, mediaType, mediaFile);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        answer = await answerPromise;

        //tests
        expect(answer).toBe(null);

        //tidy up
        jest.useRealTimers();
    });
});

describe("sendContentFileTo() ",  ()=>{
    it("should call mockNetworkConnectionHandler.sendData with the correct command", async()=>{
        //setup
        let contentFileData:string = "{contentFileAsJSON}"
        //method to test
        networkService.sendContentFileTo(ip1, contentFileData);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("contents", "put", contentFileData));
    });
});

describe("sendMediaControlTo() ",  ()=>{
    it("should call mockNetworkConnectionHandler.sendData with the correct command", async()=>{
        //setup
        let mediaControlCommand:string = "play_01"
        //method to test
        networkService.sendMediaControlTo(ip1, mediaControlCommand);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("media", "control", mediaControlCommand));
    });
});

describe("sendDeleteMediaTo() ",  ()=>{
    it("should call mockNetworkConnectionHandler.sendData with the correct command", async()=>{
        //setup
        let mediaID:number = 10;
        //method to test
        networkService.sendDeleteMediaTo(ip1, mediaID);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("media", "delete", mediaID.toString()));
    });
});