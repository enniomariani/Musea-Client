import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";
import {ContentManager} from "src/mcf/renderer/dataManagers/ContentManager";
import {MockMediaStation} from "__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {Content} from "src/mcf/renderer/dataStructure/Content";
import {MockFolder} from "__mocks__/mcf/renderer/dataStructure/MockFolder";

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

        //method to test
        content = contentManager.createContent(mockMediaStation, name,folderId);

        //tests
        expect(content.name).toEqual(name);
        expect(content.id).toEqual(uniqueID);
        expect(content.lightIntensity).toEqual(0);
        expect(content.folderId).toEqual(2);
    });

    it("should add the created content to the folder with the passed ID", ()=>{
        setup();

        //method to test
        content = contentManager.createContent(mockMediaStation, name,folderId);

        //tests
        expect(mockFolder.addContent).toHaveBeenCalledTimes(1);
        expect(mockFolder.addContent).toHaveBeenCalledWith(content);
    });

    it("should throw an error if the folder does not exist", ()=>{
        setup();

        //tests
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

        //method to test
        let answer = contentManager.getContent(mockMediaStation, contentID);

        //tests
        expect(answer).toEqual(content);
    });

    it("should return null if the content could not be found", ()=>{
        setup();

        //method to test
        let answer = contentManager.getContent(mockMediaStation, contentID + 1);

        //tests
        expect(answer).toEqual(null);
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
            if(id === contentID)
                return content;
            else
                return null;
        });
    }

    it("should change the name of the passed content to the passed new name", ()=>{
        setup();

        //method to test
        contentManager.changeName(mockMediaStation, contentID, newName);

        //tests
        expect(content.name).toEqual(newName);
    });

    it("should throw an error if the content could not be found", ()=>{
        setup();

        //tests
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
            if(id === contentID)
                return content;
            else
                return null;
        });
    }

    it("should remove the passed content from its actual folder", ()=>{
        setup();

        //method to test
        contentManager.changeFolder(mockMediaStation, contentID, newFolderId);

        //tests
        expect(mockOldFolder.removeContent).toHaveBeenCalledTimes(1);
        expect(mockOldFolder.removeContent).toHaveBeenCalledWith(contentID);
    });

    it("should add the passed content to its new folder", ()=>{
        setup();

        //method to test
        contentManager.changeFolder(mockMediaStation, contentID, newFolderId);

        //tests
        expect(mockNewFolder.addContent).toHaveBeenCalledTimes(1);
        expect(mockNewFolder.addContent).toHaveBeenCalledWith(content);
    });

    it("should set the folder-id of the content to the new folder", ()=>{
        setup();

        //method to test
        contentManager.changeFolder(mockMediaStation, contentID, newFolderId);

        //tests
        expect(content.folderId).toBe(newFolderId);
    });

    it("should throw an error if the content could not be found", ()=>{
        setup();

        //tests
        expect(()=> contentManager.changeFolder(mockMediaStation, contentID + 99, newFolderId)).toThrow(Error("Content with ID does not exist: " + (contentID + 99).toString()));
    });

    it("should throw an error if the new folder could not be found", ()=>{
        setup();

        //tests
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
            if(id === contentID)
                return content;
            else
                return null;
        });
    }

    it("should change the lightIntensity of the passed content to the passed new intensity", ()=>{
        setup();

        //method to test
        contentManager.changeLightIntensity(mockMediaStation, contentID, newIntensity);

        //tests
        expect(content.lightIntensity).toEqual(newIntensity);
    });

    it("should throw an error if the content could not be found", ()=>{
        setup();

        //tests
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
            if(id === folderId)
                return mockFolder;
            else
                return null;
        });
        mockFolder = new MockFolder(0);
        mockFolder.removeContent.mockImplementation((id) =>{
            return id === contentId;
        });
    }

    it("should remove the content from the folder it was attached to", ()=>{
        setup();

        mockMediaStation.getNextContentId.mockReturnValueOnce(contentId);

        //method to test
        contentManager.deleteContent(mockMediaStation, folderId, contentId);

        //tests
        expect(mockFolder.removeContent).toHaveBeenCalledTimes(1);
        expect(mockFolder.removeContent).toHaveBeenCalledWith(contentId);
    });

    it("should throw an error if the folder does not exist", ()=>{
        setup();

        //tests
        expect(()=> contentManager.deleteContent(mockMediaStation, folderId + 1, contentId)).toThrow(Error);
    });

    it("should throw an error if the contentid is not inside the passed folder", ()=>{
        setup();

        mockFolder.removeContent = jest.fn();
        mockFolder.removeContent.mockReturnValue(false)

        //tests
        expect(()=> contentManager.deleteContent(mockMediaStation, folderId, contentId)).toThrow(Error("Content with ID: " + contentId + " is not inside folder: "+ folderId));
    });
});