import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MediaStationSyncService} from "src/mcf/renderer/services/mediastation/MediaStationSyncService";
import {MockNetworkService} from "__mocks__/mcf/renderer/network/MockNetworkService";
import {MockMediaStationRepository} from "__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MockMediaAppConnectionService} from "__mocks__/mcf/renderer/network/MockMediaAppConnectionService";
import {MockMediaAppSyncService} from "__mocks__/mcf/renderer/network/MockMediaAppSyncService";
import {MediaApp} from "src/mcf/renderer/dataStructure/MediaApp";
import {ICachedMedia} from "src/mcf/renderer/fileHandling/MediaFileCacheHandler";
import {ProgressReporter, SyncEvent, SyncScope} from "src/mcf/renderer/services/mediastation/SyncEvents";
import {ConnectionStatus as UiConnectionStatus} from "src/mcf/renderer/services/mediastation/SyncEvents";
import {MediaAppConnectionStatus} from "src/mcf/renderer/network/MediaAppConnectionSteps";

let service: MediaStationSyncService;
let mockNetworkService: MockNetworkService;
let mockRepo: MockMediaStationRepository;
let mockConn: MockMediaAppConnectionService;
let mockAppSync: MockMediaAppSyncService;

beforeEach(() => {
    mockNetworkService = new MockNetworkService();
    mockRepo = new MockMediaStationRepository();
    mockConn = new MockMediaAppConnectionService();
    mockAppSync = new MockMediaAppSyncService();
    service = new MediaStationSyncService(
        mockNetworkService,
        mockRepo,
        mockConn,
        mockAppSync
    );
});

afterEach(() => {
    jest.clearAllMocks();
});

function createStationWithTwoApps() {
    const station = new MockMediaStation(0);
    const controller = new MediaApp(0);
    controller.name = "controller";
    controller.ip = "127.0.0.1";
    controller.role = MediaApp.ROLE_CONTROLLER;

    const app2 = new MediaApp(1);
    app2.name = "display-2";
    app2.ip = "127.0.0.2";
    app2.role = MediaApp.ROLE_DEFAULT;

    station.mediaAppRegistry.get.mockImplementation((id: number) => {
        if (id === controller.id) return controller;
        if (id === app2.id) return app2;
        throw new Error("Unknown app id");
    });
    station.mediaAppRegistry.getController.mockReturnValue(controller);

    return { station, controller, app2 };
}

describe("sync() happy-path", () => {
    it("should connect all media-apps, delegate media sync per app, send contents to controller and cleanup cache", async () => {
        const { station, controller, app2 } = createStationWithTwoApps();
        const reporter: ProgressReporter = jest.fn((e: SyncEvent) => void e);

        // Station + repo setup
        mockRepo.requireMediaStation.mockReturnValue(station);
        const cached: ICachedMedia[] = [
            { contentId: 10, mediaAppId: controller.id, fileExtension: "jpeg" },
            { contentId: 11, mediaAppId: controller.id, fileExtension: "mp4" },
            { contentId: 12, mediaAppId: app2.id, fileExtension: "png" },
        ];
        mockRepo.mediaCacheHandler.getAllCachedMedia.mockReturnValue(
            new Map<number, ICachedMedia[]>([[station.id, cached]])
        );
        mockRepo.getAllMediaIDsToDelete.mockResolvedValue(new Map<number, number[]>());

        // Connection: both apps online, controller online
        mockConn.checkConnection.mockResolvedValue(MediaAppConnectionStatus.Online);
        mockConn.connectAndRegisterToMediaApp.mockResolvedValue(true);

        // AppSync: both apps successfully send all media
        mockAppSync.sendMediaFilesToMediaApp.mockResolvedValue(true);

        // JSON exporting
        const jsonString = '{"ok":true}';
        station.exportToJSON.mockReturnValue(jsonString);

        // Act
        const result = await service.sync(station.id, reporter);

        // Assert high-level outcome
        expect(result).toBe(true);

        // Grouping by app -> two app sync calls (controller + app2)
        expect(mockAppSync.sendMediaFilesToMediaApp).toHaveBeenCalledTimes(2);
        expect(mockAppSync.sendMediaFilesToMediaApp).toHaveBeenCalledWith(
            station,
            [cached[0], cached[1]],
            controller.ip,
            expect.any(Function)
        );
        expect(mockAppSync.sendMediaFilesToMediaApp).toHaveBeenCalledWith(
            station,
            [cached[2]],
            app2.ip,
            expect.any(Function)
        );

        // No deletions -> delete API not called
        expect(mockAppSync.sendCommandDeleteMediaToMediaApps).toHaveBeenCalledTimes(0);

        // Cache station after each app handled
        expect(mockRepo.cacheMediaStation).toHaveBeenCalledTimes(2);
        expect(mockRepo.cacheMediaStation).toHaveBeenNthCalledWith(1, station.id);
        expect(mockRepo.cacheMediaStation).toHaveBeenNthCalledWith(2, station.id);

        // Contents sent to controller at the end
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledWith(controller.ip, jsonString);

        // Cached mediastation file removed last
        expect(mockRepo.removeCachedMediaStation).toHaveBeenCalledTimes(1);
        expect(mockRepo.removeCachedMediaStation).toHaveBeenCalledWith(station.id);

        // Progress events: at least show connecting + status for each app and controller stage
        const events = (reporter as jest.Mock).mock.calls.map((c) => c[0] as SyncEvent);
        const connectEvents = events.filter((e) => e.scope === SyncScope.MediaApp && e.type === "Connecting");
        const statusEvents = events.filter((e) => e.scope === SyncScope.MediaApp && e.type === "ConnectionStatus");
        expect(connectEvents.length).toBeGreaterThanOrEqual(2);
        expect(statusEvents.length).toBeGreaterThanOrEqual(2);
        expect(connectEvents.some((e: any) => e.ip === controller.ip)).toBe(true);
        expect(connectEvents.some((e: any) => e.ip === app2.ip)).toBe(true);
        expect(statusEvents.every((e: any) => e.status === UiConnectionStatus.Online)).toBe(true);
    });
});

