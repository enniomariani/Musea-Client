import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {Folder} from "renderer/dataStructure/Folder.js";
import {MockContent} from "mocks/renderer/dataStructure/MockContent.js";
import {MockFolder} from "mocks/renderer/dataStructure/MockFolder.js";
import {Content} from "renderer/dataStructure/Content.js";

let folder:Folder;
let subFolder1:Folder = new Folder(1);
subFolder1.name = "subF1";
let subFolder2:Folder = new Folder(2);
subFolder2.name = "subF2";
let subFolder3:Folder = new Folder(3);
subFolder3.name = "subF2";
let content1:MockContent = new MockContent(0, 1);
let content2:MockContent = new MockContent(1, 1);
let content3:MockContent = new MockContent(2, 3);
let content4:MockContent = new MockContent(3, 0);
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

let id:number;
let createContentMock = jest.fn(()=> content4);

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
        let receivedJSON:any;
        folder = new Folder(3, createContentMock);
        folder.addContent(content4);
        folder.addSubFolder(subFolder1);
        folder.addSubFolder(subFolder2);

        content4.exportToJSON.mockReturnValueOnce({id:content4.id, name: content4.name});

        folder.name = "myName";
        folder.parentFolder = new MockFolder(10);

        receivedJSON = folder.exportToJSON();

        expect(JSON.stringify(receivedJSON)).not.toBe(undefined);
        expect(receivedJSON).toMatchObject(expectedJSON);
    });
});

describe("importFromJSON() ", () => {
    it("should set all properties for itself and the subfolders according to the passed json", () => {
        folder = new Folder(0, createContentMock);

        folder.importFromJSON(expectedJSON);

        expect(folder.id).toBe(expectedJSON.id);
        expect(folder.name).toBe(expectedJSON.name);

        expect(folder.subFolders.length).toBe(2);
        expect(folder.subFolders[0].id).toBe(1);
        expect(folder.subFolders[0].name).toBe("subF1");
        expect(folder.subFolders[0].parentFolder).toBe(folder);
        expect(folder.subFolders[1].id).toBe(2);
        expect(folder.subFolders[1].name).toBe("subF2");
        expect(folder.subFolders[1].parentFolder).toBe(folder);

        expect(folder.contents.length).toBe(1);
        expect(folder.contents[0].id).toBe(content4.id);
    });

    it("should pass all properties it got for its content to content.importFromJSON", () => {
        let createContentMock = jest.fn(() => content4);
        folder = new Folder(0, createContentMock);

        folder.importFromJSON(expectedJSON);

        expect(content4.importFromJSON).toHaveBeenCalledTimes(1);
        expect(content4.importFromJSON).toHaveBeenCalledWith(expectedJSON.contents[0]);
    });

    it("should set the passed parent-Folder", () => {
        let parentFolder:MockFolder = new MockFolder(30);
        folder.importFromJSON(expectedJSON, parentFolder);
        expect(folder.parentFolder).toEqual(parentFolder);
    });
});

describe("addContent() and containsContent() ", ()=>{
    it("should add the content and return it again", ()=>{
        let content:MockContent = new MockContent(0, 0);
        folder.addContent(content);
        expect(folder.containsContent(content)).toBe(true);
    });
});

describe("addContent(), removeContent() and containsContent() ", ()=>{
    it("removing a content which was added before should return true and containsContent() return false", ()=>{
        let content:MockContent = new MockContent(0, 0);
        let answer:boolean;

        folder.addContent(content);
        answer = folder.removeContent(0);

        expect(folder.containsContent(content)).toBe(false);
        expect(answer).toBe(true);
    });

    it("removing a content which was NOT added before should return false", ()=>{
        let answer:boolean;
        answer = folder.removeContent(0);
        expect(answer).toBe(false);
    });
});

describe("addContent(), getAllContents()", ()=>{
    it("adding two contents should give 2 contents back", ()=>{
        let content1:MockContent = new MockContent(0, 0);
        let content2:MockContent = new MockContent(1, 0);
        let allContents:Map<number, Content>;

        folder.addContent(content1);
        folder.addContent(content2);
        allContents = folder.getAllContents();

        expect(allContents.get(0)).toBe(content1);
        expect(allContents.get(1)).toBe(content2);
    });

    it("adding no contents should give an empty Map back", ()=>{
        folder = new Folder(0);
        let allContents:Map<number, Content>;
        allContents = folder.getAllContents();
        expect(allContents.size).toBe(0);
    });
});

describe("addSubFolder() and containsSubFolder() ", ()=>{
    it("should add the content and return it again", ()=>{
        let subFolder:MockFolder = new MockFolder(0);

        folder.addSubFolder(subFolder);

        expect(folder.containsSubFolder(subFolder)).toBe(true);
    });
});

describe("addSubFolder(), removeSubFolder() and containsSubFolder() ", ()=>{
    it("removing a subfolder which was added before should return true and containsSubFolder() return false", ()=>{
        let subFolder:MockFolder = new MockFolder(0);
        let answer:boolean;

        folder.addSubFolder(subFolder);
        answer = folder.removeSubFolder(0);

        expect(folder.containsSubFolder(subFolder)).toBe(false);
        expect(answer).toBe(true);
    });

    it("removing a subfolder which was NOT added before should return false", ()=>{
        let answer:boolean = folder.removeSubFolder(0);
        expect(answer).toBe(false);
    });
});

