import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {MediaAppCommandService} from "@app/mcf/renderer/network/MediaAppCommandService";
import {MockNetworkService} from "__mocks__/mcf/renderer/network/MockNetworkService";
import {MediaApp} from "@app/mcf/renderer/dataStructure/MediaApp";

let service: MediaAppCommandService;
let net: MockNetworkService;

const contentId = 12;
let app1: MediaApp;
let app2: MediaApp;
let app3: MediaApp;
let apps: Map<number, MediaApp>;

beforeEach(() => {
    app1 = new MediaApp(0);
    app1.ip = "127.0.0.1";
    app2 = new MediaApp(1);
    app2.ip = "127.0.0.2";
    app3 = new MediaApp(2);
    app3.ip = "127.0.0.3";

    apps = new Map([[0, app1], [1, app2], [2, app3]]);

    net = new MockNetworkService();
    service = new MediaAppCommandService(net);
});

afterEach(() => {
    jest.clearAllMocks();
});

function expectSentTo(targets: Map<number, MediaApp>, method: Function, command: string[]): void {
    let nth = 1;
    expect(method).toHaveBeenCalledTimes(targets.size);
    for (const [, app] of targets) {
        expect(method).toHaveBeenNthCalledWith(nth, app.ip, command);
        nth++;
    }
}

