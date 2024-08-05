import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {MockMediaStation} from "../../../__mocks__/renderer/mediaClientFramework/dataStructure/MockMediaStation";
import {
    ContentNetworkService
} from "../../../../src/js/renderer/mediaClientFramework/services/ContentNetworkService";
import {MockNetworkService} from "../../../__mocks__/renderer/mediaClientFramework/services/MockNetworkService";
import {MediaApp} from "../../../../src/js/renderer/mediaClientFramework/dataStructure/MediaApp";

let contentNetworkService:ContentNetworkService;
let mockNetworkService:MockNetworkService;

const contentId:number = 12;
let mediaApp1:MediaApp;
let mediaApp2:MediaApp;
let mediaApp3:MediaApp;
let mediaApps:Map<number, MediaApp>

beforeEach(() => {
    mediaApp1 = new MediaApp(0);
    mediaApp1.ip = "127.0.0.1";
    mediaApp2 = new MediaApp(1);
    mediaApp2.ip = "127.0.0.2";
    mediaApp3 = new MediaApp(2);
    mediaApp3.ip = "127.0.0.3";

    mediaApps = new Map();
    mediaApps.set(0, mediaApp1);
    mediaApps.set(1, mediaApp2);
    mediaApps.set(2, mediaApp3);

    mockNetworkService = new MockNetworkService();
    contentNetworkService = new ContentNetworkService(mockNetworkService);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("sendCommandPlay() ", ()=> {

    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct PLAY-command", () => {
        //setup
        const command:string =ContentNetworkService.COMMAND_PLAY + "_" + contentId.toString();

        //method to test
        contentNetworkService.sendCommandPlay(mediaApps,contentId);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct PLAY-command, if contentId = 0", () => {
        //setup
        const command:string =ContentNetworkService.COMMAND_PLAY + "_0";

        //method to test
        contentNetworkService.sendCommandPlay(mediaApps,0);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct PLAY-command if there is no contentId passed", () => {
        //setup
        const command:string =ContentNetworkService.COMMAND_PLAY;

        //method to test
        contentNetworkService.sendCommandPlay(mediaApps,null);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", () => {
        //setup
        const command:string =ContentNetworkService.COMMAND_PLAY;
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        contentNetworkService.sendCommandPlay(mediaApps,null);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandStop() ", ()=> {
    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct STOP-command", () => {
        //setup
        const command:string =ContentNetworkService.COMMAND_STOP;

        //method to test
        contentNetworkService.sendCommandStop(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", () => {
        //setup
        const command:string =ContentNetworkService.COMMAND_STOP;
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        contentNetworkService.sendCommandStop(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandPause() ", ()=> {
    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct PAUSE-command", () => {
        //setup
        const command:string =ContentNetworkService.COMMAND_PAUSE;

        //method to test
        contentNetworkService.sendCommandPause(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", () => {
        //setup
        const command:string =ContentNetworkService.COMMAND_PAUSE;
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        contentNetworkService.sendCommandPause(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandSeek() ", ()=> {
    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct SEEK-command", () => {
        //setup
        const position:number = 233;
        const command:string =ContentNetworkService.COMMAND_SEEK + "_" + position;

        //method to test
        contentNetworkService.sendCommandSeek(mediaApps, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", () => {
        //setup
        const position:number = 233;
        const command:string =ContentNetworkService.COMMAND_SEEK + "_" + position;
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        contentNetworkService.sendCommandSeek(mediaApps, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should print an error if the position is below 0 and not send it", () => {
        //setup
        const position:number = -20;
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        contentNetworkService.sendCommandSeek(mediaApps, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});