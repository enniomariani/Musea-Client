import {NetworkCommandRouter} from "renderer/network/NetworkCommandRouter.js";

export class MockNetworkCommandRouter extends NetworkCommandRouter{
    onBlockReceived: jest.Mock;
    onUnBlockReceived: jest.Mock;
    routeCommand: jest.Mock;
    onPingReceived: jest.Mock;

    constructor() {
        super();
        this.onBlockReceived = jest.fn();
        this.onUnBlockReceived = jest.fn();
        this.routeCommand = jest.fn();
        this.onPingReceived = jest.fn();
    }
}