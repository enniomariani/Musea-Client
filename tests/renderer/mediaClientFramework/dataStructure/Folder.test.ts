import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {Folder} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/Folder";
import {MockContent} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockContent";
import {MockFolder} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockFolder";

let folder:Folder;
let subFolder1:Folder = new Folder(1);
let subFolder2:Folder = new Folder(2);
let subFolder3:Folder = new Folder(3);
let content1:MockContent = new MockContent(0);
let content2:MockContent = new MockContent(1);
let content3:MockContent = new MockContent(2);
let content4:MockContent = new MockContent(3);

subFolder2.addSubFolder(subFolder3);
subFolder1.addContent(content1);
subFolder1.addContent(content2);
subFolder3.addContent(content3);

beforeEach(() => {
    folder = new Folder(0);
    folder.addContent(content4);
    folder.addSubFolder(subFolder1);
    folder.addSubFolder(subFolder2);
});

afterEach(() => {
    jest.clearAllMocks();
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