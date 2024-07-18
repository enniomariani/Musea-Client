import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {NetworkService} from "../../../../public_html/js/renderer/mediaClientFramework/services/NetworkService";
import {
    MockNetworkConnectionHandler
} from "../../../__mocks__/renderer/mediaClientFramework/network/MockNetworkConnectionHandler";
import {ConvertNetworkData} from "../../../../public_html/js/renderer/mediaClientFramework/network/ConvertNetworkData";

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

describe("openConnection() ",  ()=>{
    it("should call createConnection() of the connectionHandler with correct parameters", async()=>{
        //setup
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen)=>{
            onOpen();
        });
        //method to test
        await networkService.openConnection(ip1);

        //tests
        expect(mockNetworkConnectionHandler.createConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.createConnection).toHaveBeenCalledWith(ip1, expect.anything(), expect.anything(), expect.anything(), expect.anything());
    });

    it("should return true if connection was created succesfully", async()=>{
        //setup
        let answer:boolean;
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen)=>{
            onOpen();
        });
        //method to test
        answer = await networkService.openConnection(ip1);

        //tests
        expect(answer).toBe(true);
    });

    it("should return false if connection was not created succesfully", async()=>{
        //setup
        let answer:boolean;
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError)=>{
            onError("connection-ERROR");
        });
        //method to test
        answer = await networkService.openConnection(ip1).catch(error => false);

        //tests
        expect(answer).toBe(false);
    });

    it("should answer with pong if it receives ping signal", async()=>{
        //setup
        let pingCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "ping");
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClosed, onDataReceived)=>{
            onOpen();
            onDataReceived(ip1, pingCommand);
        });
        //method to test
        await networkService.openConnection(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "pong"));
    });

    it("should not answer if the received command is not a valid network-command", async()=>{
        //setup
        let nonValidCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "xyz");
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClosed, onDataReceived)=>{
            onOpen();
            onDataReceived(ip1, nonValidCommand);
        });
        //method to test
        await networkService.openConnection(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(0);
    });

    it("should not answer if the received command is not a valid command", async()=>{
        //setup
        let nonValidCommand:Uint8Array = ConvertNetworkData.encodeCommand("asdfasdfasdx");
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClosed, onDataReceived)=>{
            onOpen();
            onDataReceived(ip1, nonValidCommand);
        });
        //method to test
        await networkService.openConnection(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(0);
    });

    it("should not answer if the received command is not a valid command - 2", async()=>{
        //setup
        let nonValidCommand:Uint8Array = new Uint8Array([0x00, 0xFF]);
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClosed, onDataReceived)=>{
            onOpen();
            onDataReceived(ip1, nonValidCommand);
        });
        //method to test
        await networkService.openConnection(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(0);
    });
});

describe("checkIfPCisReachable() ",  ()=>{
    it("should call mockNetworkConnectionHandler.ping and return its answer", async()=>{
        //setup
        let answer:boolean;
        mockNetworkConnectionHandler.ping.mockImplementationOnce((ip)=>{
            return new Promise((resolve, reject) => {resolve(true)});
        });
        //method to test
        answer = await networkService.checkIfPCisReachable(ip1);

        //tests
        expect(mockNetworkConnectionHandler.ping).toHaveBeenCalledTimes(1);
        expect(answer).toBe(true);
    });
});

describe("checkIfPCisReachable() ",  ()=>{
    it("should call mockNetworkConnectionHandler.ping and return its answer", async()=>{
        //setup
        let answer:boolean;
        mockNetworkConnectionHandler.ping.mockImplementationOnce((ip)=>{
            return new Promise((resolve, reject) => {resolve(true)});
        });

        // Method to test
        const answerPromise = networkService.checkIfPCisReachable(ip1);

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
        const answerPromise = networkService.checkIfPCisReachable(ip1);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        const answer = await answerPromise;

        // Tests
        expect(answer).toBe(false);

        jest.useRealTimers();
    });
});

describe("checkIfMediaAppIsReachable() ",  ()=>{
    it("should call mockNetworkConnectionHandler.sendData with a ping-command", async()=>{
        //setup
        let pongCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "pong");
        let dataReceived;
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClosed, onDataReceived)=>{
            onOpen();
            dataReceived = onDataReceived;
        });
        mockNetworkConnectionHandler.sendData.mockImplementationOnce((ip, data)=>{
            dataReceived(ip, pongCommand)
        });

        //method to test
        await networkService.openConnection(ip1);
        await networkService.checkIfMediaAppIsReachable(ip1);

        //tests
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "ping"));
    });

    it("should return true if it received a pong-command", async()=>{
        //setup
        let pongCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "pong");
        let dataReceived;
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClosed, onDataReceived)=>{
            onOpen();
            dataReceived = onDataReceived;
        });
        mockNetworkConnectionHandler.sendData.mockImplementationOnce((ip, data)=>{
            dataReceived(ip, pongCommand)
        });
        let answer:boolean;
        //method to test
        await networkService.openConnection(ip1);
        answer = await networkService.checkIfMediaAppIsReachable(ip1);

        //tests
        expect(answer).toBe(true);
    });

    it("should return false if it received a wrong command", async()=>{
        //setup
        let pongCommand:Uint8Array = ConvertNetworkData.encodeCommand("network", "poiiing");
        let dataReceived;
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClosed, onDataReceived)=>{
            onOpen();
            dataReceived = onDataReceived;
        });
        mockNetworkConnectionHandler.sendData.mockImplementationOnce((ip, data)=>{
            dataReceived(ip, pongCommand)
        });
        let answer:boolean;
        //method to test
        await networkService.openConnection(ip1);
        answer = await networkService.checkIfMediaAppIsReachable(ip1);

        //tests
        expect(answer).toBe(false);
    });

    it("should return false if it received nothing after 3 seconds", async()=>{
        //setup
        let answer:boolean;
        let answerPromise:Promise<boolean>;
        jest.useFakeTimers();

        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClosed, onDataReceived)=>{
            onOpen();
        });

        //method to test
        await networkService.openConnection(ip1);
        answerPromise = networkService.checkIfMediaAppIsReachable(ip1);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        answer = await answerPromise;

        //tests
        expect(answer).toBe(false);

        //tidy up
        jest.useRealTimers();
    });
});