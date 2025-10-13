import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {MockMediaStation} from "src/mcf/mocks/renderer/dataStructure/MockMediaStation";
import {MockFolder} from "src/mcf/mocks/renderer/dataStructure/MockFolder";
import {FolderManager} from "../../../../renderer/dataManagers/FolderManager";
import {Folder} from "../../../../renderer/dataStructure/Folder";

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
        mockMediaStation.rootFolder.requireFolder = jest.fn();
        mockMediaStation.rootFolder.requireFolder.mockImplementationOnce((id:number)=>{
            if(id === parentFolderId)
                return mockFolder;
            else
                return null;
        });
    }

    it("should create a new folder with a unique ID from the MediaStation ", ()=>{
        setup();

        mockMediaStation.getNextContentId.mockReturnValueOnce(uniqueID);

        newFolder = folderManager.createFolder(mockMediaStation, name,parentFolderId);

        expect(newFolder.name).toEqual(name);
        expect(newFolder.id).toEqual(uniqueID);
        expect(newFolder.parentFolder).toEqual(mockFolder);
    });

    it("should add the created folder to the parent-folder with the passed ID", ()=>{
        setup();

        newFolder = folderManager.createFolder(mockMediaStation, name,parentFolderId);

        expect(mockFolder.addSubFolder).toHaveBeenCalledTimes(1);
        expect(mockFolder.addSubFolder).toHaveBeenCalledWith(newFolder);
    });

    it("should throw an error if the parent-folder does not exist", ()=>{
        setup();

        expect(()=> folderManager.createFolder(mockMediaStation, name,parentFolderId + 1)).toThrow(Error);
    });
});

describe("getFolder() ", ()=>{
    let folderID:number = 10;
    let folder:MockFolder = new MockFolder(folderID);

    function setup():void{
        mockMediaStation.rootFolder.findFolder.mockImplementationOnce((id:number)=>{
            return id === folderID ? folder:null;
        });
    }

    it("should create return the folder if it exists", ()=>{
        setup();
        const answer = folderManager.getFolder(mockMediaStation, folderID);
        expect(answer).toEqual(folder);
    });

    it("should return null if the folder could not be found", ()=>{
        setup();
        const answer = folderManager.getFolder(mockMediaStation, folderID + 1);
        expect(answer).toEqual(null);
    });
});


describe("requireFolder() ", () => {
    const folderID:number = 10;
    const folder:MockFolder = new MockFolder(folderID);

    it("should return the folder object with the passed ID", async () => {
        mockMediaStation.rootFolder.requireFolder.mockImplementationOnce((id:number)=>{
            return id === folderID ? folder:null;
        });

        const answer:Folder = folderManager.requireFolder(mockMediaStation, folderID);
        expect(answer).toEqual(folder);
    });
});

describe("changeName() ", ()=>{
    let folderID:number = 10;
    let folder:MockFolder = new MockFolder(folderID);
    let newName:string = "newname";
    folder.name = "initialName";

    function setup():void{
        mockMediaStation.rootFolder.requireFolder.mockImplementationOnce((id:number)=>{
            return id === folderID ? folder:null;
        });
    }

    it("should change the name of the passed folder to the passed new name", ()=>{
        setup();
        folderManager.changeName(mockMediaStation, folderID, newName);
        expect(folder.name).toEqual(newName);
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
        mockMediaStation.rootFolder.requireFolder.mockImplementation((id:number)=>{
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

        folderManager.changeParentFolder(mockMediaStation, folderID, newParentFolderId);

        expect(mockOldParentFolder.removeSubFolder).toHaveBeenCalledTimes(1);
        expect(mockOldParentFolder.removeSubFolder).toHaveBeenCalledWith(folderID);
    });

    it("should add the passed folder to its new parent", ()=>{
        setup();

        folderManager.changeParentFolder(mockMediaStation, folderID, newParentFolderId);

        expect(mockNewParentFolder.addSubFolder).toHaveBeenCalledTimes(1);
        expect(mockNewParentFolder.addSubFolder).toHaveBeenCalledWith(folder);
    });

    it("should set the new parentFolder in the changed folder", ()=>{
        setup();
        folderManager.changeParentFolder(mockMediaStation, folderID, newParentFolderId);
        expect(folder.parentFolder).toEqual(mockNewParentFolder);
    });
});

describe("deleteFolder() ", ()=>{
    let folderId:number = 10;
    let parentFodlerId:number = 5;
    let mockFolder:MockFolder;

    function setup():void{
        mockMediaStation.rootFolder.requireFolder = jest.fn();
        mockMediaStation.rootFolder.requireFolder.mockImplementationOnce((id:number)=>{
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

        folderManager.deleteFolder(mockMediaStation, folderId, parentFodlerId);

        expect(mockFolder.removeSubFolder).toHaveBeenCalledTimes(1);
        expect(mockFolder.removeSubFolder).toHaveBeenCalledWith(folderId);
    });

    it("should throw an error if the parent-folder does not exist", ()=>{
        setup();
        expect(()=> folderManager.deleteFolder(mockMediaStation, parentFodlerId + 1, folderId)).toThrow(Error);
    });

    it("should throw an error if the folder is not inside the passed parent-folder", ()=>{
        setup();

        mockFolder.removeSubFolder = jest.fn();
        mockFolder.removeSubFolder.mockReturnValue(false)

        expect(()=> folderManager.deleteFolder(mockMediaStation, folderId, parentFodlerId)).toThrow(Error("Folder with ID: " + folderId + " is not inside folder: "+ parentFodlerId));
    });
});