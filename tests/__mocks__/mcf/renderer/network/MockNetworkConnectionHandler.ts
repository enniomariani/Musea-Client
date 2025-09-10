import {
    NetworkConnectionHandler
} from "../../../../../src/mcf/renderer/network/NetworkConnectionHandler";

const mockBackendNetworkService:jest.Mocked<IBackendNetworkService> = {
    ping: jest.fn(),
}


export class MockNetworkConnectionHandler extends NetworkConnectionHandler{

    createConnection: jest.Mock;
    sendData: jest.Mock;
    closeConnection: jest.Mock;
    ping: jest.Mock;
    hasConnection: jest.Mock;

    constructor() {
        super(mockBackendNetworkService);
        this.createConnection = jest.fn();
        this.sendData = jest.fn();
        this.closeConnection = jest.fn();
        this.ping = jest.fn();
        this.hasConnection = jest.fn();
    }
}