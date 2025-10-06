import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {NetworkService} from "src/mcf/renderer/network/NetworkService";
import {
    MockNetworkConnectionHandler
} from "__mocks__/mcf/renderer/network/MockNetworkConnectionHandler";
import {ConvertNetworkData} from "src/mcf/renderer/network/ConvertNetworkData";

let mockNetworkConnectionHandler: MockNetworkConnectionHandler;
let networkService: NetworkService;

const ip1: string = "127.0.0.1";
let timer:any;

beforeEach(() => {
    mockNetworkConnectionHandler = new MockNetworkConnectionHandler();
    networkService = new NetworkService(mockNetworkConnectionHandler);
});

afterEach(() => {
    jest.clearAllMocks();
    clearTimeout(timer);
});

function mockOpenConnection(receiveImmediateCommand: Uint8Array | null = null) {
    mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClose, onDataReceived) => {
        onOpen();

        if (receiveImmediateCommand !== null)
            onDataReceived(ip, receiveImmediateCommand);
    });

    mockNetworkConnectionHandler.sendData.mockImplementation((ip, data) => {
        console.log("mock sendData called: ", ip, data)
        // Return a resolved promise
        return Promise.resolve(true);
    });
}

function mockOpenConnectionAndReceiveDataLater(ip: string, command: Uint8Array, returnValueSendData = true) {
    let dataReceived: Function;
    mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip: string, onOpen: Function, onError: Function, onClosed: Function, onDataReceived) => {
        onOpen();
        dataReceived = onDataReceived;
    });

    mockNetworkConnectionHandler.sendData = jest.fn();
    mockNetworkConnectionHandler.sendData.mockImplementation((ip, data) => {
        console.log("mock sendData called: ", ip, data)
        // Return a resolved promise
        return Promise.resolve(returnValueSendData).then((answer) => {
            // Use setTimeout to defer dataReceived until after the actual code has finished
            console.log("mock-promise resolved", answer)
            timer = setTimeout(() => {
                console.log("timeout called: ", ip)
                dataReceived(ip, command);
            }, 20);  // Ensure it runs on the next tick, after promises are resolved

            return Promise.resolve(returnValueSendData)
        });
    });
}

describe("openConnection() ", () => {
    it("should call createConnection() of the connectionHandler with correct parameters", async () => {
        mockOpenConnection();
        await networkService.openConnection(ip1);

        expect(mockNetworkConnectionHandler.createConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.createConnection).toHaveBeenCalledWith(ip1, expect.anything(), expect.anything(), expect.anything(), expect.anything());
    });

    it("should return true if connection was created succesfully", async () => {
        mockOpenConnection();

        const answer:boolean = await networkService.openConnection(ip1);

        expect(answer).toBe(true);
    });

    it("should return true if connection already exists and print an info", async () => {
        let logSpy = jest.spyOn(console, "info");
        mockOpenConnection();

        mockNetworkConnectionHandler.hasConnection.mockReturnValueOnce(true);

        const answer:boolean = await networkService.openConnection(ip1);

        expect(answer).toBe(true);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should return false if connection was not created succesfully", async () => {
        let answer: boolean;
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError) => {
            onError();
        });

        answer = await networkService.openConnection(ip1);

        expect(answer).toBe(false);
    });

    it("should answer with pong if it receives ping signal", async () => {
        let pingCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "ping");

        mockOpenConnection(pingCommand);
        await networkService.openConnection(ip1);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "pong"));
    });

    it("should not answer if the received command is not a valid network-command", async () => {
        let nonValidCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "xyz");
        mockOpenConnection(nonValidCommand);
        await networkService.openConnection(ip1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(0);
    });

    it("should not answer if the received command is not a valid command", async () => {
        let nonValidCommand: Uint8Array = ConvertNetworkData.encodeCommand("asdfasdfasdx");
        mockOpenConnection(nonValidCommand);
        await networkService.openConnection(ip1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(0);
    });

    it("should not answer if the received command is not a valid command - 2", async () => {
        let nonValidCommand: Uint8Array = new Uint8Array([0x00, 0xFF]);
        mockOpenConnection(nonValidCommand);
        await networkService.openConnection(ip1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(0);
    });
});

