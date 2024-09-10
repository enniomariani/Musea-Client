import {NetworkService} from "../../../../../src/js/mcf/renderer/services/NetworkService";
import {MockNetworkConnectionHandler} from "../network/MockNetworkConnectionHandler";

const mockNetworkConnectionHandler:MockNetworkConnectionHandler = new MockNetworkConnectionHandler();


export class MockNetworkService extends NetworkService{
    openConnection: jest.Mock;
    closeConnection: jest.Mock;
    pcRespondsToPing: jest.Mock;
    isMediaAppOnline: jest.Mock;
    sendRegistration: jest.Mock;
    unregisterAndCloseConnection: jest.Mock;


    getContentFileFrom: jest.Mock;
    sendMediaFileToIp: jest.Mock;
    sendContentFileTo: jest.Mock;
    sendMediaControlTo: jest.Mock;
    sendSystemCommandTo: jest.Mock;
    sendDeleteMediaTo: jest.Mock;

    sendLightCommandTo: jest.Mock;

    constructor() {
        super(mockNetworkConnectionHandler);
        this.openConnection = jest.fn();
        this.closeConnection = jest.fn();
        this.pcRespondsToPing = jest.fn();
        this.isMediaAppOnline = jest.fn();
        this.sendRegistration = jest.fn();
        this.unregisterAndCloseConnection = jest.fn();

        this.getContentFileFrom = jest.fn();
        this.sendMediaFileToIp = jest.fn();
        this.sendContentFileTo = jest.fn();
        this.sendMediaControlTo = jest.fn();
        this.sendSystemCommandTo = jest.fn();
        this.sendDeleteMediaTo = jest.fn();

        this.sendLightCommandTo = jest.fn();

    }
}