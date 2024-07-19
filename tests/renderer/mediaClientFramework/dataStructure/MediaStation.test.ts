import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {MediaStation} from "../../../../public_html/js/renderer/mediaClientFramework/dataStructure/MediaStation";

let mediaStation:MediaStation;

beforeEach(() => {
    mediaStation = new MediaStation(0);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("getNextMediaAppId() ", ()=>{
    it("should return an increased ID everytime it's called", ()=>{
        let idPerCall:number[] = [0,1,2,3,4,5,6];
        let answerPerCall:number[] = [];

        //method to test
        for(let i:number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextMediaAppId());

        //tests
        for(let i:number = 0; i < idPerCall.length; i++){
            console.log("got id: ", answerPerCall[i], " expected ID: ", idPerCall[i])
            expect(answerPerCall[i]).toBe(idPerCall[i]);
        }

    });
});

describe("getNextContentId() ", ()=>{
    it("should return an increased ID everytime it's called", ()=>{
        let idPerCall:number[] = [0,1,2,3,4,5,6];
        let answerPerCall:number[] = [];

        //method to test
        for(let i:number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextContentId());

        //tests
        for(let i:number = 0; i < idPerCall.length; i++){
            console.log("got id: ", answerPerCall[i], " expected ID: ", idPerCall[i])
            expect(answerPerCall[i]).toBe(idPerCall[i]);
        }
    });
});

describe("getNextFolderId() ", ()=>{
    it("should return an increased ID everytime it's called", ()=>{
        let idPerCall:number[] = [0,1,2,3,4,5,6];
        let answerPerCall:number[] = [];

        //method to test
        for(let i:number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextFolderId());

        //tests
        for(let i:number = 0; i < idPerCall.length; i++){
            console.log("got id: ", answerPerCall[i], " expected ID: ", idPerCall[i])
            expect(answerPerCall[i]).toBe(idPerCall[i]);
        }
    });
});

describe("getNextTagId() ", ()=>{
    it("should return an increased ID everytime it's called", ()=>{
        let idPerCall:number[] = [0,1,2,3,4,5,6];
        let answerPerCall:number[] = [];

        //method to test
        for(let i:number = 0; i < idPerCall.length; i++)
            answerPerCall.push(mediaStation.getNextTagId());

        //tests
        for(let i:number = 0; i < idPerCall.length; i++){
            console.log("got id: ", answerPerCall[i], " expected ID: ", idPerCall[i])
            expect(answerPerCall[i]).toBe(idPerCall[i]);
        }
    });
});