describe("closeConnection() ", () => {
    it("should call mockNetworkConnectionHandler.closeConnection", async () => {
        networkService.closeConnection(ip1);

        expect(mockNetworkConnectionHandler.closeConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.closeConnection).toHaveBeenCalledWith(ip1);
    });
});

describe("onBlockReceived() ", () => {
    it("should call the callback if it received a system/block command", async () => {
        let blockCommand: Uint8Array = ConvertNetworkData.encodeCommand("system", "block");
        let blockReceivedCallback: Function = jest.fn();

        mockOpenConnection(blockCommand);

        networkService.onBlockReceived(blockReceivedCallback);
        await networkService.openConnection(ip1);

        expect(blockReceivedCallback).toHaveBeenCalledTimes(1);
    });
});

describe("onUnBlockReceived() ", () => {
    it("should call the callback if it received a system/unblock command", async () => {
        let blockCommand: Uint8Array = ConvertNetworkData.encodeCommand("system", "unblock");
        let unBlockCallback: Function = jest.fn();

        mockOpenConnection(blockCommand);

        networkService.onUnBlockReceived(unBlockCallback);
        await networkService.openConnection(ip1);

        expect(unBlockCallback).toHaveBeenCalledTimes(1);
    });
});

describe("pcRespondsToPing() ", () => {
    it("should call mockNetworkConnectionHandler.ping and return true if it is reachable", async () => {
        mockNetworkConnectionHandler.ping.mockResolvedValue(true);
        const answerPromise = networkService.pcRespondsToPing(ip1);
        const answer:boolean = await answerPromise;
        expect(answer).toBe(true);
    });

    it("should return false if PC is not reachable", async () => {
        mockNetworkConnectionHandler.ping.mockResolvedValueOnce(false);
        const answer:boolean = await networkService.pcRespondsToPing(ip1);
        expect(answer).toBe(false);
    });
});

describe("isMediaAppOnline() ", () => {
    it("should call mockNetworkConnectionHandler.sendData with a ping-command", async () => {
        let pongCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "pong");
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand);

        await networkService.openConnection(ip1);
        await networkService.isMediaAppOnline(ip1);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "ping"), null);
    });

    it("should return true if it received a pong-command", async () => {
        let pongCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "pong");
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand);

        await networkService.openConnection(ip1);
        const answer:boolean = await networkService.isMediaAppOnline(ip1);

        expect(answer).toBe(true);
    });

    it("should return null if it received a wrong command", async () => {
        let pongCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "poiiing");
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand);

        await networkService.openConnection(ip1);
        const answer:boolean  = await networkService.isMediaAppOnline(ip1);

        expect(answer).toBe(null);
    });

    it("should return false if it received nothing after 3 seconds", async () => {
        let answer: boolean;
        let answerPromise: Promise<boolean>;
        jest.useFakeTimers();

        mockOpenConnection();

        await networkService.openConnection(ip1);
        answerPromise = networkService.isMediaAppOnline(ip1);

        await Promise.resolve(); // Forces the promise to resolve after advancing timers

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        answer = await answerPromise;

        expect(answer).toBe(false);

        //tidy up
        jest.useRealTimers();
    });
});

