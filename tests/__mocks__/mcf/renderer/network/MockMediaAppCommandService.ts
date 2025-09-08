import {
    MediaAppCommandService
} from "@app/mcf/renderer/network/MediaAppCommandService";
import {MockNetworkService} from "tests/__mocks__/mcf/renderer/network/MockNetworkService";

const mockNetworkService:MockNetworkService = new MockNetworkService();


export class MockMediaAppCommandService extends MediaAppCommandService{
    sendCommandPlay: jest.Mock;
    sendCommandStop: jest.Mock;
    sendCommandPause: jest.Mock;
    sendCommandRew: jest.Mock;
    sendCommandFwd: jest.Mock;

    sendCommandSeek: jest.Mock;
    sendCommandSync: jest.Mock;

    sendCommandLight: jest.Mock;

    sendCommandMute:jest.Mock;
    sendCommandUnmute:jest.Mock;
    sendCommandSetVolume:jest.Mock;

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

        this.sendCommandMute = jest.fn();
        this.sendCommandUnmute = jest.fn();
        this.sendCommandSetVolume = jest.fn();
    }
}