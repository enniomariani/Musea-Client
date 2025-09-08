import {
    ContentNetworkService
} from "@app/mcf/renderer/network/ContentNetworkService";
import {MockNetworkService} from "tests/__mocks__/mcf/renderer/network/MockNetworkService";

const mockNetworkService:MockNetworkService = new MockNetworkService();


export class MockContentNetworkService extends ContentNetworkService{
    sendCommandPlay: jest.Mock;
    sendCommandStop: jest.Mock;
    sendCommandPause: jest.Mock;
    sendCommandRew: jest.Mock;
    sendCommandFwd: jest.Mock;

    sendCommandSeek: jest.Mock;
    sendCommandSync: jest.Mock;

    sendCommandLight: jest.Mock;

    constructor() {
        super(mockNetworkService);
        this.sendCommandPlay = jest.fn();
        this.sendCommandStop = jest.fn();
        this.sendCommandPause = jest.fn();
        this.sendCommandRew = jest.fn();
        this.sendCommandFwd = jest.fn();

        this.sendCommandSeek = jest.fn();
        this.sendCommandSync = jest.fn();

        this.sendCommandLight = jest.fn();
    }
}