describe("sync() when an app is offline", () => {
    it("should not send contents.json and should return false", async () => {
        const { station, controller, app2 } = createStationWithTwoApps();
        const reporter: ProgressReporter = jest.fn((e: SyncEvent) => void e);

        mockRepo.requireMediaStation.mockReturnValue(station);
        // Provide changes for both apps
        const cached: ICachedMedia[] = [
            { contentId: 10, mediaAppId: controller.id, fileExtension: "jpeg" },
            { contentId: 12, mediaAppId: app2.id, fileExtension: "png" },
        ];
        mockRepo.mediaCacheHandler.getAllCachedMedia.mockReturnValue(
            new Map<number, ICachedMedia[]>([[station.id, cached]])
        );
        mockRepo.getAllMediaIDsToDelete.mockResolvedValue(new Map<number, number[]>());

        // First app online, second app fails connection
        mockConn.checkConnection
            .mockResolvedValueOnce(MediaAppConnectionStatus.Online)
            .mockResolvedValueOnce(MediaAppConnectionStatus.TcpConnectionFailed);

        const result = await service.sync(station.id, reporter);

        expect(result).toBe(false);
        // No contents.json sent
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledTimes(0);
        // No cleanup at the end
        expect(mockRepo.removeCachedMediaStation).toHaveBeenCalledTimes(0);

        // Cache still called for the first (processed) app
        expect(mockRepo.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockRepo.cacheMediaStation).toHaveBeenCalledWith(station.id);

        // Progress status should reflect failure for one app
        const statusEvents = (reporter as jest.Mock).mock.calls
            .map((c) => c[0] as SyncEvent)
            .filter((e) => e.scope === SyncScope.MediaApp && e.type === "ConnectionStatus");
        expect(statusEvents.some((e: any) => e.status === UiConnectionStatus.TcpConnectionFailed)).toBe(true);
    });
});

describe("sync() when media sending fails for any app", () => {
    it("should not send contents.json and should return false", async () => {
        const { station, controller, app2 } = createStationWithTwoApps();
        const reporter: ProgressReporter = jest.fn((e: SyncEvent) => void e);

        mockRepo.requireMediaStation.mockReturnValue(station);
        const cached: ICachedMedia[] = [
            { contentId: 10, mediaAppId: controller.id, fileExtension: "jpeg" },
            { contentId: 12, mediaAppId: app2.id, fileExtension: "png" },
        ];
        mockRepo.mediaCacheHandler.getAllCachedMedia.mockReturnValue(
            new Map<number, ICachedMedia[]>([[station.id, cached]])
        );
        mockRepo.getAllMediaIDsToDelete.mockResolvedValue(new Map<number, number[]>());

        mockConn.checkConnection.mockResolvedValue(MediaAppConnectionStatus.Online);
        mockConn.connectAndRegisterToMediaApp.mockResolvedValue(true);

        // First app sends ok, second app fails sending
        mockAppSync.sendMediaFilesToMediaApp
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false);

        const result = await service.sync(station.id, reporter);

        expect(result).toBe(false);
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledTimes(0);
        expect(mockRepo.removeCachedMediaStation).toHaveBeenCalledTimes(0);

        // Delegation to app-sync happened for both apps
        expect(mockAppSync.sendMediaFilesToMediaApp).toHaveBeenCalledTimes(2);
    });
});

