import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockMediaStation} from "mocks/renderer/dataStructure/MockMediaStation.js";
import {MediaPlayerRegistry} from "renderer/registries/MediaPlayerRegistry.js";
import {MediaPlayer, MediaPlayerRole} from "renderer/dataStructure/MediaPlayer.js";

let registry: MediaPlayerRegistry;
let mockMediaStation: MockMediaStation;

let mediaPlayerController: MediaPlayer = new MediaPlayer(0);
mediaPlayerController.ip = "127.0.0.1";
mediaPlayerController.name = "testName";
mediaPlayerController.role = MediaPlayerRole.CONTROLLER;

let mediaPlayerDefault: MediaPlayer = new MediaPlayer(1);
mediaPlayerDefault.ip = "127.0.0.2";
mediaPlayerDefault.name = "testName2";

beforeEach(() => {
    mockMediaStation = new MockMediaStation(0);
    mockMediaStation.getNextTagId.mockReturnValue(200);

    registry = new MediaPlayerRegistry();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("add() and get()", () => {
    it("get should return the mediaPlayer that was created with add()", () => {
        registry.add(0, mediaPlayerController.name, mediaPlayerController.ip, mediaPlayerController.role);
        const receivedMediaPlayer: MediaPlayer | null = registry.get(0);
        expect(receivedMediaPlayer).toStrictEqual(mediaPlayerController);
    });

    it("get() should return null if mediaPlayer does not exist", () => {
        registry.add(0, mediaPlayerController.name, mediaPlayerController.ip, mediaPlayerController.role);
        const receivedMediaPlayer: MediaPlayer | null = registry.get(200);
        expect(receivedMediaPlayer).toEqual(null);
    });
});

describe("add(), reset(), getAll()", () => {
    it("adding 2 media-players should return them with getAll, resetting should return an empty map", () => {
        let receivedMediaPlayers: Map<number, MediaPlayer>;

        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaPlayerController.id, mediaPlayerController.name, mediaPlayerController.ip, mediaPlayerController.role);
        mockMediaStation.getNextTagId.mockReturnValueOnce(1);
        registry.add(mediaPlayerDefault.id, mediaPlayerDefault.name, mediaPlayerDefault.ip, mediaPlayerDefault.role);

        receivedMediaPlayers = registry.getAll();

        expect(receivedMediaPlayers.get(0)).toStrictEqual(mediaPlayerController);
        expect(receivedMediaPlayers.get(1)).toStrictEqual(mediaPlayerDefault);

        registry.reset();
        expect(registry.getAll().size).toBe(0);
    });
});

describe("add(), getController()", () => {
    it("add a media-player with the role controller, getController() should return it", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaPlayerController.id, mediaPlayerController.name, mediaPlayerController.ip, mediaPlayerController.role);

        const controllerReceived: MediaPlayer | null = registry.getController();

        expect(controllerReceived).toStrictEqual(mediaPlayerController);
    });

    it("add 2 media-player where one has the role controller should return it when calling getController()", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaPlayerController.id, mediaPlayerController.name, mediaPlayerController.ip, mediaPlayerController.role);
        mockMediaStation.getNextTagId.mockReturnValueOnce(1);
        registry.add(mediaPlayerDefault.id, mediaPlayerDefault.name, mediaPlayerDefault.ip, mediaPlayerDefault.role);

        const controllerReceived: MediaPlayer | null = registry.getController();

        expect(controllerReceived).toEqual(mediaPlayerController);
    });

    it("add a media-player without the role controller should return null when calling getController()", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaPlayerDefault.id, mediaPlayerDefault.name, mediaPlayerDefault.ip, mediaPlayerDefault.role);

        const controllerReceived: MediaPlayer | null = registry.getController();

        expect(controllerReceived).toEqual(null);
    });
});

