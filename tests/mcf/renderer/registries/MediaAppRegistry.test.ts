import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MediaAppRegistry} from "@app/mcf/renderer/registries/MediaAppRegistry";
import {MediaApp} from "@app/mcf/renderer/dataStructure/MediaApp";

let registry: MediaAppRegistry;
let mockMediaStation:MockMediaStation;

let mediaAppController:MediaApp = new MediaApp(0);
mediaAppController.ip = "127.0.0.1";
mediaAppController.name = "testName";
mediaAppController.role = MediaApp.ROLE_CONTROLLER;

let mediaAppDefault:MediaApp = new MediaApp(1);
mediaAppDefault.ip = "127.0.0.2";
mediaAppDefault.name = "testName2";
mediaAppDefault.role = MediaApp.ROLE_DEFAULT;

beforeEach(() => {
    mockMediaStation = new MockMediaStation(0);
    mockMediaStation.getNextTagId.mockReturnValue(200);

    registry = new MediaAppRegistry();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("add() and get()", () => {
    it("getTag should return the tag that was created with addTag()", () => {
        //setup
        let receivedMediaApp: MediaApp;

        //method to test
        registry.add(0, mediaAppController.name, mediaAppController.ip, mediaAppController.role);
        receivedMediaApp = registry.get(0);

        //tests
        expect(receivedMediaApp).toStrictEqual(mediaAppController);
    });

    it("getMediaApp() should throw an error if the tag-id does not exist", () => {
        //tests
        expect(() => registry.get(20)).toThrow(new Error("Media App with the following ID does not exist: 20"))
    });
});

describe("add(), reset(), getAll()", () => {
    it("adding 2 media-apps should return them with getAll, resetting should return an empty map", () => {
        //setup
        let receivedMediaApps: Map<number, MediaApp>;

        //method to test
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaAppController.id, mediaAppController.name, mediaAppController.ip, mediaAppController.role);
        mockMediaStation.getNextTagId.mockReturnValueOnce(1);
        registry.add(mediaAppDefault.id, mediaAppDefault.name, mediaAppDefault.ip, mediaAppDefault.role);

        receivedMediaApps = registry.getAll();

        //tests
        expect(receivedMediaApps.get(0)).toStrictEqual(mediaAppController);
        expect(receivedMediaApps.get(1)).toStrictEqual(mediaAppDefault);

        registry.reset();
        expect(registry.getAll().size).toBe(0);
    });
});

describe("add(), getControllerIp()", () => {
    it("add a media-app with the role controller should return it's ip when calling getControllerIp()", () => {
        //setup
        let controllerIpReceived: string;

        //method to test
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaAppController.id, mediaAppController.name, mediaAppController.ip, mediaAppController.role);

        controllerIpReceived = registry.getControllerIp();

        //tests
        expect(controllerIpReceived).toStrictEqual(mediaAppController.ip);
    });

    it("add 2 media-app where one has the role controller should return it's ip when calling getControllerIp()", () => {
        //setup
        let controllerIpReceived: string | null;

        //method to test
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaAppController.id, mediaAppController.name, mediaAppController.ip, mediaAppController.role);
        mockMediaStation.getNextTagId.mockReturnValueOnce(1);
        registry.add(mediaAppDefault.id, mediaAppDefault.name, mediaAppDefault.ip, mediaAppDefault.role);

        controllerIpReceived = registry.getControllerIp();

        //tests
        expect(controllerIpReceived).toEqual(mediaAppController.ip);
    });

    it("add a media-app without the role controller should return null when calling getControllerIp()", () => {
        //setup
        let controllerIpReceived: string | null;

        //method to test
        mockMediaStation.getNextTagId.mockReturnValueOnce(0);
        registry.add(mediaAppDefault.id, mediaAppDefault.name, mediaAppDefault.ip, mediaAppDefault.role);

        controllerIpReceived = registry.getControllerIp();

        //tests
        expect(controllerIpReceived).toEqual(null);
    });
});

describe("importFromJSON()", () => {
    it("should import a list of media apps from JSON", () => {
        // setup
        const json = [
            { id: mediaAppController.id, name: mediaAppController.name, ip: mediaAppController.ip, role: mediaAppController.role },
            { id: mediaAppDefault.id, name: mediaAppDefault.name, ip: mediaAppDefault.ip, role: mediaAppDefault.role },
        ];

        // method to test
        registry.importFromJSON(json);

        // tests
        const all = registry.getAll();
        expect(all.size).toBe(2);
        expect(all.get(0)).toStrictEqual(mediaAppController);
        expect(all.get(1)).toStrictEqual(mediaAppDefault);
    });

    it("should clear existing media apps before importing new ones", () => {
        // setup
        registry.add(99, "old", "10.0.0.1", MediaApp.ROLE_DEFAULT);

        const json = [
            { id: mediaAppController.id, name: mediaAppController.name, ip: mediaAppController.ip, role: mediaAppController.role },
        ];

        // method to test
        registry.importFromJSON(json);

        // tests
        const all = registry.getAll();
        expect(all.size).toBe(1);
        expect(all.has(99)).toBe(false);
        expect(all.get(0)).toStrictEqual(mediaAppController);
    });

    it("should throw when a required property is missing (id)", () => {
        // setup
        const jsonMissingId = [
            { name: "no-id", ip: "127.0.0.3", role: MediaApp.ROLE_DEFAULT } as any,
        ];

        // tests
        expect(() => registry.importFromJSON(jsonMissingId))
            .toThrow(new Error("MediaStation: missing property in JSON: id"));
    });

    it("should throw when a required property is missing (name)", () => {
        // setup
        const jsonMissingName = [
            { id: 3, ip: "127.0.0.4", role: MediaApp.ROLE_DEFAULT } as any,
        ];

        // tests
        expect(() => registry.importFromJSON(jsonMissingName))
            .toThrow(new Error("MediaStation: missing property in JSON: name"));
    });

    it("should clear the registry when json is null/undefined", () => {
        // setup
        registry.add(42, "will-be-cleared", "192.168.0.1", MediaApp.ROLE_DEFAULT);

        // method to test
        registry.importFromJSON(null as any);

        // tests
        expect(registry.getAll().size).toBe(0);
    });
});