describe("sendCheckRegistration() ", () => {
    it("should call networkConnectionHandler.sendData with a check-registration-command", async () => {
        let registrationAcceptedCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "isRegistrationPossible", "yes");
        mockOpenConnectionAndReceiveDataLater(ip1, registrationAcceptedCommand);

        await networkService.openConnection(ip1);
        await networkService.sendCheckRegistration(ip1, 0);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "isRegistrationPossible"), null);
    });

    it("should return true if it received a registration-possible-command", async () => {
        let registrationAcceptedCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "isRegistrationPossible", "yes");
        mockOpenConnectionAndReceiveDataLater(ip1, registrationAcceptedCommand);

        await networkService.openConnection(ip1);
        const answer:boolean = await networkService.sendCheckRegistration(ip1);

        expect(answer).toBe(true);
    });

    it("should return false if it received a registration-not-possible-command", async () => {
        let registrationRejectedCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "isRegistrationPossible", "no");
        mockOpenConnectionAndReceiveDataLater(ip1, registrationRejectedCommand);

        await networkService.openConnection(ip1);
        const answer:boolean = await networkService.sendCheckRegistration(ip1);

        expect(answer).toBe(false);
    });

    it("should return null if it received a wrong command", async () => {
        let pongCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "acceppted");
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand);

        await networkService.openConnection(ip1);
        const answer:boolean = await networkService.sendCheckRegistration(ip1);

        expect(answer).toBe(null);
    });

    it("should return false if it received nothing after 3 seconds", async () => {
        let answerPromise: Promise<boolean>;
        jest.useFakeTimers();

        mockOpenConnection();

        await networkService.openConnection(ip1);
        answerPromise = networkService.sendCheckRegistration(ip1);

        await Promise.resolve(); // Forces the promise to resolve after advancing timers

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        const answer:boolean = await answerPromise;

        expect(answer).toBe(false);

        jest.useRealTimers();
    });
});

describe("sendRegistrationAdminApp() ", () => {
    it("should call networkConnectionHandler.sendData with a registration-command", async () => {
        let registrationAcceptedCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "registration", "accepted");
        mockOpenConnectionAndReceiveDataLater(ip1, registrationAcceptedCommand);

        await networkService.openConnection(ip1);
        await networkService.sendRegistrationAdminApp(ip1);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "register", "admin"), null);
    });

    it("should return yes if it received a registration-accepted-command", async () => {
        let registrationAcceptedCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "registration", "accepted");
        mockOpenConnectionAndReceiveDataLater(ip1, registrationAcceptedCommand);

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationAdminApp(ip1);

        expect(answer).toBe("yes");
    });

    it("should return no if it received a registration-rejected-command", async () => {
        let registrationRejectedCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "registration", "rejected");
        mockOpenConnectionAndReceiveDataLater(ip1, registrationRejectedCommand);

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationAdminApp(ip1);

        expect(answer).toBe("no");
    });

    it("should return null if it received a wrong command", async () => {
        let pongCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "acceppted");
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand);

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationAdminApp(ip1);

        expect(answer).toBe(null);
    });

    it("should return NO if it received nothing after 3 seconds", async () => {
        let answerPromise: Promise<string>;
        jest.useFakeTimers();

        mockOpenConnection();

        await networkService.openConnection(ip1);
        answerPromise = networkService.sendRegistrationAdminApp(ip1);

        await Promise.resolve(); // Forces the promise to resolve after advancing timers

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        const answer:string = await answerPromise;

        expect(answer).toBe("no");

        jest.useRealTimers();
    });
});

describe("sendRegistrationUserApp() ", () => {
    it("should call networkConnectionHandler.sendData with a registration-command", async () => {
        let registrationAcceptedCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "registration", "accepted");
        mockOpenConnectionAndReceiveDataLater(ip1, registrationAcceptedCommand);

        await networkService.openConnection(ip1);
        await networkService.sendRegistrationUserApp(ip1);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "register", "user"), null);
    });

    it("should return yes if it received a registration-accepted-command", async () => {
        let registrationAcceptedCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "registration", "accepted");
        mockOpenConnectionAndReceiveDataLater(ip1, registrationAcceptedCommand);

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationUserApp(ip1);

        expect(answer).toBe("yes");
    });

    it("should return yes_blocked if it received a registration-accepted-but-blocked-command", async () => {
        let registrationAcceptedCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "registration", "accepted_block");
        mockOpenConnectionAndReceiveDataLater(ip1, registrationAcceptedCommand);

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationUserApp(ip1);

        expect(answer).toBe("yes_blocked");
    });

    it("should return no if it received a registration-rejected-command", async () => {
        let registrationRejectedCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "registration", "rejected");
        mockOpenConnectionAndReceiveDataLater(ip1, registrationRejectedCommand);

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationUserApp(ip1);

        expect(answer).toBe("no");
    });

    it("should return null if it received a wrong command", async () => {
        let pongCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "acceppted");
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand);

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationUserApp(ip1);

        expect(answer).toBe(null);
    });

    it("should return no if it received nothing after 3 seconds", async () => {
        let answerPromise: Promise<string>;
        jest.useFakeTimers();

        mockOpenConnection();

        await networkService.openConnection(ip1);
        answerPromise = networkService.sendRegistrationUserApp(ip1);

        await Promise.resolve(); // Forces the promise to resolve after advancing timers

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        const answer:string = await answerPromise;

        expect(answer).toBe("no");

        jest.useRealTimers();
    });
});

