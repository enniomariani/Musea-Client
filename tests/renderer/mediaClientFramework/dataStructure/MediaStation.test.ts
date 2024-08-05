import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {MediaStation} from "../../../../src/js/renderer/mediaClientFramework/dataStructure/MediaStation";
import {MockFolder} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockFolder";
import {MediaApp} from "../../../../src/js/renderer/mediaClientFramework/dataStructure/MediaApp";

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
        mediaStation.addMediaApp(mediaApp1.id, mediaApp1.name, mediaApp1.ip, mediaApp1.role)
        mediaStation.addMediaApp(mediaApp2.id, mediaApp2.name, mediaApp2.ip, mediaApp2.role)

        //method to test
        receivedJSONstr = mediaStation.exportToJSON();

        //tests
        expect(() => JSON.parse(receivedJSONstr)).not.toThrow();
        receivedJSON = JSON.parse(receivedJSONstr);

        expect(receivedJSON).toMatchObject(jsonMock);
    });
});

describe("importMediaAppsFromJSON() ", () => {
    it("should set all properties of the media-apps according to the JSON", () => {
        //setup
        mediaStation = new MediaStation(0);
        let mediaApp1:MediaApp;
        let mediaApp2:MediaApp;

        //method to test
        mediaStation.importMediaAppsFromJSON(jsonMock);

        //tests
        mediaApp1 = mediaStation.getMediaApp(0);
        mediaApp2 = mediaStation.getMediaApp(1);

        expect(mediaStation.getNextMediaAppId()).toBe(jsonMock.mediaAppIdCounter);

        expect(mediaApp1.id).toBe(0);
        expect(mediaApp1.name).toBe(mediaApp1.name);
        expect(mediaApp1.ip).toBe(mediaApp1.ip);
        expect(mediaApp1.role).toBe(mediaApp1.role);
        expect(mediaApp2.id).toBe(1);
        expect(mediaApp2.name).toBe(mediaApp2.name);
        expect(mediaApp2.ip).toBe(mediaApp2.ip);
        expect(mediaApp2.role).toBe(mediaApp2.role);
    });

    it("should remove the already added mediaApps from the array", () => {
        //setup
        mediaStation = new MediaStation(0);

        mediaStation.addMediaApp(0,"test1", "127.0.0.1", MediaApp.ROLE_CONTROLLER)
        mediaStation.addMediaApp(1,"test1", "127.0.0.1", MediaApp.ROLE_DEFAULT)

        //method to test
        mediaStation.importMediaAppsFromJSON({mediaAppIdCounter: 2});

        //tests
        expect(mediaStation.getAllMediaApps().size).toBe(0);
    });
});

describe("importFromJSON() ", () => {
    it("should set all properties according to the passed json", () => {
        //setup
        mediaStation = new MediaStation(0);
        let mockFolder: MockFolder = new MockFolder(0);
        let mediaApp1:MediaApp;
        let mediaApp2:MediaApp;
        mediaStation.rootFolder = mockFolder;

        //method to test
        mediaStation.importFromJSON(jsonMock, new MockFolder(0));

        //tests
        expect(mediaStation.name).toBe(jsonMock.name);
        expect(mediaStation.getNextFolderId()).toBe(jsonMock.folderIdCounter);
        expect(mediaStation.getNextContentId()).toBe(jsonMock.contentIdCounter);
        expect(mediaStation.getNextMediaAppId()).toBe(jsonMock.mediaAppIdCounter);
        expect(mediaStation.getNextTagId()).toBe(jsonMock.tagIdCounter);

        mediaApp1 = mediaStation.getMediaApp(0);
        mediaApp2 = mediaStation.getMediaApp(1);

        expect(mediaApp1.id).toBe(0);
        expect(mediaApp1.name).toBe(mediaApp1.name);
        expect(mediaApp1.ip).toBe(mediaApp1.ip);
        expect(mediaApp1.role).toBe(mediaApp1.role);
        expect(mediaApp2.id).toBe(1);
        expect(mediaApp2.name).toBe(mediaApp2.name);
        expect(mediaApp2.ip).toBe(mediaApp2.ip);
        expect(mediaApp2.role).toBe(mediaApp2.role);
    });

    it("should pass the properties got for all folders to the root-folder", () => {
        //setup
        mediaStation = new MediaStation(0);
        mediaStation.rootFolder = new MockFolder(0);

        //method to test
        mediaStation.importFromJSON(jsonMock, new MockFolder(0));

        //tests
        expect(mediaStation.rootFolder.importFromJSON).toHaveBeenCalledTimes(1);
        expect(mediaStation.rootFolder.importFromJSON).toHaveBeenCalledWith({id: 0, name: "Test", subfolders: []});
    });

    it("should reset the root folder", () => {
        //setup
        mediaStation = new MediaStation(0);
        const mockRootFolder:MockFolder = new MockFolder(2);
        mockRootFolder.name = "testName"

        //method to test
        mediaStation.importFromJSON(jsonMock, mockRootFolder);

        //tests
        expect(mediaStation.rootFolder.id).toBe(2);
        expect(mediaStation.rootFolder.name).toBe(mockRootFolder.name);
    });

    it("should remove the already added mediaApps from the array", () => {
        //setup
        mediaStation = new MediaStation(0);

        mediaStation.addMediaApp(0,"test1", "127.0.0.1", MediaApp.ROLE_CONTROLLER)
        mediaStation.addMediaApp(1,"test1", "127.0.0.1", MediaApp.ROLE_DEFAULT)

        //method to test
        mediaStation.importMediaAppsFromJSON({mediaAppIdCounter: 2});

        //tests
        expect(mediaStation.getAllMediaApps().size).toBe(0);
    });
});

describe("getControllerIp() ", () => {
    it("should return the IP of the controller-app", () => {
        //setup
        let returnValue: string;
        mediaStation.addMediaApp(mediaApp1.id, mediaApp1.name, mediaApp1.ip, mediaApp1.role);

        //method to test
        returnValue = mediaStation.getControllerIp();

        //tests
        expect(returnValue).toBe(mediaApp1.ip);
    });

    it("should return null and print an error if there is no controller-app", () => {
        //setup
        let returnValue: string;
        let logSpy: any = jest.spyOn(global.console, 'error');

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

describe("addMediaApp() and getMediaApp()", () => {
    it("getMediApp should return the mediaApp that was created with addMediaApp()", () => {
        //setup
        let receivedMediaApp:MediaApp;
        let mediaApp:MediaApp = new MediaApp(0);
        mediaApp.ip = "localhost"
        mediaApp.name = "firstMediaApp"
        mediaApp.role = MediaApp.ROLE_CONTROLLER;

        //method to test
        mediaStation.addMediaApp(0, mediaApp.name, mediaApp.ip, mediaApp.role);
        receivedMediaApp = mediaStation.getMediaApp(0);

        //tests
        expect(receivedMediaApp).toStrictEqual(mediaApp);
    });

    it("getMediaApp() should throw an error if it does not exist", () => {
        //tests
        expect(()=>mediaStation.getMediaApp(20)).toThrow(new Error("Media App with the following ID does not exist: 20"))
    });
});