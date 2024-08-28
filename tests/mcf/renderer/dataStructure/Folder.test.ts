import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {Folder} from "../../../../src/js/mcf/renderer/dataStructure/Folder";
import {MockContent} from "../../../__mocks__/mcf/renderer/dataStructure/MockContent";
import {MockFolder} from "../../../__mocks__/mcf/renderer/dataStructure/MockFolder";
import {Content} from "../../../../src/js/mcf/renderer/dataStructure/Content";

let folder:Folder;
let subFolder1:Folder = new Folder(1);
subFolder1.name = "subF1";
let subFolder2:Folder = new Folder(2);
subFolder2.name = "subF2";
let subFolder3:Folder = new Folder(3);
subFolder3.name = "subF2";
let content1:MockContent = new MockContent(0);
let content2:MockContent = new MockContent(1);
let content3:MockContent = new MockContent(2);
let content4:MockContent = new MockContent(3);
content4.name = "mockContent4";

subFolder2.addSubFolder(subFolder3);
subFolder1.addContent(content1);
subFolder1.addContent(content2);
subFolder3.addContent(content3);

const expectedJSON:any = {
    id: 3,
    name: "myName",
    contents: [{id:content4.id, name: content4.name}],
    subFolders: [{id:1, name: subFolder1.name, subFolders: [], contents:[]}, {id:2, name: subFolder2.name, subFolders: [{id:3, name: subFolder3.name, subFolders:[], contents: []}], contents:[]}]
};

let id;
let createContentMock = jest.fn(id).mockReturnValue(content4);