describe("unregisterAndClose() ", () => {
    it("should call networkConnectionHandler.sendData with the correct close-connection-command", async () => {
        jest.useFakeTimers();

        networkService.unregisterAndCloseConnection(ip1);

        jest.advanceTimersByTime(3000);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "disconnect"), null);

        jest.useRealTimers();
    });

    it("should call networkConnectionHandler.closeConnection if the connection was not closed by the server after the timeout", async () => {
        jest.useFakeTimers();

        networkService.unregisterAndCloseConnection(ip1);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        expect(mockNetworkConnectionHandler.closeConnection).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.closeConnection).toHaveBeenCalledWith(ip1);

        jest.useRealTimers();
    });

    it("should NOT call networkConnectionHandler.closeConnection if the connection was closed by the server before the timeout", async () => {
        let onCloseFunc: any;
        jest.useFakeTimers();
        mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip, onOpen, onError, onClose, onDataReceived) => {
            onOpen();
            onCloseFunc = onClose;
        });

        mockNetworkConnectionHandler.sendData.mockImplementationOnce((ip, command) => {
            onCloseFunc(ip);
        });

        await networkService.openConnection(ip1);
        networkService.unregisterAndCloseConnection(ip1);

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        expect(mockNetworkConnectionHandler.closeConnection).toHaveBeenCalledTimes(0);

        jest.useRealTimers();
    });
});

describe("getContentFileFrom() ", () => {
    it("should call mockNetworkConnectionHandler.sendData with the correct-command", async () => {
        let contentCommand: Uint8Array = ConvertNetworkData.encodeCommand("contents", "get");

        mockOpenConnectionAndReceiveDataLater(ip1, contentCommand);

        await networkService.openConnection(ip1);
        await networkService.getContentFileFrom(ip1);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, contentCommand, null);
    });

    it("should return the content-JSON-string if it received a correct content-command", async () => {
        const contentJSON: string = "{content-JSON}";
        let contentCommand: Uint8Array = ConvertNetworkData.encodeCommand("contents", "put", contentJSON);
        mockOpenConnectionAndReceiveDataLater(ip1, contentCommand);

        await networkService.openConnection(ip1);
        const answer: string | null = await networkService.getContentFileFrom(ip1);

        expect(answer).toBe(contentJSON);
    });

    it("should return null and print an error if it received a wrong command", async () => {
        let wrongCommand: Uint8Array = ConvertNetworkData.encodeCommand("network", "poiiing");
        let logSpy = jest.spyOn(console, "error");
        mockOpenConnectionAndReceiveDataLater(ip1, wrongCommand);

        await networkService.openConnection(ip1);
        const answer: string | null = await networkService.getContentFileFrom(ip1);

        expect(answer).toBe(null);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should return null if it received nothing after 3 seconds", async () => {
        jest.useFakeTimers();

        mockOpenConnection();

        await networkService.openConnection(ip1);
        const answerPromise: Promise<string | null> = networkService.getContentFileFrom(ip1);

        await Promise.resolve(); // Forces the promise to resolve after advancing timers

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(3000);

        const answer: string | null = await answerPromise;

        expect(answer).toBe(null);

        jest.useRealTimers();
    });
});

