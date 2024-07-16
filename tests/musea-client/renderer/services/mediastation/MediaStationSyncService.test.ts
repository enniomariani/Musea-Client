import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MediaStationSyncService} from "renderer/services/mediastation/MediaStationSyncService.js";
import {MockNetworkService} from "mocks/renderer/network/MockNetworkService.js";
import {MockMediaStationRepository} from "mocks/renderer/dataStructure/MockMediaStationRepository.js";
import {MockMediaStation} from "mocks/renderer/dataStructure/MockMediaStation.js";
import {MockMediaPlayerConnectionService} from "mocks/renderer/services/MockMediaPlayerConnectionService.js";
import {MockMediaPlayerSyncService} from "mocks/renderer/network/MockMediaPlayerSyncService.js";
import {MediaPlayer, MediaPlayerRole} from "renderer/dataStructure/MediaPlayer.js";
import {ICachedMedia} from "renderer/fileHandling/MediaFileCacheHandler.js";
import {ProgressReporter, SyncEvent, SyncScope} from "renderer/services/mediastation/SyncEvents.js";
import {ConnectionStatus as UiConnectionStatus} from "renderer/services/mediastation/SyncEvents.js";
import {MediaPlayerConnectionStatus} from "renderer/network/MediaPlayerConnectionSteps.js";
import {
    IMediaPlayerProgress,
    IMediaPlayerSyncEvent,
    MediaPlayerSyncEventType
} from "renderer/network/MediaPlayerSyncService.js";
import {MediaStation} from "renderer/dataStructure/MediaStation.js";

let service: MediaStationSyncService;
let mockNetworkService: MockNetworkService;
let mockRepo: MockMediaStationRepository;
let mockConn: MockMediaPlayerConnectionService;
let mockAppSync: MockMediaPlayerSyncService;

