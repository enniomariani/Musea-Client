import {
    NetworkConnectionHandler
} from "../../../../../public_html/js/renderer/mediaClientFramework/network/NetworkConnectionHandler";
import {MockNetworkInterface} from "./MockNetworkInterface";

const mockBackendNetworkService:jest.Mocked<IBackenNetworkService> = {
    ping: jest.fn(),
}
const mockNetworkInterface:MockNetworkInterface = new MockNetworkInterface();


export class MockNetworkConnectionHandler extends NetworkConnectionHandler{

    createConnection: jest.Mock;
    sendData: jest.Mock;
    closeConnection: jest.Mock;
    ping: jest.Mock;

    constructor() {
        super(()=> mockNetworkInterface, mockBackendNetworkService);
        this.createConnection = jest.fn();
        this.sendData = jest.fn();
        this.closeConnection = jest.fn();
        this.ping = jest.fn();
    }
}