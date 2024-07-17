import {NetworkInterface} from "../../../../../public_html/js/renderer/mediaClientFramework/network/NetworkInterface";

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