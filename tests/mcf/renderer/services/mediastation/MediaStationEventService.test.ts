import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockNetworkService} from "__mocks__/mcf/renderer/network/MockNetworkService";
import {MediaStationEventService} from "src/mcf/renderer/services/mediastation/MediaStationEventService";

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
        let blockReceivedCallback:Function = jest.fn();
        mockNetworkService.onBlockReceived.mockImplementation((callback) =>{
            callback();
        })

        // Method to test
        service.onBlockReceived(blockReceivedCallback);

        expect(blockReceivedCallback).toHaveBeenCalledTimes(1);
    });
});

describe("onUnBlockReceived() ",  ()=> {
    it("should call the callback if the callback was called from the network-service", async () => {
        let unBlockReceivedCallback:Function = jest.fn();
        mockNetworkService.onUnBlockReceived.mockImplementation((callback) =>{
            callback();
        })

        // Method to test
        service.onUnBlockReceived(unBlockReceivedCallback);

        expect(unBlockReceivedCallback).toHaveBeenCalledTimes(1);
    });
});