import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {ContentManager} from "src/mcf/renderer/dataManagers/ContentManager";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {Content} from "src/mcf/renderer/dataStructure/Content";
import {MockFolder} from "__mocks__/mcf/renderer/dataStructure/MockFolder";
import {Folder} from "src/mcf/renderer/dataStructure/Folder";
import {MockContent} from "__mocks__/mcf/renderer/dataStructure/MockContent";

let contentManager:ContentManager;
let mockMediaStation:MockMediaStation;

beforeEach(() => {
    mockMediaStation = new MockMediaStation(0);
    contentManager = new ContentManager();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createContent() ", ()=>{
    let name:string = "contentName";
    let content:Content;
    let uniqueID:number = 10;
    let folderId:number = 2;
    let mockFolder:MockFolder = new MockFolder(2);

    function setup():void{
        mockMediaStation.getNextContentId.mockReturnValueOnce(uniqueID);
        mockMediaStation.rootFolder.findFolder = jest.fn();
        mockMediaStation.rootFolder.findFolder.mockImplementationOnce((id:number)=>{
            if(id === folderId)
                return mockFolder;
            else
                return null;
        });
    }

    it("should create a new content with a unique ID from the MediaStation ", ()=>{
        setup();

        mockMediaStation.getNextContentId.mockReturnValueOnce(uniqueID);

        content = contentManager.createContent(mockMediaStation, name,folderId);

        expect(content.name).toEqual(name);
        expect(content.id).toEqual(uniqueID);
        expect(content.lightIntensity).toEqual(0);
        expect(content.folderId).toEqual(2);
    });

    it("should add the created content to the folder with the passed ID", ()=>{
        setup();

        content = contentManager.createContent(mockMediaStation, name,folderId);

        expect(mockFolder.addContent).toHaveBeenCalledTimes(1);
        expect(mockFolder.addContent).toHaveBeenCalledWith(content);
    });

    it("should throw an error if the folder does not exist", ()=>{
        setup();

        expect(()=> contentManager.createContent(mockMediaStation, name,folderId + 1)).toThrow(Error);
    });
});

describe("getContent() ", ()=>{
    let contentID:number = 10;
    let content:Content = new Content(contentID, 2);

    function setup():void{
        mockMediaStation.rootFolder.findContent = jest.fn();
        mockMediaStation.rootFolder.findContent.mockImplementationOnce((id:number)=>{
            if(id === contentID)
                return content;
            else
                return null;
        });
    }

    it("should create return the content if it exists", ()=>{
        setup();
        let answer = contentManager.getContent(mockMediaStation, contentID);
        expect(answer).toEqual(content);
    });

    it("should return null if the content could not be found", ()=>{
        setup();
        let answer = contentManager.getContent(mockMediaStation, contentID + 1);
        expect(answer).toEqual(null);
    });
});

describe("requireContent() ", () => {
    const contentId:number = 10;
    const content:MockContent = new MockContent(contentId, 10);

    it("should return the content object with the passed ID", async () => {
        let answer: Content;

        mockMediaStation.rootFolder.findContent.mockImplementationOnce((id:number)=>{
            return id === contentId? content:null;
        });

        answer = contentManager.requireContent(mockMediaStation, contentId);
        expect(answer).toEqual(content);
    });

    it("should throw if the mediastation can not be found", async () => {
        expect(() => contentManager.requireContent(mockMediaStation, 0)).toThrow(new Error("Content with this ID does not exist: 0"));
    });
});

describe("changeName() ", ()=>{
    let contentID:number = 10;
    let content:Content = new Content(contentID, 3);
    let newName:string = "newname";
    content.name = "initialName";

    function setup():void{
        mockMediaStation.rootFolder.findContent = jest.fn();
        mockMediaStation.rootFolder.findContent.mockImplementationOnce((id:number)=>{
            return id === contentID? content:null;
        });
    }

    it("should change the name of the passed content to the passed new name", ()=>{
        setup();
        contentManager.changeName(mockMediaStation, contentID, newName);
        expect(content.name).toEqual(newName);
    });

    it("should throw an error if the content could not be found", ()=>{
        setup();
        expect(()=> contentManager.changeName(mockMediaStation, contentID + 1, newName)).toThrow(Error);
    });
});