describe("addSubFolder(), getAllSubFolders()", ()=>{
    it("adding two subFolders should give 2 subFolders back", ()=>{
        let subFolder1:MockFolder = new MockFolder(0);
        let subFolder2:MockFolder = new MockFolder(1);
        let allSubFolders:Map<number, Folder>;

        folder.addSubFolder(subFolder1);
        folder.addSubFolder(subFolder2);
        allSubFolders = folder.getAllSubFolders();

        expect(allSubFolders.get(0)).toBe(subFolder1);
        expect(allSubFolders.get(1)).toBe(subFolder2);
    });

    it("adding no subfolders should give an empty Map back", ()=>{
        folder = new Folder(0);
        let allSubFolders:Map<number, Folder>;
        allSubFolders = folder.getAllSubFolders();
        expect(allSubFolders.size).toBe(0);
    });
});

describe("getAllContentIDsInFolderAndSubFolders() ", ()=>{
    it("should return all content-IDs the folder holds itself", ()=>{
        let content1:Content = new Content(0, 0);
        let content2:Content = new Content(1, 0);
        let content3:Content = new Content(2, 0);

        folder = new Folder(1);
        folder.contents.push(content1, content2, content3);

        let result:Map<number, number[]> = folder.getAllContentIDsInFolderAndSubFolders();

        expect(result.get(folder.id)).toEqual([0,1,2]);
    });

    it("should return all content-IDs the folder holds itself AND the contents of all subfolders (see top of this test-file for setup of contents)", ()=>{
        let result:Map<number, number[]> = folder.getAllContentIDsInFolderAndSubFolders();

        expect(result.get(0)).toEqual([3]);
        expect(result.get(1)).toEqual([0,1]);
        expect(result.get(3)).toEqual([2]);
    });
});


describe("findFolder() ", ()=>{
    it("should find the folder if it is in one of the subfolders of the folder", ()=>{
        let result = folder.findFolder(subFolder3.id);
        expect(result).toBe(subFolder3);
    });

    it("should return null if the folder is not actual a subfolder of this one", ()=>{
        let result = folder.findFolder(100);
        expect(result).toBe(null);
    });
});

describe("requireFolder() ", ()=>{
    it("should find the folder if it is in one of the subfolders of the folder", ()=>{
        const result:Folder = folder.requireFolder(subFolder3.id);
        expect(result).toBe(subFolder3);
    });

    it("should throw an error if folder-id is not one of the sub-folders", ()=>{
        expect(()=>folder.requireFolder(100)).toThrow(new Error("Folder with ID 100 could not be found as sub-Folder of folder: 0"));
    });
});

describe("findContent() ", ()=>{
    it("should find the content if it is in the folder itself", ()=>{
        let result = folder.findContent(content4.id);
        expect(result).toBe(content4);
    });

    it("should find the content if it is in one of the subfolders of the folder", ()=>{
        let result = folder.findContent(content3.id);
        expect(result).toBe(content3);
    });

    it("should return null if the content is not actual a subfolder of this one", ()=>{
        let result = folder.findContent(100);
        expect(result).toBe(null);
    });
});

describe("requireContent() ", ()=>{
    it("should find the content if it is in one of the subfolders of the folder", ()=>{
        const result:Content = folder.requireContent(content4.id);
        expect(result).toBe(content4);
    });

    it("should throw an error if content-id is not one of the sub-folders", ()=>{
        expect(()=>folder.requireContent(100)).toThrow("Content with ID 100 could not be found as sub-Folder of folder: 0")
    });
});

describe("findContentsByNamePart() ", ()=>{
    it("should return the correct array of contents that match the namePart (not case-sensitive)", ()=>{
        const allContentIds:Map<number, number[]> = new Map();

        allContentIds.set(0, [0,1,2]);
        allContentIds.set(1, [3,4]);
        allContentIds.set(2, [5]);

        let content1:MockContent = new MockContent(0, 0);
        content1.name = "TEST";
        let content2:MockContent = new MockContent(1, 0);
        content2.name = "tes";
        let content3:MockContent = new MockContent(2, 0);
        content3.name = "TEst3";
        let content4:MockContent = new MockContent(3, 0);
        content4.name = "teest";
        let content5:MockContent = new MockContent(4, 0);
        content5.name = " test5xxy";
        let content6:MockContent = new MockContent(5, 0);
        content6.name = "Xtest ";

        const allContents:Content[] = [content1, content2, content3, content4, content5, content6]

        jest.spyOn(folder, 'requireContent').mockImplementation((id:number) => {return allContents[id]});
        jest.spyOn(folder, 'getAllContentIDsInFolderAndSubFolders').mockReturnValue(allContentIds);

        let result:Content[] = folder.findContentsByNamePart("teST");

        expect(result.length).toEqual(4);
        expect(result[0].name).toEqual(content1.name);
        expect(result[1].name).toEqual(content3.name);
        expect(result[2].name).toEqual(content5.name);
        expect(result[3].name).toEqual(content6.name);
    });

    it("should return an empty array if the part could not be found", ()=>{
        const allContentIds:Map<number, number[]> = new Map();

        allContentIds.set(0, [0,1,2]);
        allContentIds.set(1, [3,4]);
        allContentIds.set(2, [5]);

        let content1:MockContent = new MockContent(0, 0);
        content1.name = "test";
        let content2:MockContent = new MockContent(1, 0);
        content2.name = "tes";
        let content3:MockContent = new MockContent(2, 0);
        content3.name = "test3";
        let content4:MockContent = new MockContent(3, 0);
        content4.name = "teest";
        let content5:MockContent = new MockContent(4, 0);
        content5.name = " test5xxy";
        let content6:MockContent = new MockContent(5, 0);
        content6.name = "Xtest ";

        const allContents:Content[] = [content1, content2, content3, content4, content5, content6]

        jest.spyOn(folder, 'requireContent').mockImplementation((id:number) => {return allContents[id]});
        jest.spyOn(folder, 'getAllContentIDsInFolderAndSubFolders').mockReturnValue(allContentIds);

        let result:Content[] = folder.findContentsByNamePart("tessst");

        expect(result.length).toEqual(0);
    });
});