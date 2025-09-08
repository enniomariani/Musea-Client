import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    MediaAppCommandService
} from "@app/mcf/renderer/network/MediaAppCommandService";
import {MockNetworkService} from "__mocks__/mcf/renderer/network/MockNetworkService";
import {MediaApp} from "@app/mcf/renderer/dataStructure/MediaApp";

let commandService:MediaAppCommandService;
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
    commandService = new MediaAppCommandService(mockNetworkService);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("sendCommandPlay() ", ()=> {

    it("should call networkService.sendMediaControlTo for the mediaApp passed and send the PLAY-command", async () => {
        //setup
        const command:string[] = [MediaAppCommandService.COMMAND_PLAY, contentId.toString()];

        //method to test
        await commandService.sendCommandPlay(mediaApp1,contentId);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledWith(mediaApp1.ip, command);
    });

    it("should call networkService.sendMediaControlTo for the mediaApp passed and send the PLAY-command if contentId = 0", async () => {
        //setup
        const command:string[] = [MediaAppCommandService.COMMAND_PLAY, "0"];

        //method to test
        await commandService.sendCommandPlay(mediaApp2,0);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledWith( mediaApp2.ip, command);
    });

    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct PLAY-command if there is no contentId passed", async () => {
        //setup
        const command:string[] = [MediaAppCommandService.COMMAND_PLAY];

        //method to test
        await commandService.sendCommandPlay(mediaApp3,null);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledWith( mediaApp3.ip, command);
    });

    it("should print an error if the media-App has no IP set", async () => {
        //setup
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await commandService.sendCommandPlay(mediaApp2,null);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandStop() ", ()=> {
    it("should call networkService.sendMediaControlTo for the mediaApp with the correct STOP-command", async () => {
        //setup
        const command:string[] = [MediaAppCommandService.COMMAND_STOP];

        //method to test
        await commandService.sendCommandStop(mediaApp1);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(1);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
    });

    it("should print an error if the media-App has no IP set", async () => {
        //setup
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await commandService.sendCommandStop(mediaApp2);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandPause() ", ()=> {
    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct PAUSE-command", async () => {
        //setup
        const command:string[] = [MediaAppCommandService.COMMAND_PAUSE];

        //method to test
        await commandService.sendCommandPause(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        const command:string[] = [MediaAppCommandService.COMMAND_PAUSE];
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await commandService.sendCommandPause(mediaApps);

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
        const command:string[] = [MediaAppCommandService.COMMAND_FWD];

        //method to test
        await commandService.sendCommandFwd(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        const command:string[] = [MediaAppCommandService.COMMAND_FWD];
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await commandService.sendCommandFwd(mediaApps);

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
        const command:string[] = [MediaAppCommandService.COMMAND_REW];

        //method to test
        await commandService.sendCommandRew(mediaApps);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        const command:string[] = [MediaAppCommandService.COMMAND_REW];
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await commandService.sendCommandRew(mediaApps);

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
        const command:string[] = [MediaAppCommandService.COMMAND_SEEK , position.toString()];

        //method to test
        await commandService.sendCommandSeek(mediaApps, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should call networkService.sendMediaControlTo for every mediaApp defined in the mediaStation with the correct SEEK-command, when position is 0", async () => {
        //setup
        const position:number = 0;
        const command:string[] = [MediaAppCommandService.COMMAND_SEEK , position.toString()];

        //method to test
        await commandService.sendCommandSeek(mediaApps, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        const position:number = 233;
        const command:string[] = [MediaAppCommandService.COMMAND_SEEK, position.toString()];
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await commandService.sendCommandSeek(mediaApps, position);

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
        await commandService.sendCommandSeek(mediaApps, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandSync() ", ()=> {
    it("should call networkService.sendMediaControlTo for the passed mediaApp with the correct SEEK-command", async () => {
        //setup
        const position:number = 233;
        const command:string[] = [MediaAppCommandService.COMMAND_SYNC , position.toString()];

        //method to test
        await commandService.sendCommandSync(mediaApp1, position);

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
        await commandService.sendCommandSync(mediaApp1, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should print an error if the position is below 0 and not send it", async () => {
        //setup
        const position:number = -20;
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await commandService.sendCommandSync(mediaApp1, position);

        //tests
        expect(mockNetworkService.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandLight() ", ()=> {
    it("should call networkService.sendLightCommandTo for every mediaApp defined in the mediaStation with the correct LIGHT-command", async () => {
        //setup
        const command:string[] = [MediaAppCommandService.COMMAND_LIGHT];
        command.push("2")

        //method to test
        await commandService.sendCommandLight(mediaApps, 2);

        //tests
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenNthCalledWith(2, mediaApp2.ip, command);
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenNthCalledWith(3, mediaApp3.ip, command);
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        const command:string[] = [MediaAppCommandService.COMMAND_LIGHT];
        command.push("1");
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await commandService.sendCommandLight(mediaApps, 1);

        //tests
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenNthCalledWith(1, mediaApp1.ip, command);
        expect(mockNetworkService.sendLightCommandTo).toHaveBeenNthCalledWith(2, mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandMute() ", ()=> {
    const command:string[] = ["volume", MediaAppCommandService.COMMAND_MUTE];

    it("should call networkService.sendSystemCommand for every mediaApp defined in the mediaStation with the correct command", async () => {
        //method to test
        await commandService.sendCommandMute(mediaApps);

        //tests
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(1,mediaApp1.ip, command)
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(2,mediaApp2.ip, command)
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(3,mediaApp3.ip, command)
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await commandService.sendCommandMute(mediaApps);

        //tests
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(1,mediaApp1.ip, command);
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(2,mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandUnMute() ", ()=> {
    const command:string[] = ["volume", MediaAppCommandService.COMMAND_UNMUTE];

    it("should call networkService.sendSystemCommand for every mediaApp defined in the mediaStation with the correct command", async () => {
        //method to test
        await commandService.sendCommandUnmute(mediaApps);

        //tests
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(1,mediaApp1.ip, command)
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(2,mediaApp2.ip, command)
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(3,mediaApp3.ip, command)
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await commandService.sendCommandUnmute(mediaApps);

        //tests
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(1,mediaApp1.ip, command);
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(2,mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("sendCommandSetVolume() ", ()=> {
    const command:string[] = ["volume", MediaAppCommandService.COMMAND_SET_VOLUME, "0.3"];

    it("should call networkService.sendSystemCommand for every mediaApp defined in the mediaStation with the correct command", async () => {
        //method to test
        await commandService.sendCommandSetVolume(mediaApps, 0.3);

        //tests
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenCalledTimes(3);
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(1,mediaApp1.ip, command)
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(2,mediaApp2.ip, command)
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(3,mediaApp3.ip, command)
    });

    it("should print an error if one of the media-Apps has no IP set, but still send the command to the others", async () => {
        //setup
        mediaApp2.ip = "";
        let logSpy:any = jest.spyOn(global.console, 'error');

        //method to test
        await commandService.sendCommandSetVolume(mediaApps, 0.3);

        //tests
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenCalledTimes(2);
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(1,mediaApp1.ip, command);
        expect(mockNetworkService.sendSystemCommandTo).toHaveBeenNthCalledWith(2,mediaApp3.ip, command);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});