import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    ContentNetworkService
} from "../../../../src/js/mcf/renderer/services/ContentNetworkService";
import {MockNetworkService} from "../../../__mocks__/mcf/renderer/services/MockNetworkService";
import {MediaApp} from "../../../../src/js/mcf/renderer/dataStructure/MediaApp";

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

    it("should call networkService.sendMediaControlTo for the mediaApp passed and send the PLAY-command", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_PLAY, contentId.toString()];

        //method to test
        await contentNetworkService.sendCommandPlay(mediaApp1,contentId);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledWith(mediaApp1.ip, command);
    });

    it("should call networkService.sendMediaControlTo for the mediaApp passed and send the PLAY-command if contentId = 0", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_PLAY, "0"];

        //method to test
        await contentNetworkService.sendCommandPlay(mediaApp2,0);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledWith( mediaApp2.ip, command);
    });

    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct PLAY-command if there is no contentId passed", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_PLAY];

        //method to test
        await contentNetworkService.sendCommandPlay(mediaApp3,null);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledWith( mediaApp3.ip, command);
    });

    it("should print an error if the media-App has no IP set", async () => {
        //setup
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await contentNetworkService.sendCommandPlay(mediaApp2,null);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandStop() ", ()=> {
    it("should call networkService.sendMediaControlTo for the mediaApp with the correct STOP-command", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_STOP];

        //method to test
        await contentNetworkService.sendCommandStop(mediaApp1);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
    });

    it("should print an error if the media-App has no IP set", async () => {
        //setup
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await contentNetworkService.sendCommandStop(mediaApp2);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandPause() ", ()=> {
    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct PAUSE-command", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_PAUSE];

        //method to test
        await contentNetworkService.sendCommandPause(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_PAUSE];
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await contentNetworkService.sendCommandPause(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandFwd() ", ()=> {
    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct FWD-command", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_FWD];

        //method to test
        await contentNetworkService.sendCommandFwd(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_FWD];
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await contentNetworkService.sendCommandFwd(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandRew() ", ()=> {
    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct REW-command", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_REW];

        //method to test
        await contentNetworkService.sendCommandRew(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_REW];
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await contentNetworkService.sendCommandRew(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandSeek() ", ()=> {
    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct SEEK-command", async () => {
        //setup
        const position:number = 233;
        const command:string[] = [ContentNetworkService.COMMAND_SEEK , position.toString()];

        //method to test
        await contentNetworkService.sendCommandSeek(mediaApps, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        const position:number = 233;
        const command:string[] = [ContentNetworkService.COMMAND_SEEK, position.toString()];
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await contentNetworkService.sendCommandSeek(mediaApps, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should print an error if the position is below 0 and not send it", async () => {
        //setup
        const position:number = -20;
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await contentNetworkService.sendCommandSeek(mediaApps, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandSync() ", ()=> {
    it("should call networkService.sendMediaControlTo for the passed mediaApp with the correct SEEK-command", async () => {
        //setup
        const position:number = 233;
        const command:string[] = [ContentNetworkService.COMMAND_SYNC , position.toString()];

        //method to test
        await contentNetworkService.sendCommandSync(mediaApp1, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledWith( mediaApp1.ip, command);
    });

    it("should print an error if the media-Apps has no IP set", async () => {
        //setup
        const position:number = 233;
        mediaApp1.ip = "";
        let logSpy:any = jest.spyOn(console, 'error');

        //method to test
        await contentNetworkService.sendCommandSync(mediaApp1, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should print an error if the position is below 0 and not send it", async () => {
        //setup
        const position:number = -20;
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await contentNetworkService.sendCommandSync(mediaApp1, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandLight() ", ()=> {
    it("should call networkService.sendLightCommandTo for every mediaApp defined in the mediaStation with the correct LIGHT-command", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_LIGHT];
        command.push("2")

        //method to test
        await contentNetworkService.sendCommandLight(mediaApps, 2);

        //tests
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        const command:string[] = [ContentNetworkService.COMMAND_LIGHT];
        command.push("1");
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await contentNetworkService.sendCommandLight(mediaApps, 1);

        //tests
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenNthCalledWith(2, mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});