describe("add(), getControllerIp()", () => {
    it("add a media-player with the role controller should return it's ip when calling getControllerIp()", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaPlayerController.id, mediaPlayerController.name, mediaPlayerController.ip, mediaPlayerController.role);

        const controllerIpReceived: string | null = registry.getControllerIp();

        expect(controllerIpReceived).toStrictEqual(mediaPlayerController.ip);
    });

    it("add 2 media-player where one has the role controller should return it's ip when calling getControllerIp()", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaPlayerController.id, mediaPlayerController.name, mediaPlayerController.ip, mediaPlayerController.role);
        mockMediaStation.getNextTagId.mockReturnValueOnce(1);
        registry.add(mediaPlayerDefault.id, mediaPlayerDefault.name, mediaPlayerDefault.ip, mediaPlayerDefault.role);

        let controllerIpReceived: string | null = registry.getControllerIp();

        expect(controllerIpReceived).toEqual(mediaPlayerController.ip);
    });

    it("add a media-player without the role controller should return null when calling getControllerIp()", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaPlayerDefault.id, mediaPlayerDefault.name, mediaPlayerDefault.ip, mediaPlayerDefault.role);

        let controllerIpReceived: string | null = registry.getControllerIp();

        expect(controllerIpReceived).toEqual(null);
    });
});

describe("importFromJSON()", () => {
    it("should import a list of media apps from JSON", () => {
        const json = [
            {
                id: mediaPlayerController.id,
                name: mediaPlayerController.name,
                ip: mediaPlayerController.ip,
                role: mediaPlayerController.role
            },
            {id: mediaPlayerDefault.id, name: mediaPlayerDefault.name, ip: mediaPlayerDefault.ip, role: mediaPlayerDefault.role},
        ];

        registry.importFromJSON(json);

        const all = registry.getAll();
        expect(all.size).toBe(2);
        expect(all.get(0)).toStrictEqual(mediaPlayerController);
        expect(all.get(1)).toStrictEqual(mediaPlayerDefault);
    });

    it("should clear existing media apps before importing new ones", () => {
        registry.add(99, "old", "10.0.0.1", MediaPlayerRole.DEFAULT);

        const json = [
            {
                id: mediaPlayerController.id,
                name: mediaPlayerController.name,
                ip: mediaPlayerController.ip,
                role: mediaPlayerController.role
            },
        ];

        registry.importFromJSON(json);

        const all = registry.getAll();
        expect(all.size).toBe(1);
        expect(all.has(99)).toBe(false);
        expect(all.get(0)).toStrictEqual(mediaPlayerController);
    });

    it("should throw when a required property is missing (id)", () => {
        const jsonMissingId = [
            {name: "no-id", ip: "127.0.0.3", role: MediaPlayerRole.DEFAULT} as any,
        ];

        expect(() => registry.importFromJSON(jsonMissingId))
            .toThrow(new Error("MediaStation: missing property in JSON: id"));
    });

    it("should throw when a required property is missing (name)", () => {
        const jsonMissingName = [
            {id: 3, ip: "127.0.0.4", role: MediaPlayerRole.DEFAULT} as any,
        ];

        expect(() => registry.importFromJSON(jsonMissingName))
            .toThrow(new Error("MediaStation: missing property in JSON: name"));
    });

    it("should clear the registry when json is null/undefined", () => {
        registry.add(42, "will-be-cleared", "192.168.0.1", MediaPlayerRole.DEFAULT);
        registry.importFromJSON(null as any);
        expect(registry.getAll().size).toBe(0);
    });
});

describe("add() and require() ", () => {
    it("should find the media-player if it exists", () => {
        registry.add(0, mediaPlayerController.name, mediaPlayerController.ip, mediaPlayerController.role);
        const mediaPlayer: MediaPlayer = registry.require(0);
        expect(mediaPlayer).toEqual(mediaPlayerController);
    });

    it("should throw an error if media-player-id does not exit", () => {
        expect(() => registry.require(100)).toThrow(new Error("Media-Player with ID 100 does not exist!"));
    });
});