beforeEach(() => {
    mockNetworkService = new MockNetworkService();
    mockRepo = new MockMediaStationRepository();
    mockConn = new MockMediaPlayerConnectionService();
    mockAppSync = new MockMediaPlayerSyncService();
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
    const controller = new MediaPlayer(0);
    controller.name = "controller";
    controller.ip = "127.0.0.1";
    controller.role = MediaPlayerRole.CONTROLLER;

    const app2 = new MediaPlayer(1);
    app2.name = "display-2";
    app2.ip = "127.0.0.2";
    app2.role = MediaPlayerRole.DEFAULT;

    station.mediaPlayerRegistry.require.mockImplementation((id: number) => {
        if (id === controller.id) return controller;
        if (id === app2.id) return app2;
        throw new Error("Unknown app id");
    });
    station.mediaPlayerRegistry.getController.mockReturnValue(controller);

    return { station, controller, app2 };
}

describe("sync() happy-path", () => {
    it("should connect all media-players, delegate media sync per app, send contents to controller and cleanup cache", async () => {
        const { station, controller, app2 } = createStationWithTwoApps();
        const reporter: ProgressReporter = jest.fn((e: SyncEvent) => void e);

        // Station + repo setup
        mockRepo.requireMediaStation.mockReturnValue(station);
        const cached: ICachedMedia[] = [
            { contentId: 10, mediaPlayerId: controller.id, fileExtension: "jpeg" },
            { contentId: 11, mediaPlayerId: controller.id, fileExtension: "mp4" },
            { contentId: 12, mediaPlayerId: app2.id, fileExtension: "png" },
        ];
        mockRepo.mediaCacheHandler.getAllCachedMedia.mockReturnValue(
            new Map<number, ICachedMedia[]>([[station.id, cached]])
        );
        mockRepo.getAllMediaIDsToDelete.mockResolvedValue(new Map<number, number[]>());

        // Connection: both apps online, controller online
        mockConn.checkConnection.mockResolvedValue(MediaPlayerConnectionStatus.Online);
        mockConn.connectAndRegisterToMediaPlayer.mockResolvedValue(true);

        // AppSync: emit progress events and return true
        mockAppSync.sendMediaFilesToMediaPlayer.mockImplementation(
            async (mediaStation: MediaStation, allCachedMedia: ICachedMedia[], ipMediaPlayer: string, reporter: IMediaPlayerProgress) =>{
                reporter({ type: MediaPlayerSyncEventType.MediaSendStart });
                reporter({type:MediaPlayerSyncEventType.MediaSending, data: {progress: "."}});
                reporter({ type: MediaPlayerSyncEventType.MediaSendSuccess });

                return true;
            });

        // JSON exporting
        const jsonString = '{"ok":true}';
        station.exportToJSON.mockReturnValue(jsonString);

        // Act
        const result = await service.sync(station.id, reporter);

        // Assert high-level outcome
        expect(result).toBe(true);

        // Grouping by app -> two app sync calls (controller + app2)
        expect(mockAppSync.sendMediaFilesToMediaPlayer).toHaveBeenCalledTimes(2);
        expect(mockAppSync.sendMediaFilesToMediaPlayer).toHaveBeenCalledWith(
            station,
            [cached[0], cached[1]],
            controller.ip,
            expect.any(Function)
        );
        expect(mockAppSync.sendMediaFilesToMediaPlayer).toHaveBeenCalledWith(
            station,
            [cached[2]],
            app2.ip,
            expect.any(Function)
        );

        // No deletions -> delete API not called
        expect(mockAppSync.sendCommandDeleteMediaToMediaPlayers).toHaveBeenCalledTimes(0);

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
        const events:SyncEvent[] = (reporter as jest.Mock).mock.calls.map((c) => c[0] as SyncEvent);
        console.log("sync-events: ", events)
        const connectEvents = events.filter((e) => e.scope === SyncScope.MediaPlayer && e.type === "Connecting");
        const statusEvents = events.filter((e) => e.scope === SyncScope.MediaPlayer && e.type === "ConnectionStatus");
        expect(connectEvents.length).toBeGreaterThanOrEqual(2);
        expect(statusEvents.length).toBeGreaterThanOrEqual(2);
        expect(connectEvents.some((e: any) => e.ip === controller.ip)).toBe(true);
        expect(connectEvents.some((e: any) => e.ip === app2.ip)).toBe(true);
        expect(statusEvents.every((e: any) => e.status === UiConnectionStatus.Online)).toBe(true);

        //Progress events: check media send, progress + sent events
        const mediaSendEvents = events.filter((e) => e.scope === SyncScope.MediaPlayer && e.type === "MediaSendStart");
        const mediaSendProgressEvents = events.filter((e) => e.scope === SyncScope.MediaPlayer && e.type === "MediaSendingProgress");
        const MediaSendSuccessEvents = events.filter((e) => e.scope === SyncScope.MediaPlayer && e.type === "MediaSendSuccess");

        expect(mediaSendEvents.length).toBe(2);
        expect(mediaSendProgressEvents.length).toBe(2);
        expect(MediaSendSuccessEvents.length).toBe(2);
        expect(mediaSendProgressEvents.every((e: any) => e.progressPoint === ".")).toBe(true);
    });
});

describe("sync() when an app is offline", () => {
    it("should not send contents.json and should return false", async () => {
        const { station, controller, app2 } = createStationWithTwoApps();
        const reporter: ProgressReporter = jest.fn((e: SyncEvent) => void e);

        mockRepo.requireMediaStation.mockReturnValue(station);
        // Provide changes for both apps
        const cached: ICachedMedia[] = [
            { contentId: 10, mediaPlayerId: controller.id, fileExtension: "jpeg" },
            { contentId: 12, mediaPlayerId: app2.id, fileExtension: "png" },
        ];
        mockRepo.mediaCacheHandler.getAllCachedMedia.mockReturnValue(
            new Map<number, ICachedMedia[]>([[station.id, cached]])
        );
        mockRepo.getAllMediaIDsToDelete.mockResolvedValue(new Map<number, number[]>());

        // First app online, second app fails registration
        mockConn.checkConnection
            .mockResolvedValueOnce(MediaPlayerConnectionStatus.Online)
            .mockResolvedValueOnce(MediaPlayerConnectionStatus.Online);
        mockConn.connectAndRegisterToMediaPlayer
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false);

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
            .filter((e) => e.scope === SyncScope.MediaPlayer && e.type === "ConnectionStatus");
        expect(statusEvents.some((e: any) => e.status === UiConnectionStatus.RegistrationFailed)).toBe(true);
    });
});