describe("sendMediaFileToIp() ", () => {
    let mediaType: string = "jpeg";
    let mediaFile: Uint8Array = new Uint8Array([0x00, 0xFF, 0x11]);

    it("should call mockNetworkConnectionHandler.sendData with the correct-command", async () => {
        let contentCommand: Uint8Array = ConvertNetworkData.encodeCommand("media", "put", mediaType, mediaFile);
        let onChunkSentCallback = jest.fn();

        mockOpenConnectionAndReceiveDataLater(ip1, contentCommand);

        await networkService.openConnection(ip1);
        await networkService.sendMediaFileToIp(ip1, mediaType, mediaFile, 0, onChunkSentCallback);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, contentCommand, onChunkSentCallback);
    });

    it("should return the id of the newly saved media if it received a correct media-command", async () => {
        let returnedID: number = 20;
        let contentCommand: Uint8Array = ConvertNetworkData.encodeCommand("media", "put", returnedID.toString());

        mockOpenConnectionAndReceiveDataLater(ip1, contentCommand);
        await networkService.openConnection(ip1);
        const answer:number = await networkService.sendMediaFileToIp(ip1, mediaType, mediaFile, 3000, jest.fn());

        expect(answer).toBe(returnedID);
    });

    it("should return null if it received a wrong command", async () => {
        let wrongCommand: Uint8Array = ConvertNetworkData.encodeCommand("media", "puttt", "whatever");
        let answer: number;
        mockOpenConnectionAndReceiveDataLater(ip1, wrongCommand);

        await networkService.openConnection(ip1);
        answer = await networkService.sendMediaFileToIp(ip1, mediaType, mediaFile, 0, jest.fn());

        expect(answer).toBe(null);
    });

    it("should print an error and return null if the connection did get lost during sending", async () => {
        let command: Uint8Array = ConvertNetworkData.encodeCommand("media", "put", "data");
        let answer: number;
        let logSpy = jest.spyOn(console, "error")
        mockOpenConnectionAndReceiveDataLater(ip1, command, false);

        await networkService.openConnection(ip1);
        answer = await networkService.sendMediaFileToIp(ip1, mediaType, mediaFile, 0, jest.fn());

        expect(answer).toBe(null);
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith("Connection closed during sending-process: reject-value: ", null);
    });

    it("should return null if it received nothing after 90 seconds", async () => {
        let answer: number;
        let answerPromise: Promise<number>;
        jest.useFakeTimers();

        mockOpenConnection();

        await networkService.openConnection(ip1);
        answerPromise = networkService.sendMediaFileToIp(ip1, mediaType, mediaFile, 0, jest.fn());

        await Promise.resolve(); // Forces the promise to resolve after advancing timers

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(90000);

        answer = await answerPromise;

        expect(answer).toBe(null);

        jest.useRealTimers();
    });
});

describe("sendContentFileTo() ", () => {
    it("should call mockNetworkConnectionHandler.sendData with the correct command", async () => {
        let contentFileData: string = "{contentFileAsJSON}"
        networkService.sendContentFileTo(ip1, contentFileData);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("contents", "put", contentFileData));
    });
});

describe("sendDeleteMediaTo() ", () => {
    it("should call mockNetworkConnectionHandler.sendData with the correct command", async () => {
        let mediaFileId: number = 13;
        await networkService.sendDeleteMediaTo(ip1, mediaFileId);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("media", "delete", mediaFileId.toString()));
    });
});

describe("sendMediaControlTo() ", () => {
    it("should call mockNetworkConnectionHandler.sendData with the correct command", async () => {
        let mediaControlCommand: string[] = ["play", "1"];
        await networkService.sendMediaControlTo(ip1, mediaControlCommand);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("media", "control", ...mediaControlCommand));
    });
});

describe("sendSystemCommandTo() ", () => {
    it("should call mockNetworkConnectionHandler.sendData with the correct command", async () => {
        let mediaControlCommand: string[] = ["volume", "mute"];
        await networkService.sendSystemCommandTo(ip1, mediaControlCommand);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("system", ...mediaControlCommand));
    });
});

describe("sendLightCommandTo() ", () => {
    it("should call mockNetworkConnectionHandler.sendData with the correct command", async () => {
        let mediaControlCommand: string[] = ["preset", "1"];
        await networkService.sendLightCommandTo(ip1, mediaControlCommand);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("light", ...mediaControlCommand));
    });
});

describe("sendDeleteMediaTo() ", () => {
    it("should call mockNetworkConnectionHandler.sendData with the correct command", async () => {
        let mediaID: number = 10;
        await networkService.sendDeleteMediaTo(ip1, mediaID);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("media", "delete", mediaID.toString()));
    });
});