import {NetworkInterface} from "../../../../../src/js/mcf/renderer/network/NetworkInterface";

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