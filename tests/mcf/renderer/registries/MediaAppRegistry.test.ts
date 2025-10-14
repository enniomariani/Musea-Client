import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockMediaStation} from "mocks/renderer/dataStructure/MockMediaStation.js";
import {MediaAppRegistry} from "renderer/registries/MediaAppRegistry.js";
import {MediaApp, MediaAppRole} from "renderer/dataStructure/MediaApp.js";

let registry: MediaAppRegistry;
let mockMediaStation: MockMediaStation;

let mediaAppController: MediaApp = new MediaApp(0);
mediaAppController.ip = "127.0.0.1";
mediaAppController.name = "testName";
mediaAppController.role = MediaAppRole.CONTROLLER;

let mediaAppDefault: MediaApp = new MediaApp(1);
mediaAppDefault.ip = "127.0.0.2";
mediaAppDefault.name = "testName2";

beforeEach(() => {
    mockMediaStation = new MockMediaStation(0);
    mockMediaStation.getNextTagId.mockReturnValue(200);

    registry = new MediaAppRegistry();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("add() and get()", () => {
    it("get should return the mediaApp that was created with add()", () => {
        registry.add(0, mediaAppController.name, mediaAppController.ip, mediaAppController.role);
        const receivedMediaApp: MediaApp | null = registry.get(0);
        expect(receivedMediaApp).toStrictEqual(mediaAppController);
    });

    it("get() should return null if mediaApp does not exist", () => {
        registry.add(0, mediaAppController.name, mediaAppController.ip, mediaAppController.role);
        const receivedMediaApp: MediaApp | null = registry.get(200);
        expect(receivedMediaApp).toEqual(null);
    });
});

describe("add(), reset(), getAll()", () => {
    it("adding 2 media-apps should return them with getAll, resetting should return an empty map", () => {
        let receivedMediaApps: Map<number, MediaApp>;

        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaAppController.id, mediaAppController.name, mediaAppController.ip, mediaAppController.role);
        mockMediaStation.getNextTagId.mockReturnValueOnce(1);
        registry.add(mediaAppDefault.id, mediaAppDefault.name, mediaAppDefault.ip, mediaAppDefault.role);

        receivedMediaApps = registry.getAll();

        expect(receivedMediaApps.get(0)).toStrictEqual(mediaAppController);
        expect(receivedMediaApps.get(1)).toStrictEqual(mediaAppDefault);

        registry.reset();
        expect(registry.getAll().size).toBe(0);
    });
});

describe("add(), getController()", () => {
    it("add a media-app with the role controller, getController() should return it", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaAppController.id, mediaAppController.name, mediaAppController.ip, mediaAppController.role);

        const controllerReceived: MediaApp | null = registry.getController();

        expect(controllerReceived).toStrictEqual(mediaAppController);
    });

    it("add 2 media-app where one has the role controller should return it when calling getController()", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaAppController.id, mediaAppController.name, mediaAppController.ip, mediaAppController.role);
        mockMediaStation.getNextTagId.mockReturnValueOnce(1);
        registry.add(mediaAppDefault.id, mediaAppDefault.name, mediaAppDefault.ip, mediaAppDefault.role);

        const controllerReceived: MediaApp | null = registry.getController();

        expect(controllerReceived).toEqual(mediaAppController);
    });

    it("add a media-app without the role controller should return null when calling getController()", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaAppDefault.id, mediaAppDefault.name, mediaAppDefault.ip, mediaAppDefault.role);

        const controllerReceived: MediaApp | null = registry.getController();

        expect(controllerReceived).toEqual(null);
    });
});

describe("add(), getControllerIp()", () => {
    it("add a media-app with the role controller should return it's ip when calling getControllerIp()", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaAppController.id, mediaAppController.name, mediaAppController.ip, mediaAppController.role);

        const controllerIpReceived: string | null = registry.getControllerIp();

        expect(controllerIpReceived).toStrictEqual(mediaAppController.ip);
    });

    it("add 2 media-app where one has the role controller should return it's ip when calling getControllerIp()", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaAppController.id, mediaAppController.name, mediaAppController.ip, mediaAppController.role);
        mockMediaStation.getNextTagId.mockReturnValueOnce(1);
        registry.add(mediaAppDefault.id, mediaAppDefault.name, mediaAppDefault.ip, mediaAppDefault.role);

        let controllerIpReceived: string | null = registry.getControllerIp();

        expect(controllerIpReceived).toEqual(mediaAppController.ip);
    });

    it("add a media-app without the role controller should return null when calling getControllerIp()", () => {
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaAppDefault.id, mediaAppDefault.name, mediaAppDefault.ip, mediaAppDefault.role);

        let controllerIpReceived: string | null = registry.getControllerIp();

        expect(controllerIpReceived).toEqual(null);
    });
});

describe("importFromJSON()", () => {
    it("should import a list of media apps from JSON", () => {
        const json = [
            {
                id: mediaAppController.id,
                name: mediaAppController.name,
                ip: mediaAppController.ip,
                role: mediaAppController.role
            },
            {id: mediaAppDefault.id, name: mediaAppDefault.name, ip: mediaAppDefault.ip, role: mediaAppDefault.role},
        ];

        registry.importFromJSON(json);

        const all = registry.getAll();
        expect(all.size).toBe(2);
        expect(all.get(0)).toStrictEqual(mediaAppController);
        expect(all.get(1)).toStrictEqual(mediaAppDefault);
    });

    it("should clear existing media apps before importing new ones", () => {
        registry.add(99, "old", "10.0.0.1", MediaAppRole.DEFAULT);

        const json = [
            {
                id: mediaAppController.id,
                name: mediaAppController.name,
                ip: mediaAppController.ip,
                role: mediaAppController.role
            },
        ];

        registry.importFromJSON(json);

        const all = registry.getAll();
        expect(all.size).toBe(1);
        expect(all.has(99)).toBe(false);
        expect(all.get(0)).toStrictEqual(mediaAppController);
    });

    it("should throw when a required property is missing (id)", () => {
        const jsonMissingId = [
            {name: "no-id", ip: "127.0.0.3", role: MediaAppRole.DEFAULT} as any,
        ];

        expect(() => registry.importFromJSON(jsonMissingId))
            .toThrow(new Error("MediaStation: missing property in JSON: id"));
    });

    it("should throw when a required property is missing (name)", () => {
        const jsonMissingName = [
            {id: 3, ip: "127.0.0.4", role: MediaAppRole.DEFAULT} as any,
        ];

        expect(() => registry.importFromJSON(jsonMissingName))
            .toThrow(new Error("MediaStation: missing property in JSON: name"));
    });

    it("should clear the registry when json is null/undefined", () => {
        registry.add(42, "will-be-cleared", "192.168.0.1", MediaAppRole.DEFAULT);
        registry.importFromJSON(null as any);
        expect(registry.getAll().size).toBe(0);
    });
});

describe("add() and require() ", () => {
    it("should find the media-app if it exists", () => {
        registry.add(0, mediaAppController.name, mediaAppController.ip, mediaAppController.role);
        const mediaApp: MediaApp = registry.require(0);
        expect(mediaApp).toEqual(mediaAppController);
    });

    it("should throw an error if media-app-id does not exit", () => {
        expect(() => registry.require(100)).toThrow(new Error("Media-App with ID 100 does not exist!"));
    });
});