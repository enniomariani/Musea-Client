import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockNetworkService} from "src/mcf/mocks/renderer/network/MockNetworkService.js";
import {MediaStationEventService} from "renderer/services/mediastation/MediaStationEventService.js";

let service: MediaStationEventService;
let mockNetworkService: MockNetworkService;

beforeEach(() => {
    mockNetworkService = new MockNetworkService();
    service = new MediaStationEventService(mockNetworkService);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("onBlockReceived() ",  ()=> {
    it("should call the callback if the callback was called from the network-service", async () => {
        let blockReceivedCallback:() => void = jest.fn();
        mockNetworkService.onBlockReceived.mockImplementation((callback) =>{
            callback();
        })

        service.onBlockReceived(blockReceivedCallback);

        expect(blockReceivedCallback).toHaveBeenCalledTimes(1);
    });
});

describe("onUnBlockReceived() ",  ()=> {
    it("should call the callback if the callback was called from the network-service", async () => {
        let unBlockReceivedCallback:() => void = jest.fn();
        mockNetworkService.onUnBlockReceived.mockImplementation((callback) =>{
            callback();
        })

        service.onUnBlockReceived(unBlockReceivedCallback);
        expect(unBlockReceivedCallback).toHaveBeenCalledTimes(1);
    });
});