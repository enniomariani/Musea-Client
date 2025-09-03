import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {MockMediaStation} from "../../../__mocks__/mcf/renderer/dataStructure/MockMediaStation";
import {MockFolder} from "../../../__mocks__/mcf/renderer/dataStructure/MockFolder";
import {FolderManager} from "../../../../src/mcf/renderer/dataManagers/FolderManager";
import {Folder} from "../../../../src/mcf/renderer/dataStructure/Folder";

let folderManager:FolderManager;
let mockMediaStation:MockMediaStation;

beforeEach(() => {
    mockMediaStation = new MockMediaStation(0);
    folderManager = new FolderManager();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("createFolder() ", ()=>{
    let name:string = "folderName";
    let newFolder:Folder;
    let uniqueID:number = 10;
    let parentFolderId:number = 4;
    let mockFolder:MockFolder = new MockFolder(2);

    function setup():void{
        mockMediaStation.getNextFolderId.mockReturnValueOnce(uniqueID);
        mockMediaStation.rootFolder.findFolder = jest.fn();
        mockMediaStation.rootFolder.findFolder.mockImplementationOnce((id:number)=>{
            if(id === parentFolderId)
                return mockFolder;
            else
                return null;
        });
    }

    it("should create a new folder with a unique ID from the MediaStation ", ()=>{
        setup();

        mockMediaStation.getNextContentId.mockReturnValueOnce(uniqueID);

        //method to test
        newFolder = folderManager.createFolder(mockMediaStation, name,parentFolderId);

        //tests
        expect(newFolder.name).toEqual(name);
        expect(newFolder.id).toEqual(uniqueID);
        expect(newFolder.parentFolder).toEqual(mockFolder);
    });

    it("should add the created folder to the parent-folder with the passed ID", ()=>{
        setup();

        //method to test
        newFolder = folderManager.createFolder(mockMediaStation, name,parentFolderId);

        //tests
        expect(mockFolder.addSubFolder).toHaveBeenCalledTimes(1);
        expect(mockFolder.addSubFolder).toHaveBeenCalledWith(newFolder);
    });

    it("should throw an error if the parent-folder does not exist", ()=>{
        setup();

        //tests
        expect(()=> folderManager.createFolder(mockMediaStation, name,parentFolderId + 1)).toThrow(Error);
    });
});

describe("getFolder() ", ()=>{
    let folderID:number = 10;
    let folder:MockFolder = new MockFolder(folderID);

    function setup():void{
        mockMediaStation.rootFolder.findFolder.mockImplementationOnce((id:number)=>{
            if(id === folderID)
                return folder;
            else
                return null;
        });
    }

    it("should create return the folder if it exists", ()=>{
        setup();

        //method to test
        let answer = folderManager.getFolder(mockMediaStation, folderID);

        //tests
        expect(answer).toEqual(folder);
    });

    it("should return null if the folder could not be found", ()=>{
        setup();

        //method to test
        let answer = folderManager.getFolder(mockMediaStation, folderID + 1);

        //tests
        expect(answer).toEqual(null);
    });
});

describe("changeName() ", ()=>{
    let folderID:number = 10;
    let folder:MockFolder = new MockFolder(folderID);
    let newName:string = "newname";
    folder.name = "initialName";

    function setup():void{
        mockMediaStation.rootFolder.findFolder.mockImplementationOnce((id:number)=>{
            if(id === folderID)
                return folder;
            else
                return null;
        });
    }

    it("should change the name of the passed folder to the passed new name", ()=>{
        setup();

        //method to test
        folderManager.changeName(mockMediaStation, folderID, newName);

        //tests
        expect(folder.name).toEqual(newName);
    });

    it("should throw an error if the folder could not be found", ()=>{
        setup();

        //tests
        expect(()=> folderManager.changeName(mockMediaStation, folderID + 1, newName)).toThrow(Error("Folder with ID does not exist: " + (folderID + 1).toString()));
    });
});

describe("changeParentFolder() ", ()=>{
    let folderID:number = 10;
    let olderParentFolderId:number = 11;
    let newParentFolderId:number = 12;

    let mockOldParentFolder:MockFolder = new MockFolder(olderParentFolderId);
    let mockNewParentFolder:MockFolder = new MockFolder(newParentFolderId);
    let folder:MockFolder = new MockFolder(folderID);
    folder.parentFolder = mockOldParentFolder;

    function setup():void{
        mockMediaStation.rootFolder.findFolder.mockImplementation((id:number)=>{
            if(id === folderID)
                return folder;
            else if(id === olderParentFolderId)
                return mockOldParentFolder;
            else if(id === newParentFolderId)
                return mockNewParentFolder;
            else
                return null;
        });
    }

    it("should remove the passed folder from its actual parent", ()=>{
        setup();

        //method to test
        folderManager.changeParentFolder(mockMediaStation, folderID, newParentFolderId);

        //tests
        expect(mockOldParentFolder.removeSubFolder).toHaveBeenCalledTimes(1);
        expect(mockOldParentFolder.removeSubFolder).toHaveBeenCalledWith(folderID);
    });

    it("should add the passed folder to its new parent", ()=>{
        setup();

        //method to test
        folderManager.changeParentFolder(mockMediaStation, folderID, newParentFolderId);

        //tests
        expect(mockNewParentFolder.addSubFolder).toHaveBeenCalledTimes(1);
        expect(mockNewParentFolder.addSubFolder).toHaveBeenCalledWith(folder);
    });

    it("should set the new parentFolder in the changed folder", ()=>{
        setup();

        //method to test
        folderManager.changeParentFolder(mockMediaStation, folderID, newParentFolderId);

        //tests
        expect(folder.parentFolder).toEqual(mockNewParentFolder);
    });

    it("should throw an error if the folder could not be found", ()=>{
        setup();

        //tests
        expect(()=> folderManager.changeParentFolder(mockMediaStation, folderID + 99, newParentFolderId)).toThrow(Error("Folder with ID does not exist: " + (folderID + 99).toString()));
    });

    it("should throw an error if the new parent-folder could not be found", ()=>{
        setup();

        //tests
        expect(()=> folderManager.changeParentFolder(mockMediaStation, folderID, newParentFolderId +99)).toThrow(Error("Parent-Folder with ID does not exist: " + (newParentFolderId +99).toString()));
    });
});

describe("deleteFolder() ", ()=>{
    let folderId:number = 10;
    let parentFodlerId:number = 5;
    let mockFolder:MockFolder;

    function setup():void{
        mockMediaStation.rootFolder.findFolder = jest.fn();
        mockMediaStation.rootFolder.findFolder.mockImplementationOnce((id:number)=>{
            if(id === parentFodlerId)
                return mockFolder;
            else
                return null;
        });
        mockFolder = new MockFolder(0);
        mockFolder.removeSubFolder.mockImplementation((id) =>{
            return id === folderId;
        });
    }

    it("should remove the folder from the parent-folder it was attached to", ()=>{
        setup();

        //method to test
        folderManager.deleteFolder(mockMediaStation, folderId, parentFodlerId);

        //tests
        expect(mockFolder.removeSubFolder).toHaveBeenCalledTimes(1);
        expect(mockFolder.removeSubFolder).toHaveBeenCalledWith(folderId);
    });

    it("should throw an error if the parent-folder does not exist", ()=>{
        setup();

        //tests
        expect(()=> folderManager.deleteFolder(mockMediaStation, parentFodlerId + 1, folderId)).toThrow(Error);
    });

    it("should throw an error if the folder is not inside the passed parent-folder", ()=>{
        setup();

        mockFolder.removeSubFolder = jest.fn();
        mockFolder.removeSubFolder.mockReturnValue(false)

        //tests
        expect(()=> folderManager.deleteFolder(mockMediaStation, folderId, parentFodlerId)).toThrow(Error("Folder with ID: " + folderId + " is not inside folder: "+ parentFodlerId));
    });
});