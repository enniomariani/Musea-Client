import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockNetworkService} from "mocks/renderer/network/MockNetworkService.js";
import {MockMediaStationRepository} from "mocks/renderer/dataStructure/MockMediaStationRepository.js";
import {MockMediaStation} from "mocks/renderer/dataStructure/MockMediaStation.js";
import {MockFolder} from "mocks/renderer/dataStructure/MockFolder.js";
import {MockContent} from "mocks/renderer/dataStructure/MockContent.js";
import {Image} from "renderer/dataStructure/Media.js";
import {ICachedMedia} from "renderer/fileHandling/MediaFileCacheHandler.js";
import {MediaPlayerSyncService, IMediaPlayerProgress, IMediaPlayerSyncEvent} from "renderer/network/MediaPlayerSyncService.js";

let service: MediaPlayerSyncService;
let mockNetworkService: MockNetworkService;
let mockMediaStationRepo: MockMediaStationRepository;

beforeEach(() => {
    mockNetworkService = new MockNetworkService();
    mockMediaStationRepo = new MockMediaStationRepository();
    service = new MediaPlayerSyncService(mockNetworkService, mockMediaStationRepo);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("sendMediaFilesToMediaPlayer()", () => {
    const fileData: Uint8Array = new Uint8Array([0x00, 0xFF, 0xEE, 0xAA]);
    let station: MockMediaStation;
    let reporter: IMediaPlayerProgress;
    let events: IMediaPlayerSyncEvent[];

    let content0: MockContent;
    let content2: MockContent;
    let image1: Image;
    let image2: Image;

    const ip = "127.0.0.10";

    const cachedMedia: ICachedMedia[] = [
        { contentId: 0, mediaPlayerId: 0, fileExtension: "jpeg" },
        { contentId: 2, mediaPlayerId: 0, fileExtension: "mp4" },
    ];

    beforeEach(() => {
        station = new MockMediaStation(0);
        station.rootFolder = new MockFolder(0);

        events = [];
        reporter = jest.fn((evt: IMediaPlayerSyncEvent) => {
            events.push(evt);
        });

        image1 = new Image();
        image1.idOnMediaPlayer = -1;
        image2 = new Image();
        image2.idOnMediaPlayer = -1;

        content0 = new MockContent(0, 0);
        content2 = new MockContent(2, 0);

        content0.media.set(0, image1);
        content2.media.set(0, image2);

        content0.requireMedia.mockReturnValue(image1);
        content2.requireMedia.mockReturnValue(image2);

        station.rootFolder.requireContent.mockImplementation((contentId: number) => {
            if (contentId === 0) return content0;
            if (contentId === 2) return content2;
            return null as any;
        });

        mockMediaStationRepo.mediaCacheHandler.getCachedMediaFile.mockImplementation(
            (mediaStationId: number, contentId: number, mediaPlayerId: number, fileExtension: string) => {
                if (mediaStationId === station.id) {
                    const found = cachedMedia.find(
                        (m) => m.contentId === contentId && m.mediaPlayerId === mediaPlayerId && m.fileExtension === fileExtension
                    );
                    return found ? fileData : null;
                }
                return null;
            }
        );
    });

    it("should return true and not emit events when no media is passed", async () => {
        const result = await service.sendMediaFilesToMediaPlayer(station, undefined as unknown as ICachedMedia[], ip, reporter);

        expect(result).toBe(true);
        expect(reporter).toHaveBeenCalledTimes(0);
        expect(mockNetworkService.sendMediaFileToIp).toHaveBeenCalledTimes(0);
        expect(mockMediaStationRepo.mediaCacheHandler.deleteCachedMedia).toHaveBeenCalledTimes(0);
    });

    it("should send media, emit progress events, set returned id and delete cache for successful sends", async () => {
        // first media succeeds with id 99, second fails (null)
        let counter = 0;
        mockNetworkService.sendMediaFileToIp.mockImplementation(() => {
            if (counter === 0) {
                counter++;
                return 99;
            }
            return null as any;
        });

        const result = await service.sendMediaFilesToMediaPlayer(station, cachedMedia, ip, reporter);

        // result is false because not all sends succeeded
        expect(result).toBe(false);

        // network calls
        expect(mockNetworkService.sendMediaFileToIp).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendMediaFileToIp).toHaveBeenNthCalledWith(
            1,
            ip,
            cachedMedia[0].fileExtension,
            fileData,
            240000,
            expect.any(Function)
        );
        expect(mockNetworkService.sendMediaFileToIp).toHaveBeenNthCalledWith(
            2,
            ip,
            cachedMedia[1].fileExtension,
            fileData,
            240000,
            expect.any(Function)
        );

        // ids updated for success only
        expect(image1.idOnMediaPlayer).toBe(99);
        expect(image2.idOnMediaPlayer).toBe(-1);

        // delete cache only for success
        expect(mockMediaStationRepo.mediaCacheHandler.deleteCachedMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.mediaCacheHandler.deleteCachedMedia).toHaveBeenCalledWith(
            station.id,
            cachedMedia[0].contentId,
            cachedMedia[0].mediaPlayerId
        );

        // events: LoadMediaStart -> MediaSendStart -> (MediaSendSuccess | MediaSendFailed) for each
        // We assert types as strings because the enum is internal to the module.
        expect(events.length).toBe(6);
        expect(events[0].type).toBe("LoadMediaStart");
        expect(events[0].data).toMatchObject({ fileExt: cachedMedia[0].fileExtension });
        expect(events[1].type).toBe("MediaSendStart");
        expect(events[2].type).toBe("MediaSendSuccess");

        expect(events[3].type).toBe("LoadMediaStart");
        expect(events[3].data).toMatchObject({ fileExt: cachedMedia[1].fileExtension });
        expect(events[4].type).toBe("MediaSendStart");
        expect(events[5].type).toBe("MediaSendFailed");
    });

    it("should forward progress messages from sendMediaFileToIp via MediaSending events", async () => {
        // Simulate the progress callback invocation
        mockNetworkService.sendMediaFileToIp.mockImplementation((_ip, _ext, _data, _timeout, progressCb) => {
            progressCb("10%");
            progressCb("50%");
            progressCb("100%");
            return 1;
        });

        const result = await service.sendMediaFilesToMediaPlayer(station, [cachedMedia[0]], ip, reporter);

        expect(result).toBe(true);
        // We expect: LoadMediaStart, MediaSendStart, MediaSending x3, MediaSendSuccess
        const types = events.map((e) => e.type);
        expect(types).toEqual([
            "LoadMediaStart",
            "MediaSendStart",
            "MediaSending",
            "MediaSending",
            "MediaSending",
            "MediaSendSuccess",
        ]);

        const progressPayloads = events.filter((e) => e.type === "MediaSending").map((e) => e.data?.progress);
        expect(progressPayloads).toEqual(["10%", "50%", "100%"]);
    });
});

describe("sendCommandDeleteMediaToMediaPlayers()", () => {
    let reporter: IMediaPlayerProgress;
    let events: IMediaPlayerSyncEvent[];
    const mediaStationId = 5;
    const mediaPlayerId = 2;
    const ip = "127.0.0.20";

    beforeEach(() => {
        events = [];
        reporter = jest.fn((evt: IMediaPlayerSyncEvent) => {
            events.push(evt);
        });
    });

    it("should emit DeleteStart and call network + repo for each id", async () => {
        const ids = [3, 0, 6];

        await service.sendCommandDeleteMediaToMediaPlayers(mediaStationId, mediaPlayerId, ids, ip, reporter);

        // reporter called once per id
        expect(reporter).toHaveBeenCalledTimes(ids.length);
        expect(events.map((e) => e.type)).toEqual(["DeleteStart", "DeleteStart", "DeleteStart"]);
        // Check one payload example
        expect(events[0].data).toMatchObject({ id: 3, mediaPlayerId: mediaPlayerId.toString() });

        // network deletes
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenCalledTimes(ids.length);
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenNthCalledWith(1, ip, 3);
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenNthCalledWith(2, ip, 0);
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenNthCalledWith(3, ip, 6);

        // repo cleanup
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenCalledTimes(ids.length);
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenNthCalledWith(1, mediaStationId, mediaPlayerId, 3);
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenNthCalledWith(2, mediaStationId, mediaPlayerId, 0);
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenNthCalledWith(3, mediaStationId, mediaPlayerId, 6);
    });

    it("should handle empty ids list without calls", async () => {
        await service.sendCommandDeleteMediaToMediaPlayers(mediaStationId, mediaPlayerId, [], ip, reporter);

        expect(reporter).toHaveBeenCalledTimes(0);
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenCalledTimes(0);
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenCalledTimes(0);
    });
});