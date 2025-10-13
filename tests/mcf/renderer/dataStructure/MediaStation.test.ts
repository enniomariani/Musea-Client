import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {MediaStation} from "../../../../renderer/dataStructure/MediaStation.js";
import {MockFolder} from "src/mcf/mocks/renderer/dataStructure/MockFolder.js";
import {MediaApp, MediaAppRole} from "../../../../renderer/dataStructure/MediaApp.js";
import {Tag} from "../../../../renderer/dataStructure/Tag.js";
import {MockTagRegistry} from "src/mcf/mocks/renderer/registries/MockTagRegistry.js";
import {MockMediaAppRegistry} from "src/mcf/mocks/renderer/registries/MockMediaAppRegistry.js";

let mediaStation: MediaStation;
let mockTagRegistry:MockTagRegistry;
let mockMediaAppRegistry:MockMediaAppRegistry;

let mediaApp1: MediaApp = new MediaApp(0);
mediaApp1.name = "app1";
mediaApp1.ip = "127.0.0.1";
mediaApp1.role = MediaAppRole.CONTROLLER;
let mediaApp2: MediaApp = new MediaApp(1);
mediaApp2.name = "app2";
mediaApp2.ip = "127.0.0.2";
mediaApp2.role = MediaAppRole.DEFAULT;

const date:Date = new Date();
const jsonMock: any = {
    lastSync: date.toLocaleString(),
    name: "newName",
    folderIdCounter: 2,
    contentIdCounter: 1,
    mediaAppIdCounter: 1,
    tagIdCounter: 1,
    rootFolder: {id: 0, name: "Test", subfolders: []},
    mediaApps: [{id: mediaApp1.id, name: mediaApp1.name, ip: mediaApp1.ip, role: mediaApp1.role},
        {id: mediaApp2.id, name: mediaApp2.name, ip: mediaApp2.ip, role: mediaApp2.role}],
    tags: [{id: 0, name: "tag1"},
        {id:3, name: "tag2"}]
}

