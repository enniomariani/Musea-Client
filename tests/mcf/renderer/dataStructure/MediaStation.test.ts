import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {MediaStation} from "../../../../src/js/mcf/renderer/dataStructure/MediaStation";
import {MockFolder} from "../../../__mocks__/mcf/renderer/dataStructure/MockFolder";
import {MediaApp} from "../../../../src/js/mcf/renderer/dataStructure/MediaApp";
import {Tag} from "../../../../src/js/mcf/renderer/dataStructure/Tag";

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
    mediaStation = new MediaStation(0);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("reset() ", () => {
    it("should set all value to the standard-values (except keeping the id and name)", () => {
        const name:string = "mediastationNAme";
        mediaStation.name = name;
        mediaStation.rootFolder.name = "root";

        //increase the tag-ids to test if the ids have been reset after the calling of the function
        mediaStation.getNextMediaAppId();
        mediaStation.getNextMediaAppId();
        mediaStation.getNextFolderId();
        mediaStation.getNextFolderId();
        mediaStation.getNextContentId();
        mediaStation.getNextContentId();
        mediaStation.getNextTagId();
        mediaStation.getNextTagId();

        mediaStation.addMediaApp(0, "testName", "localhost", MediaApp.ROLE_CONTROLLER)

        //method to test
        mediaStation.reset();

        //tests
        expect(mediaStation.name).toEqual(name);
        expect(mediaStation.rootFolder.name).toEqual("root");
        expect(mediaStation.getNextMediaAppId()).toEqual(0);
        expect(mediaStation.getNextContentId()).toEqual(0);
        expect(mediaStation.getNextTagId()).toEqual(0);
        expect(mediaStation.getNextFolderId()).toEqual(1);
        expect(mediaStation.getAllMediaApps()).toEqual(new Map());
    });
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
        mediaStation.addMediaApp(mediaApp1.id, mediaApp1.name, mediaApp1.ip, mediaApp1.role);
        mediaStation.addMediaApp(mediaApp2.id, mediaApp2.name, mediaApp2.ip, mediaApp2.role);

        mediaStation.addTag(0, "tag1");
        mediaStation.addTag(3, "tag2");

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
        mediaStation.name = "testName";
        let mockFolder: MockFolder = new MockFolder(0);
        let mediaApp1: MediaApp;
        let mediaApp2: MediaApp;
        let allTags:Map<number, Tag>;
        mediaStation.rootFolder = mockFolder;

        //method to test
        mediaStation.importFromJSON(jsonMock, new MockFolder(0));

        //tests
        expect(mediaStation.name).toBe("testName");
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

        allTags = mediaStation.getAllTags();

        expect(allTags.get(0).id).toBe(0);
        expect(allTags.get(0).name).toBe("tag1");
        expect(allTags.get(3).id).toBe(3);
        expect(allTags.get(3).name).toBe("tag2");
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
        const mockRootFolder: MockFolder = new MockFolder(2);
        mockRootFolder.name = "testName"

        //method to test
        mediaStation.importFromJSON(jsonMock, mockRootFolder);

        //tests
        expect(mediaStation.rootFolder.id).toBe(2);
        expect(mediaStation.rootFolder.name).toBe(mockRootFolder.name);
    });

    it("should remove the already added mediaApps from the array", () => {
        //setup
        const jsonWithoutMediaApps: any = jsonMock;
        jsonWithoutMediaApps.mediaApps = [];
        mediaStation = new MediaStation(0);
        const mockRootFolder: MockFolder = new MockFolder(2);
        mockRootFolder.name = "testName"

        mediaStation.addMediaApp(0, "test1", "127.0.0.1", MediaApp.ROLE_CONTROLLER)
        mediaStation.addMediaApp(1, "test1", "127.0.0.1", MediaApp.ROLE_DEFAULT)

        //method to test
        mediaStation.importFromJSON(jsonWithoutMediaApps, mockRootFolder);

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
        let idPerCall: number[] = [1, 2, 3, 4, 5, 6];   //starts at 1 because 0 is the root folder which already set when creating the mediastation
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
        let receivedMediaApp: MediaApp;
        let mediaApp: MediaApp = new MediaApp(0);
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
        expect(() => mediaStation.getMediaApp(20)).toThrow(new Error("Media App with the following ID does not exist: 20"))
    });
});

describe("addTag() and getTag()", () => {
    it("getTag should return the tag that was created with addTag()", () => {
        //setup
        let receivedTag: Tag;
        let tag:Tag = new Tag();
        tag.id = 200;
        tag.name = "testName";

        //method to test
        mediaStation.addTag(tag.id, tag.name);
        receivedTag = mediaStation.getTag(200);

        //tests
        expect(receivedTag).toStrictEqual(tag);
    });

    it("getTag() should throw an error if it does not exist", () => {
        //tests
        expect(() => mediaStation.getTag(20)).toThrow(new Error("Tag with the following ID does not exist: 20"))
    });
});

describe("addTag(), removeTag() and getTag()", () => {
    it("when a tag is added and removed againg, getTag should throw an error", () => {
        //setup
        let tag:Tag = new Tag();
        tag.id = 200;
        tag.name = "testName";

        //method to test
        mediaStation.addTag(tag.id, tag.name);
        mediaStation.removeTag(tag.id);

        //tests
        expect(() => mediaStation.getTag(200)).toThrow(new Error("Tag with the following ID does not exist: 200"))
    });
});