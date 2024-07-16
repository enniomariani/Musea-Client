import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {NetworkCommandRouter, PromiseHandler} from "renderer/network/NetworkCommandRouter.js";
import {ConvertNetworkData} from "renderer/network/ConvertNetworkData.js";

let networkCommandRouter: NetworkCommandRouter;

const ip: string = "127.0.0.1";
const logSpy = jest.spyOn(console, "error");

beforeEach(() => {
    networkCommandRouter = new NetworkCommandRouter();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("routeCommand() ", () => {
    const mockPromiseHandler: PromiseHandler = {
        resolve: jest.fn(),
        reject: jest.fn()
    };

    function checkLogSpyAndResolveNull():void{
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(mockPromiseHandler.resolve).toHaveBeenCalledTimes(1);
        expect(mockPromiseHandler.resolve).toHaveBeenCalledWith(null);
    }

    it("command should resolve with null and print an error if it is not valid", async () => {
        const command: string[] = ["invalid-category"];
        await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
        checkLogSpyAndResolveNull();
    });

    it("command should resolve with null and print an error if it is empty", async () => {
        const command: string[] = [];
        await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
        checkLogSpyAndResolveNull();
    });

    it("command should resolve with null and print an error if it holds an interpretation-error", async () => {
        const command: string[] = [ConvertNetworkData.INTERPRETATION_ERROR];
        await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
        checkLogSpyAndResolveNull();
    });

    describe("network-commands: ", () => {
        it("pong-command should resolve with true", async () => {
            const command: string[] = ["network", "pong"];

            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);

            expect(mockPromiseHandler.resolve).toHaveBeenCalledTimes(1);
            expect(mockPromiseHandler.resolve).toHaveBeenCalledWith(true);
        });

        it("ping-command should execute the callback correctly", async () => {
            const command: string[] = ["network", "ping"];
            const pingCallback = jest.fn();

            networkCommandRouter.onPingReceived(pingCallback);
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);

            expect(pingCallback).toHaveBeenCalledTimes(1);
            expect(pingCallback).toHaveBeenCalledWith(ip);
        });

        it("isRegistrationPossible-command should resolve with true if it gets a 'yes'", async () => {
            const command: string[] = ["network", "isRegistrationPossible", "yes"];

            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);

            expect(mockPromiseHandler.resolve).toHaveBeenCalledTimes(1);
            expect(mockPromiseHandler.resolve).toHaveBeenCalledWith(true);
        });

        it("registration-command should resolve with 'yes' if it gets a 'accepted'", async () => {
            const command: string[] = ["network", "registration", "accepted"];

            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);

            expect(mockPromiseHandler.resolve).toHaveBeenCalledTimes(1);
            expect(mockPromiseHandler.resolve).toHaveBeenCalledWith("yes");
        });

        it("registration-command should resolve with 'yes_blocked' if it gets a 'accepted_block'", async () => {
            const command: string[] = ["network", "registration", "accepted_block"];

            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);

            expect(mockPromiseHandler.resolve).toHaveBeenCalledTimes(1);
            expect(mockPromiseHandler.resolve).toHaveBeenCalledWith("yes_blocked");
        });

        it("network-command should resolve with null and print an error if it is not valid", async () => {
            const command: string[] = ["network", "invalid-command"];
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
            checkLogSpyAndResolveNull();
        });
    });

    describe("content-commands: ", () => {
        it("pong-command should resolve with true", async () => {
            const command: string[] = ["contents", "put", "contents-data"];

            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);

            expect(mockPromiseHandler.resolve).toHaveBeenCalledTimes(1);
            expect(mockPromiseHandler.resolve).toHaveBeenCalledWith("contents-data");
        });

        it("contents-command should resolve with null and print an error if the content-data is null", async () => {
            const command: string[] = ["contents", "put"];
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
            checkLogSpyAndResolveNull();
        });

        it("contents-command should resolve with null and print an error if it is not valid", async () => {
            const command: string[] = ["contents", "invalid-command"];
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
            checkLogSpyAndResolveNull();
        });
    });

    describe("content-commands: ", () => {
        it("contents-put-command should resolve with content-data", async () => {
            const command: string[] = ["contents", "put", "contents-data"];

            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);

            expect(mockPromiseHandler.resolve).toHaveBeenCalledTimes(1);
            expect(mockPromiseHandler.resolve).toHaveBeenCalledWith("contents-data");
        });

        it("contents-command should resolve with null and print an error if the content-data is null", async () => {
            const command: string[] = ["contents", "put"];
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
            checkLogSpyAndResolveNull();
        });

        it("contents-command should resolve with null and print an error if it is not valid", async () => {
            const command: string[] = ["contents", "invalid-command"];
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
            checkLogSpyAndResolveNull();
        });
    });

    describe("media-commands: ", () => {
        it("media-put-command should resolve with the id", async () => {
            const command: string[] = ["media", "put", "38"];

            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);

            expect(mockPromiseHandler.resolve).toHaveBeenCalledTimes(1);
            expect(mockPromiseHandler.resolve).toHaveBeenCalledWith(38);
        });

        it("command should resolve with null and print an error if the media-id is null", async () => {
            const command: string[] = ["media", "put"];
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
            checkLogSpyAndResolveNull();
        });

        it("command should resolve with null and print an error if the media-id is not a string", async () => {
            const command: (string|Uint8Array)[] = ["media", "put", new Uint8Array()];
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
            checkLogSpyAndResolveNull();
        });

        it("command should resolve with null and print an error if it is not valid", async () => {
            const command: string[] = ["media", "invalid-command"];
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
            checkLogSpyAndResolveNull();
        });
    });

    describe("system-commands: ", () => {
        it("block-command should execute the callback correctly", async () => {
            const command: string[] = ["system", "block"];
            const callback = jest.fn();

            networkCommandRouter.onBlockReceived(callback);
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it("unblock-command should execute the callback correctly", async () => {
            const command: string[] = ["system", "unblock"];
            const callback = jest.fn();

            networkCommandRouter.onUnBlockReceived(callback);
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it("network-command should resolve with null and print an error if it is not valid", async () => {
            const command: string[] = ["system", "invalid-command"];
            await networkCommandRouter.routeCommand(ip, command, mockPromiseHandler);
            checkLogSpyAndResolveNull();
        });
    });
});