beforeEach(() => {
    mockTagRegistry = new MockTagRegistry();
    mockMediaAppRegistry = new MockMediaAppRegistry();
    mediaStation = new MediaStation(0, mockTagRegistry, mockMediaAppRegistry);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("reset() ", () => {
    it("should set all value to the standard-values (except keeping the id and name)", () => {
        const name:string = "mediastationNAme";
        mediaStation.name = name;
        mediaStation.rootFolder.name = "root";

        //increase the ids to test if the ids have been reset after the calling of the function
        mediaStation.getNextMediaAppId();
        mediaStation.getNextMediaAppId();
        mediaStation.getNextFolderId();
        mediaStation.getNextFolderId();
        mediaStation.getNextContentId();
        mediaStation.getNextContentId();
        mediaStation.getNextTagId();
        mediaStation.getNextTagId();

        mediaStation.reset();

        expect(mediaStation.name).toEqual(name);
        expect(mediaStation.rootFolder.name).toEqual("root");
        expect(mediaStation.getNextMediaAppId()).toEqual(0);
        expect(mediaStation.getNextContentId()).toEqual(0);
        expect(mediaStation.getNextTagId()).toEqual(0);
        expect(mediaStation.getNextFolderId()).toEqual(1);
        expect(mockMediaAppRegistry.reset).toHaveBeenCalledTimes(2);    //2 because the constructor also calls reset
        expect(mockTagRegistry.reset).toHaveBeenCalledTimes(2);
    });
});

describe("exportToJSON() ", () => {
    it("should receive a valid JSON that contains all set properties of the mediaStation", () => {
        let receivedJSONstr: string;
        let receivedJSON: any;
        let tag1:Tag = new Tag(0, "tag1");
        let tag2:Tag = new Tag(3, "tag2");

        let mockFolder: MockFolder = new MockFolder(0);
        mockFolder.exportToJSON.mockReturnValueOnce({id: 0, name: "Test", subfolders: []});

        mediaStation.getNextMediaAppId();
        mediaStation.getNextFolderId();
        mediaStation.getNextTagId();
        mediaStation.getNextContentId();
        mediaStation.name = "newName";
        mediaStation.rootFolder = mockFolder;

        mockTagRegistry.getAll.mockReturnValueOnce(new Map([[0, tag1],[3,tag2]]));
        mockMediaAppRegistry.getAll.mockReturnValueOnce(new Map([[mediaApp1.id, mediaApp1],[mediaApp2.id,mediaApp2]]));

        receivedJSONstr = mediaStation.exportToJSON(date);

        expect(() => JSON.parse(receivedJSONstr)).not.toThrow();
        receivedJSON = JSON.parse(receivedJSONstr);

        expect(receivedJSON).toMatchObject(jsonMock);
    });
});

describe("importFromJSON() ", () => {
    it("should set all properties according to the passed json", () => {
        mediaStation.name = "testName";
        let mockFolder: MockFolder = new MockFolder(0);
        mediaStation.rootFolder = mockFolder;

        mediaStation.importFromJSON(jsonMock, false, new MockFolder(0));

        expect(mediaStation.name).toBe("newName");
        expect(mediaStation.getNextFolderId()).toBe(jsonMock.folderIdCounter);
        expect(mediaStation.getNextContentId()).toBe(jsonMock.contentIdCounter);
        expect(mediaStation.getNextMediaAppId()).toBe(jsonMock.mediaAppIdCounter);
        expect(mediaStation.getNextTagId()).toBe(jsonMock.tagIdCounter);

        expect(mockMediaAppRegistry.importFromJSON).toHaveBeenCalledTimes(1);
        expect(mockMediaAppRegistry.importFromJSON).toHaveBeenCalledWith(jsonMock.mediaApps);

        expect(mockTagRegistry.add).toHaveBeenCalledTimes(2);
        expect(mockTagRegistry.add).toHaveBeenCalledWith(0, "tag1");
        expect(mockTagRegistry.add).toHaveBeenCalledWith(3, "tag2");
    });

    it("should not overwrite the name if preserveName is true", () => {
        mediaStation.name = "testName";
        let mockFolder: MockFolder = new MockFolder(0);
        mediaStation.rootFolder = mockFolder;

        mediaStation.importFromJSON(jsonMock, true, new MockFolder(0));

        expect(mediaStation.name).toBe("testName");
    });

    it("should pass the properties got for all folders to the root-folder", () => {
        mediaStation.rootFolder = new MockFolder(0);

        mediaStation.importFromJSON(jsonMock, false, new MockFolder(0));

        expect(mediaStation.rootFolder.importFromJSON).toHaveBeenCalledTimes(1);
        expect(mediaStation.rootFolder.importFromJSON).toHaveBeenCalledWith({id: 0, name: "Test", subfolders: []});
    });

    it("should reset the root folder", () => {
        const mockRootFolder: MockFolder = new MockFolder(2);
        mockRootFolder.name = "testName"

        mediaStation.importFromJSON(jsonMock, false, mockRootFolder);

        expect(mediaStation.rootFolder.id).toBe(2);
        expect(mediaStation.rootFolder.name).toBe(mockRootFolder.name);
    });
});

describe("getNextMediaAppId() ", () => {
    it("should return an increased ID everytime it's called", () => {
        let idPerCall: number[] = [0, 1, 2, 3, 4, 5, 6];
        let answerPerCall: number[] = [];

        for (let i: number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextMediaAppId());

        for (let i: number = 0; i < idPerCall.length; i++) {
            console.log("got id: ", answerPerCall[i], " expected ID: ", idPerCall[i])
            expect(answerPerCall[i]).toBe(idPerCall[i]);
        }

    });
});

describe("getNextContentId() ", () => {
    it("should return an increased ID everytime it's called", () => {
        let idPerCall: number[] = [0, 1, 2, 3, 4, 5, 6];
        let answerPerCall: number[] = [];

        for (let i: number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextContentId());

        for (let i: number = 0; i < idPerCall.length; i++) {
            console.log("got id: ", answerPerCall[i], " expected ID: ", idPerCall[i])
            expect(answerPerCall[i]).toBe(idPerCall[i]);
        }
    });
});

describe("getNextFolderId() ", () => {
    it("should return an increased ID everytime it's called", () => {
        let idPerCall: number[] = [1, 2, 3, 4, 5, 6];   //starts at 1 because 0 is the root folder which already set when creating the mediastation
        let answerPerCall: number[] = [];

        for (let i: number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextFolderId());

        for (let i: number = 0; i < idPerCall.length; i++) {
            console.log("got id: ", answerPerCall[i], " expected ID: ", idPerCall[i])
            expect(answerPerCall[i]).toBe(idPerCall[i]);
        }
    });
});

describe("getNextTagId() ", () => {
    it("should return an increased ID everytime it's called", () => {
        let idPerCall: number[] = [0, 1, 2, 3, 4, 5, 6];
        let answerPerCall: number[] = [];

        for (let i: number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextTagId());

        for (let i: number = 0; i < idPerCall.length; i++) {
            console.log("got id: ", answerPerCall[i], " expected ID: ", idPerCall[i])
            expect(answerPerCall[i]).toBe(idPerCall[i]);
        }
    });
});