describe("sync() when media sending fails for any app", () => {
    it("should not send contents.json and should return false", async () => {
        const { station, controller, app2 } = createStationWithTwoApps();
        const reporter: ProgressReporter = jest.fn((e: SyncEvent) => void e);

        mockRepo.requireMediaStation.mockReturnValue(station);
        const cached: ICachedMedia[] = [
            { contentId: 10, mediaPlayerId: controller.id, fileExtension: "jpeg" },
            { contentId: 12, mediaPlayerId: app2.id, fileExtension: "png" },
        ];
        mockRepo.mediaCacheHandler.getAllCachedMedia.mockReturnValue(
            new Map<number, ICachedMedia[]>([[station.id, cached]])
        );
        mockRepo.getAllMediaIDsToDelete.mockResolvedValue(new Map<number, number[]>());

        mockConn.checkConnection.mockResolvedValue(MediaPlayerConnectionStatus.Online);
        mockConn.connectAndRegisterToMediaPlayer.mockResolvedValue(true);

        // First app sends ok, second app fails sending
        mockAppSync.sendMediaFilesToMediaPlayer
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false);

        const result = await service.sync(station.id, reporter);

        expect(result).toBe(false);
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledTimes(0);
        expect(mockRepo.removeCachedMediaStation).toHaveBeenCalledTimes(0);

        // Delegation to app-sync happened for both apps
        expect(mockAppSync.sendMediaFilesToMediaPlayer).toHaveBeenCalledTimes(2);
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

        mockConn.checkConnection.mockResolvedValue(MediaPlayerConnectionStatus.Online);
        mockConn.connectAndRegisterToMediaPlayer.mockResolvedValue(true);

        // No media to send -> always 'true' for each call (service may not call sender at all)
        mockAppSync.sendMediaFilesToMediaPlayer.mockResolvedValue(true);

        const result = await service.sync(station.id, reporter);

        // All apps online, no media failures -> should send contents.json
        expect(result).toBe(true);

        // Deletions sent for each app with correct arguments
        expect(mockAppSync.sendCommandDeleteMediaToMediaPlayers).toHaveBeenCalledTimes(2);
        expect(mockAppSync.sendCommandDeleteMediaToMediaPlayers).toHaveBeenNthCalledWith(
            1, station.id, controller.id, [3, 7], controller.ip, expect.any(Function)
        );
        expect(mockAppSync.sendCommandDeleteMediaToMediaPlayers).toHaveBeenNthCalledWith(
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

        mockConn.checkConnection.mockResolvedValue(MediaPlayerConnectionStatus.Online);
        mockConn.connectAndRegisterToMediaPlayer.mockResolvedValue(true);

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
            { contentId: 10, mediaPlayerId: controller.id, fileExtension: "jpeg" },
        ];
        mockRepo.mediaCacheHandler.getAllCachedMedia.mockReturnValue(
            new Map<number, ICachedMedia[]>([[station.id, cached]])
        );
        mockRepo.getAllMediaIDsToDelete.mockResolvedValue(new Map<number, number[]>());

        // Apps online - first loop iterates only 1 time, because only the controller has changes
        mockConn.checkConnection
            .mockResolvedValueOnce(MediaPlayerConnectionStatus.Online) // app 0
            .mockResolvedValueOnce(MediaPlayerConnectionStatus.TcpConnectionFailed); // final controller send check

        mockConn.connectAndRegisterToMediaPlayer.mockResolvedValue(true);
        mockAppSync.sendMediaFilesToMediaPlayer.mockResolvedValue(true);

        const result = await service.sync(station.id, reporter);

        expect(result).toBe(false);
        expect(mockNetworkService.sendContentFileTo).toHaveBeenCalledTimes(0);
        expect(mockRepo.removeCachedMediaStation).toHaveBeenCalledTimes(0);

        // Progress should include a controller ConnectionStatus with non-online status
        const events = (reporter as jest.Mock).mock.calls.map((c) => c[0] as SyncEvent);
        const anyFailed = events.some((e: any) => e.scope === SyncScope.MediaPlayer && e.type === "ConnectionStatus" && e.status !== UiConnectionStatus.Online);
        expect(anyFailed).toBe(true);
    });
});