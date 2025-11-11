import {NetworkInterface} from "renderer/network/NetworkInterface.js";

export class MockNetworkInterface extends NetworkInterface{
    connectToServer: jest.Mock;
    sendDataToServer: jest.Mock;
    closeConnection: jest.Mock;

    constructor() {
        super();
        this.connectToServer = jest.fn();
        this.sendDataToServer = jest.fn();
        this.closeConnection = jest.fn();
    }
}