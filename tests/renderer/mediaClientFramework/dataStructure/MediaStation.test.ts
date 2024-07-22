import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {MediaStation} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaStation";
import {MockFolder} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockFolder";
import {MediaApp} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaApp";

let mediaStation: MediaStation;
let mediaApp1: MediaApp = new MediaApp(0);
mediaApp1.name = "app1";
mediaApp1.ip = "127.0.0.1";
mediaApp1.role = MediaApp.ROLE_CONTROLLER;
let mediaApp2: MediaApp = new MediaApp(1);
mediaApp2.name = "app2";
mediaApp2.ip = "127.0.0.2";
mediaApp2.role = MediaApp.ROLE_DEFAULT;

const jsonMock: any = {
    name: "myName",
    folderIdCounter: 1,
    contentIdCounter: 1,
    mediaAppIdCounter: 1,
    tagIdCounter: 1,
    rootFolder: {id: 0, name: "Test", subfolders: []},
    mediaApps: [{id: mediaApp1.id, name: mediaApp1.name, ip: mediaApp1.ip, role: mediaApp1.role},
        {id: mediaApp2.id, name: mediaApp2.name, ip: mediaApp2.ip, role: mediaApp2.role}],
    tags: []
}

beforeEach(() => {
    mediaStation = new MediaStation(0);
    mediaStation.mediaApps.push(mediaApp1);
    mediaStation.mediaApps.push(mediaApp2);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("exportToJSON() ", () => {
    it("should receive a valid JSON that contains all set properties of the mediaStation", () => {
        let receivedJSONstr: string;
        let receivedJSON: any;

        let mockFolder: MockFolder = new MockFolder(0);
        mockFolder.exportToJSON.mockReturnValueOnce({id: 0, name: "Test", subfolders: []});

        mediaStation.getNextMediaAppId();
        mediaStation.getNextFolderId();
        mediaStation.getNextTagId();
        mediaStation.getNextContentId();
        mediaStation.name = "myName";
        mediaStation.rootFolder = mockFolder;

        //method to test
        receivedJSONstr = mediaStation.exportToJSON();

        //tests
        expect(() => JSON.parse(receivedJSONstr)).not.toThrow();
        receivedJSON = JSON.parse(receivedJSONstr);

        expect(receivedJSON).toMatchObject(jsonMock);
    });
});

describe("importFromJSON() ", () => {
    it("should set all properties according to the passed json", () => {
        //setup
        mediaStation = new MediaStation(0);
        let mockFolder: MockFolder = new MockFolder(0);
        mediaStation.rootFolder = mockFolder;

        //method to test
        mediaStation.importFromJSON(jsonMock);

        //tests
        expect(mediaStation.name).toBe(jsonMock.name);
        expect(mediaStation.getNextFolderId()).toBe(jsonMock.folderIdCounter);
        expect(mediaStation.getNextContentId()).toBe(jsonMock.contentIdCounter);
        expect(mediaStation.getNextMediaAppId()).toBe(jsonMock.mediaAppIdCounter);
        expect(mediaStation.getNextTagId()).toBe(jsonMock.tagIdCounter);
        expect(mediaStation.mediaApps.length).toBe(2);

        expect(mediaStation.mediaApps[0].id).toBe(0);
        expect(mediaStation.mediaApps[0].name).toBe(mediaApp1.name);
        expect(mediaStation.mediaApps[0].ip).toBe(mediaApp1.ip);
        expect(mediaStation.mediaApps[0].role).toBe(mediaApp1.role);
        expect(mediaStation.mediaApps[1].id).toBe(1);
        expect(mediaStation.mediaApps[1].name).toBe(mediaApp2.name);
        expect(mediaStation.mediaApps[1].ip).toBe(mediaApp2.ip);
        expect(mediaStation.mediaApps[1].role).toBe(mediaApp2.role);
    });

    it("should pass the properties got for all folders to the root-folder", () => {
        //setup
        mediaStation = new MediaStation(0);
        mediaStation.rootFolder = new MockFolder(0);

        //method to test
        mediaStation.importFromJSON(jsonMock);

        //tests
        expect(mediaStation.rootFolder.importFromJSON).toHaveBeenCalledTimes(1);
        expect(mediaStation.rootFolder.importFromJSON).toHaveBeenCalledWith({id: 0, name: "Test", subfolders: []});
    });
});

describe("getControllerIp() ", () => {
    it("should return the IP of the controller-app", () => {
        //setup
        let returnValue: string;

        //method to test
        returnValue = mediaStation.getControllerIp();

        //tests
        expect(returnValue).toEqual(mediaApp1.ip);
    });

    it("should return null and print an error if there is no controller-app", () => {
        //setup
        let returnValue: string;
        let logSpy: any = jest.spyOn(global.console, 'error');
        mediaStation.mediaApps = [];

        //method to test
        returnValue = mediaStation.getControllerIp();

        //tests
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(returnValue).toEqual(null);
    });
});


describe("getNextMediaAppId() ", () => {
    it("should return an increased ID everytime it's called", () => {
        let idPerCall: number[] = [0, 1, 2, 3, 4, 5, 6];
        let answerPerCall: number[] = [];

        //method to test
        for (let i: number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextMediaAppId());

        //tests
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

        //method to test
        for (let i: number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextContentId());

        //tests
        for (let i: number = 0; i < idPerCall.length; i++) {
            console.log("got id: ", answerPerCall[i], " expected ID: ", idPerCall[i])
            expect(answerPerCall[i]).toBe(idPerCall[i]);
        }
    });
});

describe("getNextFolderId() ", () => {
    it("should return an increased ID everytime it's called", () => {
        let idPerCall: number[] = [0, 1, 2, 3, 4, 5, 6];
        let answerPerCall: number[] = [];

        //method to test
        for (let i: number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextFolderId());

        //tests
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

        //method to test
        for (let i: number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextTagId());

        //tests
        for (let i: number = 0; i < idPerCall.length; i++) {
            console.log("got id: ", answerPerCall[i], " expected ID: ", idPerCall[i])
            expect(answerPerCall[i]).toBe(idPerCall[i]);
        }
    });
});