describe("sync() handles deletions per app", () => {
    it("should call delete flow for each app that has pending deletions", async () => {
        const { station, controller, app2 } = createStationWithTwoApps();
        const reporter: ProgressReporter = jest.fn((e: SyncEvent) => void e);

        mockRepo.requireMediaStation.mockReturnValue(station);
        // Only deletions, no cached media
        mockRepo.mediaCacheHandler.getAllCachedMedia.mockReturnValue(new Map<number, ICachedMedia[]>([[station.id, []]]));
        mockRepo.getAllMediaIDsToDelete.mockResolvedValue(
            new Map<number, number[]>([
                [controller.id, [3, 7]],
                [app2.id, [9]],
            ])
        );

        mockConn.checkConnection.mockResolvedValue(MediaAppConnectionStatus.Online);
        mockConn.connectAndRegisterToMediaApp.mockResolvedValue(true);

        // No media to send -> always 'true' for each call (service may not call sender at all)
        mockAppSync.sendMediaFilesToMediaApp.mockResolvedValue(true);

        const result = await service.sync(station.id, reporter);

        // All apps online, no media failures -> should send contents.json
        expect(result).toBe(true);

        // Deletions sent for each app with correct arguments
        expect(mockAppSync.sendCommandDeleteMediaToMediaApps).toHaveBeenCalledTimes(2);
        expect(mockAppSync.sendCommandDeleteMediaToMediaApps).toHaveBeenNthCalledWith(
            1, station.id, controller.id, [3, 7], controller.ip, expect.any(Function)
        );
        expect(mockAppSync.sendCommandDeleteMediaToMediaApps).toHaveBeenNthCalledWith(
            2, station.id, app2.id, [9], app2.ip, expect.any(Function)
        );
    });
});

describe("sync() with no changes at all", () => {
    it("should still validate connections and send contents when all apps are online", async () => {
        const { station, controller, app2 } = createStationWithTwoApps();
        const reporter: ProgressReporter = jest.fn((e: SyncEvent) => void e);

        mockRepo.requireMediaStation.mockReturnValue(station);
        mockRepo.mediaCacheHandler.getAllCachedMedia.mockReturnValue(new Map<number, ICachedMedia[]>([[station.id, undefined as unknown as ICachedMedia[]]]));
        mockRepo.getAllMediaIDsToDelete.mockResolvedValue(new Map<number, number[]>());

        mockConn.checkConnection.mockResolvedValue(MediaAppConnectionStatus.Online);
        mockConn.connectAndRegisterToMediaApp.mockResolvedValue(true);

        station.exportToJSON.mockReturnValue('{"empty":true}');

        const result = await service.sync(station.id, reporter);

        expect(result).toBe(true);
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledWith(controller.ip, '{"empty":true}');
        expect(mockRepo.removeCachedMediaStation).toHaveBeenCalledTimes(1);
    });
});

describe("sync() controller connection failure at final step", () => {
    it("should not send contents.json and return false when controller is not online", async () => {
        const { station, controller } = createStationWithTwoApps();
        const reporter: ProgressReporter = jest.fn((e: SyncEvent) => void e);

        mockRepo.requireMediaStation.mockReturnValue(station);
        // Changes exist but both apps send successfully
        const cached: ICachedMedia[] = [
            { contentId: 10, mediaAppId: controller.id, fileExtension: "jpeg" },
        ];
        mockRepo.mediaCacheHandler.getAllCachedMedia.mockReturnValue(
            new Map<number, ICachedMedia[]>([[station.id, cached]])
        );
        mockRepo.getAllMediaIDsToDelete.mockResolvedValue(new Map<number, number[]>());

        // Apps online - first loop iterates only 1 time, because only the controller has changes
        mockConn.checkConnection
            .mockResolvedValueOnce(MediaAppConnectionStatus.Online) // app 0
            .mockResolvedValueOnce(MediaAppConnectionStatus.TcpConnectionFailed); // final controller send check

        mockConn.connectAndRegisterToMediaApp.mockResolvedValue(true);
        mockAppSync.sendMediaFilesToMediaApp.mockResolvedValue(true);

        const result = await service.sync(station.id, reporter);

        expect(result).toBe(false);
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledTimes(0);
        expect(mockRepo.removeCachedMediaStation).toHaveBeenCalledTimes(0);

        // Progress should include a controller ConnectionStatus with non-online status
        const events = (reporter as jest.Mock).mock.calls.map((c) => c[0] as SyncEvent);
        const anyFailed = events.some((e: any) => e.scope === SyncScope.MediaApp && e.type === "ConnectionStatus" && e.status !== UiConnectionStatus.Online);
        expect(anyFailed).toBe(true);
    });
});