import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {MockFolder} from "mocks/renderer/dataStructure/MockFolder.js";
import {MediaPlayer, MediaPlayerRole} from "renderer/dataStructure/MediaPlayer.js";
import {Tag} from "renderer/dataStructure/Tag.js";
import {MockTagRegistry} from "mocks/renderer/registries/MockTagRegistry.js";
import {MockMediaPlayerRegistry} from "mocks/renderer/registries/MockMediaPlayerRegistry.js";

let mediaStation: MediaStation;
let mockTagRegistry:MockTagRegistry;
let mockMediaPlayerRegistry:MockMediaPlayerRegistry;

let mediaPlayer1: MediaPlayer = new MediaPlayer(0);
mediaPlayer1.name = "app1";
mediaPlayer1.ip = "127.0.0.1";
mediaPlayer1.role = MediaPlayerRole.CONTROLLER;
let mediaPlayer2: MediaPlayer = new MediaPlayer(1);
mediaPlayer2.name = "app2";
mediaPlayer2.ip = "127.0.0.2";
mediaPlayer2.role = MediaPlayerRole.DEFAULT;

const date:Date = new Date();
const jsonMock: any = {
    lastSync: date.toLocaleString(),
    name: "newName",
    folderIdCounter: 2,
    contentIdCounter: 1,
    mediaPlayerIdCounter: 1,
    tagIdCounter: 1,
    rootFolder: {id: 0, name: "Test", subfolders: []},
    mediaPlayers: [{id: mediaPlayer1.id, name: mediaPlayer1.name, ip: mediaPlayer1.ip, role: mediaPlayer1.role},
        {id: mediaPlayer2.id, name: mediaPlayer2.name, ip: mediaPlayer2.ip, role: mediaPlayer2.role}],
    tags: [{id: 0, name: "tag1"},
        {id:3, name: "tag2"}]
}

beforeEach(() => {
    mockTagRegistry = new MockTagRegistry();
    mockMediaPlayerRegistry = new MockMediaPlayerRegistry();
    mediaStation = new MediaStation(0, mockTagRegistry, mockMediaPlayerRegistry);
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
        mediaStation.getNextMediaPlayerId();
        mediaStation.getNextMediaPlayerId();
        mediaStation.getNextFolderId();
        mediaStation.getNextFolderId();
        mediaStation.getNextContentId();
        mediaStation.getNextContentId();
        mediaStation.getNextTagId();
        mediaStation.getNextTagId();

        mediaStation.reset();

        expect(mediaStation.name).toEqual(name);
        expect(mediaStation.rootFolder.name).toEqual("root");
        expect(mediaStation.getNextMediaPlayerId()).toEqual(0);
        expect(mediaStation.getNextContentId()).toEqual(0);
        expect(mediaStation.getNextTagId()).toEqual(0);
        expect(mediaStation.getNextFolderId()).toEqual(1);
        expect(mockMediaPlayerRegistry.reset).toHaveBeenCalledTimes(2);    //2 because the constructor also calls reset
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

        mediaStation.getNextMediaPlayerId();
        mediaStation.getNextFolderId();
        mediaStation.getNextTagId();
        mediaStation.getNextContentId();
        mediaStation.name = "newName";
        mediaStation.rootFolder = mockFolder;

        mockTagRegistry.getAll.mockReturnValueOnce(new Map([[0, tag1],[3,tag2]]));
        mockMediaPlayerRegistry.getAll.mockReturnValueOnce(new Map([[mediaPlayer1.id, mediaPlayer1],[mediaPlayer2.id,mediaPlayer2]]));

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
        expect(mediaStation.getNextMediaPlayerId()).toBe(jsonMock.mediaPlayerIdCounter);
        expect(mediaStation.getNextTagId()).toBe(jsonMock.tagIdCounter);

        expect(mockMediaPlayerRegistry.importFromJSON).toHaveBeenCalledTimes(1);
        expect(mockMediaPlayerRegistry.importFromJSON).toHaveBeenCalledWith(jsonMock.mediaPlayers);

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

describe("getNextMediaPlayerId() ", () => {
    it("should return an increased ID everytime it's called", () => {
        let idPerCall: number[] = [0, 1, 2, 3, 4, 5, 6];
        let answerPerCall: number[] = [];

        for (let i: number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextMediaPlayerId());

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