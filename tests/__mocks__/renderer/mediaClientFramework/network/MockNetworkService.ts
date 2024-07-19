import {NetworkService} from "../../../../../public_html/js/renderer/mediaClientFramework/services/NetworkService";
import {MockNetworkInterface} from "./MockNetworkInterface";
import {MockNetworkConnectionHandler} from "./MockNetworkConnectionHandler";

const mockNetworkConnectionHandler:MockNetworkConnectionHandler = new MockNetworkConnectionHandler();


export class MockNetworkService extends NetworkService{
    openConnection: jest.Mock;
    closeConnection: jest.Mock;
    pcRespondsToPing: jest.Mock;
    isMediaAppOnline: jest.Mock;
    getContentFileFrom: jest.Mock;
    sendMediaFileToIp: jest.Mock;
    sendContentFileTo: jest.Mock;
    sendMediaControlTo: jest.Mock;
    sendDeleteMediaTo: jest.Mock;

    constructor() {
        super(mockNetworkConnectionHandler);
        this.openConnection = jest.fn();
        this.closeConnection = jest.fn();
        this.pcRespondsToPing = jest.fn();
        this.isMediaAppOnline = jest.fn();
        this.getContentFileFrom = jest.fn();
        this.sendMediaFileToIp = jest.fn();
        this.sendContentFileTo = jest.fn();
        this.sendMediaControlTo = jest.fn();
        this.sendDeleteMediaTo = jest.fn();
    }
}