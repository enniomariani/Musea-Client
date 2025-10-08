import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {NetworkService} from "src/mcf/renderer/network/NetworkService";
import {
    MockNetworkConnectionHandler
} from "tests/__mocks__/mcf/renderer/network/MockNetworkConnectionHandler";
import {ConvertNetworkData} from "src/mcf/renderer/network/ConvertNetworkData";
import {MockNetworkCommandRouter} from "tests/__mocks__/mcf/renderer/network/MockNetworkCommandRouter";
import {PromiseHandler} from "src/mcf/renderer/network/NetworkCommandRouter";

let mockNetworkConnectionHandler: MockNetworkConnectionHandler;
let mockCommandRouter: MockNetworkCommandRouter;
let networkService: NetworkService;

const ip1: string = "127.0.0.1";
let timer: any;

beforeEach(() => {
    mockNetworkConnectionHandler = new MockNetworkConnectionHandler();
    mockCommandRouter = new MockNetworkCommandRouter();
    networkService = new NetworkService(mockNetworkConnectionHandler, mockCommandRouter);
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

function mockOpenConnectionAndReceiveDataLater(ip: string, command: (string | Uint8Array)[], resolvedValue: any, returnValueSendData = true) {
    let dataReceived: Function;
    mockNetworkConnectionHandler.createConnection.mockImplementationOnce((ip: string, onOpen: Function, onError: Function, onClosed: Function, onDataReceived) => {
        onOpen();
        dataReceived = onDataReceived;
    });

    mockCommandRouter.routeCommand.mockImplementation((ip: string,
                                                       commandLocal: (string | Uint8Array)[],
                                                       promise?: PromiseHandler) => {

        let commandsAreTheSame:boolean = true;

        if (command.length === commandLocal.length) {
            for (let i = 0; i < command.length; i++)
                if (command[i] !== commandLocal[i])
                    commandsAreTheSame = false;
        }else
            commandsAreTheSame = false;

        console.log("mock routeCommand called: ", ip, commandLocal, command)
        console.log("resolve!", resolvedValue)

        if(commandsAreTheSame)
            promise?.resolve(resolvedValue);
        else
            promise?.reject("wrong command");
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
                dataReceived(ip, ConvertNetworkData.encodeCommand(...command));
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

        const answer: boolean = await networkService.openConnection(ip1);

        expect(answer).toBe(true);
    });

    it("should return true if connection already exists and print an info", async () => {
        let logSpy = jest.spyOn(console, "info");
        mockOpenConnection();

        mockNetworkConnectionHandler.hasConnection.mockReturnValueOnce(true);

        const answer: boolean = await networkService.openConnection(ip1);

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
        mockCommandRouter.onPingReceived.mockImplementation((callback:(ip:string) =>void) =>{
            callback(ip1);
        });

        networkService = new NetworkService(mockNetworkConnectionHandler, mockCommandRouter);

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
    it("should pass the callback to the command-router", () => {
        const callback = jest.fn();

        networkService.onBlockReceived(callback);

        expect(mockCommandRouter.onBlockReceived).toHaveBeenCalledTimes(1);
        expect(mockCommandRouter.onBlockReceived).toHaveBeenCalledWith(callback);
    });
});

describe("onUnBlockReceived() ", () => {
    it("should pass the callback to the command-router", () => {
        const callback = jest.fn();

        networkService.onUnBlockReceived(callback);

        expect(mockCommandRouter.onUnBlockReceived).toHaveBeenCalledTimes(1);
        expect(mockCommandRouter.onUnBlockReceived).toHaveBeenCalledWith(callback);
    });
});

describe("pcRespondsToPing() ", () => {
    it("should call mockNetworkConnectionHandler.ping and return true if it is reachable", async () => {
        mockNetworkConnectionHandler.ping.mockResolvedValue(true);
        const answerPromise = networkService.pcRespondsToPing(ip1);
        const answer: boolean = await answerPromise;
        expect(answer).toBe(true);
    });

    it("should return false if PC is not reachable", async () => {
        mockNetworkConnectionHandler.ping.mockResolvedValueOnce(false);
        const answer: boolean = await networkService.pcRespondsToPing(ip1);
        expect(answer).toBe(false);
    });
});

describe("isMediaAppOnline() ", () => {
    it("should call mockNetworkConnectionHandler.sendData with a ping-command", async () => {
        const pongCommand: string[] = ["network", "pong"];
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand, true);

        await networkService.openConnection(ip1);
        await networkService.isMediaAppOnline(ip1);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "ping"), null);
    });

    it("should return true if it received a pong-command", async () => {
        const pongCommand: string[] = ["network", "pong"];
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand, true);

        await networkService.openConnection(ip1);
        const answer: boolean = await networkService.isMediaAppOnline(ip1);

        expect(answer).toBe(true);
    });

    it("should return null if it received a wrong command", async () => {
        const pongCommand: string[] = ["network", "poiiing"];
        mockOpenConnectionAndReceiveDataLater(ip1, pongCommand, null);

        await networkService.openConnection(ip1);
        const answer: boolean = await networkService.isMediaAppOnline(ip1);

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
        const command: string[] = ["network", "isRegistrationPossible", "yes"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, true);

        await networkService.openConnection(ip1);
        await networkService.sendCheckRegistration(ip1, 0);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "isRegistrationPossible"), null);
    });

    it("should return true if it received a registration-possible-command", async () => {
        const command: string[] = ["network", "isRegistrationPossible", "yes"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, true);

        await networkService.openConnection(ip1);
        const answer:boolean = await networkService.sendCheckRegistration(ip1);

        expect(answer).toBe(true);
    });

    it("should return false if it received a registration-not-possible-command", async () => {
        const command: string[] = ["network", "isRegistrationPossible", "no"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, false);

        await networkService.openConnection(ip1);
        const answer:boolean = await networkService.sendCheckRegistration(ip1);

        expect(answer).toBe(false);
    });

    it("should return null if it received a wrong command", async () => {
        const command: string[] = ["network", "wrong-command"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, null);

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
        const command: string[] = ["network", "registration", "accepted"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, "yes");

        await networkService.openConnection(ip1);
        await networkService.sendRegistrationAdminApp(ip1);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "register", "admin"), null);
    });

    it("should return yes if it received a registration-accepted-command", async () => {
        const command: string[] = ["network", "registration", "accepted"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, "yes");

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationAdminApp(ip1);

        expect(answer).toBe("yes");
    });

    it("should return no if it received a registration-rejected-command", async () => {
        const command: string[] = ["network", "registration", "rejected"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, "no");

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationAdminApp(ip1);

        expect(answer).toBe("no");
    });

    it("should return null if it received a wrong command", async () => {
        const command: string[] = ["network", "acceppted"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, null);

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
        const command: string[] = ["network", "registration", "accepted"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, "yes");

        await networkService.openConnection(ip1);
        await networkService.sendRegistrationUserApp(ip1);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("network", "register", "user"), null);
    });

    it("should return yes if it received a registration-accepted-command", async () => {
        const command: string[] = ["network", "registration", "accepted"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, "yes");

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationUserApp(ip1);

        expect(answer).toBe("yes");
    });

    it("should return yes_blocked if it received a registration-accepted-but-blocked-command", async () => {
        const command: string[] = ["network", "registration", "accepted_block"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, "yes_blocked");

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationUserApp(ip1);

        expect(answer).toBe("yes_blocked");
    });

    it("should return no if it received a registration-rejected-command", async () => {
        const command: string[] = ["network", "registration", "rejected"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, "no");

        await networkService.openConnection(ip1);
        const answer:string = await networkService.sendRegistrationUserApp(ip1);

        expect(answer).toBe("no");
    });

    it("should return null if it received a wrong command", async () => {
        const command: string[] = ["network", "asfd"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, null);

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
        const command: string[] = ["contents", "get"];
        mockOpenConnectionAndReceiveDataLater(ip1, command, "not-relevant-in-this-test");

        await networkService.openConnection(ip1);
        await networkService.getContentFileFrom(ip1);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("contents", "get"), null);
    });

    it("should return the content-JSON-string if it received a correct content-command", async () => {
        const contentJSON: string = "{content-JSON}";
        const command: string[] = ["contents", "put", contentJSON];
        mockOpenConnectionAndReceiveDataLater(ip1, command, contentJSON);

        await networkService.openConnection(ip1);
        const answer: string | null = await networkService.getContentFileFrom(ip1);

        expect(answer).toBe(contentJSON);
    });

    it("should return null if it received a wrong command", async () => {
        const wrongCommand: string[] = ["contents", "asdfds"];
        mockOpenConnectionAndReceiveDataLater(ip1, wrongCommand, null);

        await networkService.openConnection(ip1);
        const answer: string | null = await networkService.getContentFileFrom(ip1);

        expect(answer).toBe(null);
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
        const command: (string|Uint8Array)[] = ["media", "put", mediaType, mediaFile];
        mockOpenConnectionAndReceiveDataLater(ip1, command, mediaFile);
        let onChunkSentCallback = jest.fn();

        await networkService.openConnection(ip1);
        await networkService.sendMediaFileToIp(ip1, mediaType, mediaFile, 0, onChunkSentCallback);

        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledTimes(1);
        expect(mockNetworkConnectionHandler.sendData).toHaveBeenCalledWith(ip1, ConvertNetworkData.encodeCommand("media", "put", mediaType, mediaFile), onChunkSentCallback);
    });

    it("should return the id of the newly saved media if it received a correct media-command", async () => {
        let returnedID: number = 20;
        const command: (string|Uint8Array)[] = ["media", "put", returnedID.toString()];
        mockOpenConnectionAndReceiveDataLater(ip1, command, returnedID);

        await networkService.openConnection(ip1);
        const answer:number = await networkService.sendMediaFileToIp(ip1, mediaType, mediaFile, 3000, jest.fn());

        expect(answer).toBe(returnedID);
    });

    it("should return null if it received a wrong command", async () => {
        const command: (string|Uint8Array)[] = ["media", "putttt", "whatever"];
        mockOpenConnectionAndReceiveDataLater(ip1,command, null);

        await networkService.openConnection(ip1);
        const answer: number = await networkService.sendMediaFileToIp(ip1, mediaType, mediaFile, 0, jest.fn());

        expect(answer).toBe(null);
    });

    it("should return null if the connection did get lost during sending", async () => {
        const command: (string|Uint8Array)[] = ["media", "putttt", "whatever"];
        mockOpenConnectionAndReceiveDataLater(ip1,command, null, false);

        await networkService.openConnection(ip1);
        const answer: number = await networkService.sendMediaFileToIp(ip1, mediaType, mediaFile, 0, jest.fn());

        expect(answer).toBe(null);
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