describe("sendCommandPlay()", () => {
    it("PLAY with contentId", async () => {
        const cmd = [MediaAppCommandService.COMMAND_PLAY, contentId.toString()];
        await service.sendCommandPlay(app1, contentId);
        expectSentTo(new Map([[0, app1]]), net.sendMediaControlTo, cmd);
    });

    it("PLAY with contentId 0", async () => {
        const cmd = [MediaAppCommandService.COMMAND_PLAY, "0"];
        await service.sendCommandPlay(app2, 0);
        expectSentTo(new Map([[0, app2]]), net.sendMediaControlTo, cmd);
    });

    it("PLAY without contentId", async () => {
        const cmd = [MediaAppCommandService.COMMAND_PLAY];
        await service.sendCommandPlay(app3, null);
        expectSentTo(new Map([[0, app3]]), net.sendMediaControlTo, cmd);
    });

    it("PLAY no ip", async () => {
        app2.ip = "";
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandPlay(app2, null);
        expect(net.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});

describe("sendCommandStop()", () => {
    it("STOP one app", async () => {
        const cmd = [MediaAppCommandService.COMMAND_STOP];
        await service.sendCommandStop(app1);
        expectSentTo(new Map([[0, app1]]), net.sendMediaControlTo, cmd);
    });

    it("STOP no ip", async () => {
        app2.ip = "";
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandStop(app2);
        expect(net.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});

describe("sendCommandPause()", () => {
    const cmd = [MediaAppCommandService.COMMAND_PAUSE];

    it("PAUSE all", async () => {
        await service.sendCommandPause(apps);
        expectSentTo(apps, net.sendMediaControlTo, cmd);
    });

    it("PAUSE skip empty ip", async () => {
        app2.ip = "";
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandPause(apps);
        expectSentTo(new Map([[0, app1], [1, app3]]), net.sendMediaControlTo, cmd);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});

describe("sendCommandFwd()", () => {
    const cmd = [MediaAppCommandService.COMMAND_FWD];

    it("FWD all", async () => {
        await service.sendCommandFwd(apps);
        expectSentTo(apps, net.sendMediaControlTo, cmd);
    });

    it("FWD skip empty ip", async () => {
        app2.ip = "";
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandFwd(apps);
        expectSentTo(new Map([[0, app1], [1, app3]]), net.sendMediaControlTo, cmd);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});

describe("sendCommandRew()", () => {
    const cmd = [MediaAppCommandService.COMMAND_REW];

    it("REW all", async () => {
        await service.sendCommandRew(apps);
        expectSentTo(apps, net.sendMediaControlTo, cmd);
    });

    it("REW skip empty ip", async () => {
        app2.ip = "";
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandRew(apps);
        expectSentTo(new Map([[0, app1], [1, app3]]), net.sendMediaControlTo, cmd);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});

describe("sendCommandSeek()", () => {
    it("SEEK all pos>0", async () => {
        const pos = 233;
        const cmd = [MediaAppCommandService.COMMAND_SEEK, pos.toString()];
        await service.sendCommandSeek(apps, pos);
        expectSentTo(apps, net.sendMediaControlTo, cmd);
    });

    it("SEEK all pos=0", async () => {
        const pos = 0;
        const cmd = [MediaAppCommandService.COMMAND_SEEK, pos.toString()];
        await service.sendCommandSeek(apps, pos);
        expectSentTo(apps, net.sendMediaControlTo, cmd);
    });

    it("SEEK skip empty ip", async () => {
        const pos = 233;
        const cmd = [MediaAppCommandService.COMMAND_SEEK, pos.toString()];
        app2.ip = "";
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandSeek(apps, pos);
        expectSentTo(new Map([[0, app1], [1, app3]]), net.sendMediaControlTo, cmd);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });

    it("SEEK invalid pos", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandSeek(apps, -20);
        expect(net.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});

describe("sendCommandSync()", () => {
    it("SYNC one app", async () => {
        const pos = 233;
        const cmd = [MediaAppCommandService.COMMAND_SYNC, pos.toString()];
        await service.sendCommandSync(app1, pos);
        expectSentTo(new Map([[0, app1]]), net.sendMediaControlTo, cmd);
    });

    it("SYNC no ip", async () => {
        const pos = 233;
        app1.ip = "";
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandSync(app1, pos);
        expect(net.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });

    it("SYNC invalid pos", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandSync(app1, -20);
        expect(net.sendMediaControlTo).toHaveBeenCalledTimes(0);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});

describe("sendCommandLight()", () => {
    it("LIGHT all", async () => {
        const cmd = [MediaAppCommandService.COMMAND_LIGHT, "2"];
        await service.sendCommandLight(apps, 2);
        expectSentTo(apps, net.sendLightCommandTo, cmd);
    });

    it("LIGHT skip empty ip", async () => {
        const cmd = [MediaAppCommandService.COMMAND_LIGHT, "1"];
        app2.ip = "";
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandLight(apps, 1);
        expectSentTo(new Map([[0, app1], [1, app3]]), net.sendLightCommandTo, cmd);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});

describe("system", () => {
    it("MUTE all", async () => {
        const cmd = ["volume", MediaAppCommandService.COMMAND_MUTE];
        await service.sendCommandMute(apps);
        expectSentTo(apps, net.sendSystemCommandTo, cmd);
    });

    it("UNMUTE all", async () => {
        const cmd = ["volume", MediaAppCommandService.COMMAND_UNMUTE];
        await service.sendCommandUnmute(apps);
        expectSentTo(apps, net.sendSystemCommandTo, cmd);
    });

    it("MUTE skip empty ip", async () => {
        const cmd = ["volume", MediaAppCommandService.COMMAND_MUTE];
        app2.ip = "";
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandMute(apps);
        expectSentTo(new Map([[0, app1], [1, app3]]), net.sendSystemCommandTo, cmd);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });

    it("SET_VOLUME all", async () => {
        const cmd = ["volume", MediaAppCommandService.COMMAND_SET_VOLUME, "0.3"];
        await service.sendCommandSetVolume(apps, 0.3);
        expectSentTo(apps, net.sendSystemCommandTo, cmd);
    });

    it("SET_VOLUME skip empty ip", async () => {
        const cmd = ["volume", MediaAppCommandService.COMMAND_SET_VOLUME, "0.3"];
        app2.ip = "";
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        await service.sendCommandSetVolume(apps, 0.3);
        expectSentTo(new Map([[0, app1], [1, app3]]), net.sendSystemCommandTo, cmd);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});