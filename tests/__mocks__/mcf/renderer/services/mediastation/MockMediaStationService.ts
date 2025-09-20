import {MediaStationService} from "src/mcf/renderer/services/mediastation/MediaStationService";
import {ProgressReporter} from "src/mcf/renderer/services/mediastation/SyncEvents";

import {MockMediaStationDataService} from "tests/__mocks__/mcf/renderer/services/mediastation/MockMediaStationDataService";
import {MockMediaStationCacheService} from "tests/__mocks__/mcf/renderer/services/mediastation/MockMediaStationCacheService";
import {MockMediaStationCommandService} from "tests/__mocks__/mcf/renderer/services/mediastation/MockMediaStationCommandService";
import {MockMediaStationContentsService} from "tests/__mocks__/mcf/renderer/services/mediastation/MockMediaStationContentsService";
import {MockMediaStationSyncService} from "tests/__mocks__/mcf/renderer/services/mediastation/MockMediaStationSyncService";
import {MockMediaStationEventService} from "tests/__mocks__/mcf/renderer/services/mediastation/MockMediaStationEventService";

export class MockMediaStationService extends MediaStationService {
    // Data
    loadMediaStations: jest.Mock<Promise<Map<string, string>>, []>;
    createMediaStation: jest.Mock<Promise<number>, [name: string]>;
    deleteMediaStation: jest.Mock<Promise<void>, [id: number]>;
    renameMediaStation: jest.Mock<Promise<void>, [id: number, newName: string]>;
    getControllerIp: jest.Mock<string | null, [id: number]>;
    getMediaStationName: jest.Mock<string, [id: number]>;

    // Cache
    cacheMediaStation: jest.Mock<void, [id: number]>;
    isMediaStationCached: jest.Mock<Promise<boolean>, [id: number]>;

    // Commands
    play: jest.Mock<Promise<void>, [mediaStationId: number, contentId: number | null]>;
    stop: jest.Mock<Promise<void>, [mediaStationId: number]>;
    pause: jest.Mock<Promise<void>, [mediaStationId: number]>;
    forward: jest.Mock<Promise<void>, [mediaStationId: number]>;
    rewind: jest.Mock<Promise<void>, [mediaStationId: number]>;
    sync: jest.Mock<Promise<void>, [mediaStationId: number, contentId: number, posInSec: number]>;
    seek: jest.Mock<Promise<void>, [mediaStationId: number, posInSec: number]>;
    mute: jest.Mock<Promise<void>, [mediaStationId: number]>;
    unmute: jest.Mock<Promise<void>, [mediaStationId: number]>;
    setVolume: jest.Mock<Promise<void>, [mediaStationId: number, volume: number]>;

    // Contents
    downloadContents: jest.Mock<Promise<string>, [mediaStationId: number, preserveName: boolean, role?: "admin" | "user"]>;

    // Sync
    syncMediaStation: jest.Mock<Promise<boolean>, [mediaStationId: number, progressReporter: ProgressReporter]>;

    // Events
    onBlockReceived: jest.Mock<void, [callback: Function]>;
    onUnBlockReceived: jest.Mock<void, [callback: Function]>;

    constructor() {
        super(
            new MockMediaStationDataService(),
            new MockMediaStationCacheService(),
            new MockMediaStationCommandService(),
            new MockMediaStationContentsService(),
            new MockMediaStationSyncService(),
            new MockMediaStationEventService()
        );

        // Data
        this.loadMediaStations = jest.fn();
        this.createMediaStation = jest.fn();
        this.deleteMediaStation = jest.fn();
        this.renameMediaStation = jest.fn();
        this.getControllerIp = jest.fn();
        this.getMediaStationName = jest.fn();

        // Cache
        this.cacheMediaStation = jest.fn();
        this.isMediaStationCached = jest.fn();

        // Commands
        this.play = jest.fn();
        this.stop = jest.fn();
        this.pause = jest.fn();
        this.forward = jest.fn();
        this.rewind = jest.fn();
        this.sync = jest.fn();
        this.seek = jest.fn();
        this.mute = jest.fn();
        this.unmute = jest.fn();
        this.setVolume = jest.fn();

        // Contents
        this.downloadContents = jest.fn();

        // Sync
        this.syncMediaStation = jest.fn();

        // Events
        this.onBlockReceived = jest.fn();
        this.onUnBlockReceived = jest.fn();
    }
}