beforeEach(() => {
    folder = new Folder(0, createContentMock);
    folder.addContent(content4);
    folder.addSubFolder(subFolder1);
    folder.addSubFolder(subFolder2);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("exportToJSON() ", ()=>{
    it("should receive a valid JSON that contains all set properties of the folder", ()=>{
        //setup
        let receivedJSON:any;
        folder = new Folder(3, createContentMock);
        folder.addContent(content4);
        folder.addSubFolder(subFolder1);
        folder.addSubFolder(subFolder2);

        content4.exportToJSON.mockReturnValueOnce({id:content4.id, name: content4.name});

        folder.name = "myName";
        folder.parentFolder = new MockFolder(10);

        //method to test
        receivedJSON = folder.exportToJSON();

        //tests
        expect(JSON.stringify(receivedJSON)).not.toBe(undefined);
        expect(receivedJSON).toMatchObject(expectedJSON);
    });
});

describe("importFromJSON() ", () => {
    it("should set all properties for itself and the subfolders according to the passed json", () => {
        //setup
        folder = new Folder(0, createContentMock);

        //method to test
        folder.importFromJSON(expectedJSON);

        //tests
        expect(folder.id).toBe(expectedJSON.id);
        expect(folder.name).toBe(expectedJSON.name);

        expect(folder.subFolders.length).toBe(2);
        expect(folder.subFolders[0].id).toBe(1);
        expect(folder.subFolders[0].name).toBe("subF1");
        expect(folder.subFolders[1].id).toBe(2);
        expect(folder.subFolders[1].name).toBe("subF2");

        expect(folder.contents.length).toBe(1);
        expect(folder.contents[0].id).toBe(content4.id);
    });

    it("should pass all properties it got for its content to content.importFromJSON", () => {
        //setup
        let createContentMock = jest.fn(id).mockReturnValue(content4);
        folder = new Folder(0, createContentMock);

        //method to test
        folder.importFromJSON(expectedJSON);

        //tests
        expect(content4.importFromJSON).toHaveBeenCalledTimes(1);
        expect(content4.importFromJSON).toHaveBeenCalledWith(expectedJSON.contents[0]);
    });

    it("should set the passed parent-Folder", () => {
        //setup
        let parentFolder:MockFolder = new MockFolder(30);

        //method to test
        folder.importFromJSON(expectedJSON, parentFolder);

        //tests
        expect(folder.parentFolder).toEqual(parentFolder);
    });
});

describe("addContent() and containsContent() ", ()=>{
    it("should add the content and return it again", ()=>{
        //setup
        let content:MockContent = new MockContent(0);

        //method to test
        folder.addContent(content);

        //tests
        expect(folder.containsContent(content)).toBe(true);
    });
});

describe("addContent(), removeContent() and containsContent() ", ()=>{
    it("removing a content which was added before should return true and containsContent() return false", ()=>{
        //setup
        let content:MockContent = new MockContent(0);
        let answer:boolean;

        //method to test
        folder.addContent(content);
        answer = folder.removeContent(0);

        //tests
        expect(folder.containsContent(content)).toBe(false);
        expect(answer).toBe(true);
    });

    it("removing a content which was NOT added before should return false", ()=>{
        //setup
        let answer:boolean;

        //method to test
        answer = folder.removeContent(0);

        //tests
        expect(answer).toBe(false);
    });
});

describe("addContent(), getAllContents()", ()=>{
    it("adding two contents should give 2 contents back", ()=>{
        //setup
        let content1:MockContent = new MockContent(0);
        let content2:MockContent = new MockContent(1);
        let allContents:Map<number, Content>;

        //method to test
        folder.addContent(content1);
        folder.addContent(content2);
        allContents = folder.getAllContents();

        //tests
        expect(allContents.get(0)).toBe(content1);
        expect(allContents.get(1)).toBe(content2);
    });

    it("adding no contents should give an empty Map back", ()=>{
        //setup
        folder = new Folder(0);
        let allContents:Map<number, Content>;

        //method to test
        allContents = folder.getAllContents();

        //tests
        expect(allContents.size).toBe(0);
    });
});

describe("addSubFolder() and containsSubFolder() ", ()=>{
    it("should add the content and return it again", ()=>{
        //setup
        let subFolder:MockFolder = new MockFolder(0);

        //method to test
        folder.addSubFolder(subFolder);

        //tests
        expect(folder.containsSubFolder(subFolder)).toBe(true);
    });
});

describe("addSubFolder(), removeSubFolder() and containsSubFolder() ", ()=>{
    it("removing a subfolder which was added before should return true and containsSubFolder() return false", ()=>{
        //setup
        let subFolder:MockFolder = new MockFolder(0);
        let answer:boolean;

        //method to test
        folder.addSubFolder(subFolder);
        answer = folder.removeSubFolder(0);

        //tests
        expect(folder.containsSubFolder(subFolder)).toBe(false);
        expect(answer).toBe(true);
    });

    it("removing a subfolder which was NOT added before should return false", ()=>{
        //setup
        let answer:boolean;

        //method to test
        answer = folder.removeSubFolder(0);

        //tests
        expect(answer).toBe(false);
    });
});

describe("addSubFolder(), getAllSubFolders()", ()=>{
    it("adding two subFolders should give 2 subFolders back", ()=>{
        //setup
        let subFolder1:MockFolder = new MockFolder(0);
        let subFolder2:MockFolder = new MockFolder(1);
        let allSubFolders:Map<number, Folder>;

        //method to test
        folder.addSubFolder(subFolder1);
        folder.addSubFolder(subFolder2);
        allSubFolders = folder.getAllSubFolders();

        //tests
        expect(allSubFolders.get(0)).toBe(subFolder1);
        expect(allSubFolders.get(1)).toBe(subFolder2);
    });

    it("adding no subfolders should give an empty Map back", ()=>{
        //setup
        folder = new Folder(0);
        let allSubFolders:Map<number, Folder>;

        //method to test
        allSubFolders = folder.getAllSubFolders();

        //tests
        expect(allSubFolders.size).toBe(0);
    });
});


describe("findFolder() ", ()=>{
    it("should find the folder if it is in one of the subfolders of the folder", ()=>{
        //method to test
        let result = folder.findFolder(subFolder3.id);

        //tests
        expect(result).toBe(subFolder3);
    });

    it("should return null if the folder is not actual a subfolder of this one", ()=>{
        //method to test
        let result = folder.findFolder(100);

        //tests
        expect(result).toBe(null);
    });
});

describe("findContent() ", ()=>{
    it("should find the content if it is in the folder itself", ()=>{
        //method to test
        let result = folder.findContent(content4.id);

        //tests
        expect(result).toBe(content4);
    });

    it("should find the content if it is in one of the subfolders of the folder", ()=>{
        //method to test
        let result = folder.findContent(content3.id);

        //tests
        expect(result).toBe(content3);
    });

    it("should return null if the content is not actual a subfolder of this one", ()=>{
        //method to test
        let result = folder.findContent(100);

        //tests
        expect(result).toBe(null);
    });
});