describe("changeFolder() ", ()=>{
    let contentID:number = 10;
    let oldFolderId:number = 3;
    let newFolderId:number = 18;
    let content:Content = new Content(contentID, oldFolderId);

    let mockOldFolder:MockFolder = new MockFolder(oldFolderId);
    let mockNewFolder:MockFolder = new MockFolder(newFolderId);

    function setup():void{
        mockMediaStation.rootFolder.findFolder.mockImplementation((id:number)=>{
            if(id === oldFolderId)
                return mockOldFolder;
            else if(id === newFolderId)
                return mockNewFolder;
            else
                return null;
        });

        mockMediaStation.rootFolder.findContent.mockImplementation((id:number)=>{
            return id === contentID? content:null;
        });
    }

    it("should remove the passed content from its actual folder", ()=>{
        setup();

        contentManager.changeFolder(mockMediaStation, contentID, newFolderId);

        expect(mockOldFolder.removeContent).toHaveBeenCalledTimes(1);
        expect(mockOldFolder.removeContent).toHaveBeenCalledWith(contentID);
    });

    it("should add the passed content to its new folder", ()=>{
        setup();

        contentManager.changeFolder(mockMediaStation, contentID, newFolderId);

        expect(mockNewFolder.addContent).toHaveBeenCalledTimes(1);
        expect(mockNewFolder.addContent).toHaveBeenCalledWith(content);
    });

    it("should set the folder-id of the content to the new folder", ()=>{
        setup();
        contentManager.changeFolder(mockMediaStation, contentID, newFolderId);
        expect(content.folderId).toBe(newFolderId);
    });

    it("should throw an error if the content could not be found", ()=>{
        setup();
        expect(()=> contentManager.changeFolder(mockMediaStation, contentID + 99, newFolderId)).toThrow(Error("Content with ID does not exist: " + (contentID + 99).toString()));
    });

    it("should throw an error if the new folder could not be found", ()=>{
        setup();
        expect(()=> contentManager.changeFolder(mockMediaStation, contentID, newFolderId + 99)).toThrow(Error("Folder with ID does not exist: " + (newFolderId +99).toString()));
    });
});

describe("changeLightIntensity() ", ()=>{
    let contentID:number = 10;
    let content:Content = new Content(contentID, 2);
    let newIntensity:number = 12;
    content.lightIntensity = 0;

    function setup():void{
        mockMediaStation.rootFolder.findContent = jest.fn();
        mockMediaStation.rootFolder.findContent.mockImplementationOnce((id:number)=>{
            return id === contentID? content:null;
        });
    }

    it("should change the lightIntensity of the passed content to the passed new intensity", ()=>{
        setup();
        contentManager.changeLightIntensity(mockMediaStation, contentID, newIntensity);
        expect(content.lightIntensity).toEqual(newIntensity);
    });

    it("should throw an error if the content could not be found", ()=>{
        setup();
        expect(()=> contentManager.changeLightIntensity(mockMediaStation, contentID + 1, newIntensity)).toThrow(Error);
    });
});

describe("deleteContent() ", ()=>{
    let contentId:number = 10;
    let folderId:number = 5;
    let mockFolder:MockFolder;

    function setup():void{
        mockMediaStation.rootFolder.findFolder = jest.fn();
        mockMediaStation.rootFolder.findFolder.mockImplementationOnce((id:number)=>{
            return id === folderId ? mockFolder: null;
        });
        mockFolder = new MockFolder(0);
        mockFolder.removeContent.mockImplementation((id) =>{
            return id === contentId;
        });
    }

    it("should remove the content from the folder it was attached to", ()=>{
        setup();

        mockMediaStation.getNextContentId.mockReturnValueOnce(contentId);

        contentManager.deleteContent(mockMediaStation, folderId, contentId);

        expect(mockFolder.removeContent).toHaveBeenCalledTimes(1);
        expect(mockFolder.removeContent).toHaveBeenCalledWith(contentId);
    });

    it("should throw an error if the folder does not exist", ()=>{
        setup();
        expect(()=> contentManager.deleteContent(mockMediaStation, folderId + 1, contentId)).toThrow(Error);
    });

    it("should throw an error if the contentid is not inside the passed folder", ()=>{
        setup();

        mockFolder.removeContent = jest.fn();
        mockFolder.removeContent.mockReturnValue(false)

        expect(()=> contentManager.deleteContent(mockMediaStation, folderId, contentId)).toThrow(Error("Content with ID: " + contentId + " is not inside folder: "+ folderId));
    });
});