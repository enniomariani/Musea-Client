import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockNetworkService} from "__mocks__/mcf/renderer/network/MockNetworkService";
import {MockMediaStationRepository} from "__mocks__/mcf/renderer/dataStructure/MockMediaStationRepository";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MockFolder} from "__mocks__/mcf/renderer/dataStructure/MockFolder";
import {MockContent} from "__mocks__/mcf/renderer/dataStructure/MockContent";
import {Image} from "src/mcf/renderer/dataStructure/Media";
import {ICachedMedia} from "src/mcf/renderer/fileHandling/MediaFileCacheHandler";
import {MediaAppSyncService, IMediaAppProgress, IMediaAppSyncEvent} from "src/mcf/renderer/network/MediaAppSyncService";

let service: MediaAppSyncService;
let mockNetworkService: MockNetworkService;
let mockMediaStationRepo: MockMediaStationRepository;

beforeEach(() => {
    mockNetworkService = new MockNetworkService();
    mockMediaStationRepo = new MockMediaStationRepository();
    service = new MediaAppSyncService(mockNetworkService, mockMediaStationRepo);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("sendMediaFilesToMediaApp()", () => {
    const fileData: Uint8Array = new Uint8Array([0x00, 0xFF, 0xEE, 0xAA]);
    let station: MockMediaStation;
    let reporter: IMediaAppProgress;
    let events: IMediaAppSyncEvent[];

    let content0: MockContent;
    let content2: MockContent;
    let image1: Image;
    let image2: Image;

    const ip = "127.0.0.10";

    const cachedMedia: ICachedMedia[] = [
        { contentId: 0, mediaAppId: 0, fileExtension: "jpeg" },
        { contentId: 2, mediaAppId: 0, fileExtension: "mp4" },
    ];

    beforeEach(() => {
        station = new MockMediaStation(0);
        station.rootFolder = new MockFolder(0);

        events = [];
        reporter = jest.fn((evt: IMediaAppSyncEvent) => {
            events.push(evt);
        });

        image1 = new Image();
        image1.idOnMediaApp = -1;
        image2 = new Image();
        image2.idOnMediaApp = -1;

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
            (mediaStationId: number, contentId: number, mediaAppId: number, fileExtension: string) => {
                if (mediaStationId === station.id) {
                    const found = cachedMedia.find(
                        (m) => m.contentId === contentId && m.mediaAppId === mediaAppId && m.fileExtension === fileExtension
                    );
                    return found ? fileData : null;
                }
                return null;
            }
        );
    });

    it("should return true and not emit events when no media is passed", async () => {
        const result = await service.sendMediaFilesToMediaApp(station, undefined as unknown as ICachedMedia[], ip, reporter);

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

        const result = await service.sendMediaFilesToMediaApp(station, cachedMedia, ip, reporter);

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
        expect(image1.idOnMediaApp).toBe(99);
        expect(image2.idOnMediaApp).toBe(-1);

        // delete cache only for success
        expect(mockMediaStationRepo.mediaCacheHandler.deleteCachedMedia).toHaveBeenCalledTimes(1);
        expect(mockMediaStationRepo.mediaCacheHandler.deleteCachedMedia).toHaveBeenCalledWith(
            station.id,
            cachedMedia[0].contentId,
            cachedMedia[0].mediaAppId
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

        const result = await service.sendMediaFilesToMediaApp(station, [cachedMedia[0]], ip, reporter);

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

describe("sendCommandDeleteMediaToMediaApps()", () => {
    let reporter: IMediaAppProgress;
    let events: IMediaAppSyncEvent[];
    const mediaStationId = 5;
    const mediaAppId = 2;
    const ip = "127.0.0.20";

    beforeEach(() => {
        events = [];
        reporter = jest.fn((evt: IMediaAppSyncEvent) => {
            events.push(evt);
        });
    });

    it("should emit DeleteStart and call network + repo for each id", async () => {
        const ids = [3, 0, 6];

        await service.sendCommandDeleteMediaToMediaApps(mediaStationId, mediaAppId, ids, ip, reporter);

        // reporter called once per id
        expect(reporter).toHaveBeenCalledTimes(ids.length);
        expect(events.map((e) => e.type)).toEqual(["DeleteStart", "DeleteStart", "DeleteStart"]);
        // Check one payload example
        expect(events[0].data).toMatchObject({ id: 3, mediaAppId: mediaAppId.toString() });

        // network deletes
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenCalledTimes(ids.length);
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenNthCalledWith(1, ip, 3);
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenNthCalledWith(2, ip, 0);
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenNthCalledWith(3, ip, 6);

        // repo cleanup
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenCalledTimes(ids.length);
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenNthCalledWith(1, mediaStationId, mediaAppId, 3);
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenNthCalledWith(2, mediaStationId, mediaAppId, 0);
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenNthCalledWith(3, mediaStationId, mediaAppId, 6);
    });

    it("should handle empty ids list without calls", async () => {
        await service.sendCommandDeleteMediaToMediaApps(mediaStationId, mediaAppId, [], ip, reporter);

        expect(reporter).toHaveBeenCalledTimes(0);
        expect(mockNetworkService.sendDeleteMediaTo).toHaveBeenCalledTimes(0);
        expect(mockMediaStationRepo.deleteStoredMediaID).toHaveBeenCalledTimes(0);
    });
});