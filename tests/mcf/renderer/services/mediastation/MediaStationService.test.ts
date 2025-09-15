import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MediaStationService} from "src/mcf/renderer/services/mediastation/MediaStationService";

describe("MediaStationService", () => {
    let data: any;
    let cache: any;
    let command: any;
    let contents: any;
    let sync: any;
    let events: any;
    let facade: MediaStationService;

    beforeEach(() => {
        data = {
            loadMediaStations: jest.fn(),
            createMediaStation: jest.fn(),
            deleteMediaStation: jest.fn(),
            changeName: jest.fn(),
            getControllerIp: jest.fn(),
            getName: jest.fn(),
        };
        cache = {
            cacheMediaStation: jest.fn(),
            isMediaStationCached: jest.fn(),
        };
        command = {
            sendCommandPlay: jest.fn(),
            sendCommandStop: jest.fn(),
            sendCommandPause: jest.fn(),
            sendCommandFwd: jest.fn(),
            sendCommandRew: jest.fn(),
            sendCommandSync: jest.fn(),
            sendCommandSeek: jest.fn(),
            sendCommandLight: jest.fn(),
            sendCommandMute: jest.fn(),
            sendCommandUnmute: jest.fn(),
            sendCommandSetVolume: jest.fn(),
        };
        contents = {
            downloadContentsOfMediaStation: jest.fn(),
        };
        sync = {
            sync: jest.fn(),
        };
        events = {
            onBlockReceived: jest.fn(),
            onUnBlockReceived: jest.fn(),
        };

        facade = new MediaStationService(data, cache, command, contents, sync, events);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("data", () => {
        it("loadMediaStations forwards and returns result", async () => {
            const map = new Map<string, string>([["A", "1.2.3.4"]]);
            data.loadMediaStations.mockResolvedValueOnce(map);

            const result = await facade.loadMediaStations();

            expect(data.loadMediaStations).toHaveBeenCalledTimes(1);
            expect(result).toBe(map);
        });

        it("createMediaStation forwards and returns id", () => {
            data.createMediaStation.mockReturnValueOnce(42);

            const id = facade.createMediaStation("MS");

            expect(data.createMediaStation).toHaveBeenCalledWith("MS");
            expect(id).toBe(42);
        });

        it("deleteMediaStation forwards", async () => {
            await facade.deleteMediaStation(7);
            expect(data.deleteMediaStation).toHaveBeenCalledWith(7);
        });

        it("renameMediaStation forwards", () => {
            facade.renameMediaStation(7, "NewName");
            expect(data.changeName).toHaveBeenCalledWith(7, "NewName");
        });

        it("getControllerIp forwards and returns", () => {
            data.getControllerIp.mockReturnValueOnce("10.0.0.5");

            const ip = facade.getControllerIp(3);

            expect(data.getControllerIp).toHaveBeenCalledWith(3);
            expect(ip).toBe("10.0.0.5");
        });

        it("getMediaStationName forwards and returns", () => {
            data.getName.mockReturnValueOnce("StationX");

            const name = facade.getMediaStationName(9);

            expect(data.getName).toHaveBeenCalledWith(9);
            expect(name).toBe("StationX");
        });
    });

    describe("cache", () => {
        it("cacheMediaStation forwards", () => {
            facade.cacheMediaStation(11);
            expect(cache.cacheMediaStation).toHaveBeenCalledWith(11);
        });

        it("isMediaStationCached forwards and returns", async () => {
            cache.isMediaStationCached.mockResolvedValueOnce(true);

            const cached = await facade.isMediaStationCached(11);

            expect(cache.isMediaStationCached).toHaveBeenCalledWith(11);
            expect(cached).toBe(true);
        });
    });

    describe("command", () => {
        it("play forwards", async () => {
            await facade.play(1, 2);
            expect(command.sendCommandPlay).toHaveBeenCalledWith(1, 2);
        });
        it("stop forwards", async () => {
            await facade.stop(1);
            expect(command.sendCommandStop).toHaveBeenCalledWith(1);
        });
        it("pause forwards", async () => {
            await facade.pause(1);
            expect(command.sendCommandPause).toHaveBeenCalledWith(1);
        });
        it("forward forwards", async () => {
            await facade.forward(1);
            expect(command.sendCommandFwd).toHaveBeenCalledWith(1);
        });
        it("rewind forwards", async () => {
            await facade.rewind(1);
            expect(command.sendCommandRew).toHaveBeenCalledWith(1);
        });
        it("sync forwards", async () => {
            await facade.sync(1, 99, 12);
            expect(command.sendCommandSync).toHaveBeenCalledWith(1, 99, 12);
        });
        it("seek forwards", async () => {
            await facade.seek(1, 33);
            expect(command.sendCommandSeek).toHaveBeenCalledWith(1, 33);
        });
        it("mute forwards", async () => {
            await facade.mute(1);
            expect(command.sendCommandMute).toHaveBeenCalledWith(1);
        });
        it("unmute forwards", async () => {
            await facade.unmute(1);
            expect(command.sendCommandUnmute).toHaveBeenCalledWith(1);
        });
        it("setVolume forwards", async () => {
            await facade.setVolume(1, 0.5);
            expect(command.sendCommandSetVolume).toHaveBeenCalledWith(1, 0.5);
        });
    });

    describe("contents", () => {
        it("downloadContents forwards and returns", async () => {
            contents.downloadContentsOfMediaStation.mockResolvedValueOnce("ok");
            const res = await facade.downloadContents(3, true, "admin");
            expect(contents.downloadContentsOfMediaStation).toHaveBeenCalledWith(3, true, "admin");
            expect(res).toBe("ok");
        });
    });

    describe("syncMediaStation", () => {
        it("syncMediaStation forwards and returns", async () => {
            const cb = jest.fn();
            sync.sync.mockResolvedValueOnce(true);

            const result = await facade.syncMediaStation(5, cb);

            expect(sync.sync).toHaveBeenCalledWith(5, cb);
            expect(result).toBe(true);
        });
    });

    describe("events", () => {
        it("onBlockReceived forwards", async () => {
            const cb = jest.fn();
            facade.onBlockReceived(cb);
            expect(events.onBlockReceived).toHaveBeenCalledWith( cb);
        });

        it("onUnBlockReceived forwards", async () => {
            const cb = jest.fn();
            facade.onUnBlockReceived(cb);
            expect(events.onUnBlockReceived).toHaveBeenCalledWith( cb);
        });
    });
});