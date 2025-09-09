// TypeScript
import {MediaStationDataService} from "src/mcf/renderer/services/mediastation/MediaStationDataService";
import {MediaStationCacheService} from "src/mcf/renderer/services/mediastation/MediaStationCacheService";
import {MediaStationCommandService} from "src/mcf/renderer/services/mediastation/MediaStationCommandService";
import {MediaStationContentsService} from "src/mcf/renderer/services/mediastation/MediaStationContentsService";
import {MediaStationSyncService} from "src/mcf/renderer/services/mediastation/MediaStationSyncService";

export class MediaStationService {
    private _data: MediaStationDataService;
    private _cache: MediaStationCacheService;
    private _command: MediaStationCommandService;
    private _contents: MediaStationContentsService;
    private _sync: MediaStationSyncService;

    constructor(
        dataService: MediaStationDataService,
        cacheService: MediaStationCacheService,
        commandService: MediaStationCommandService,
        contentsService: MediaStationContentsService,
        syncService: MediaStationSyncService
    ) {
        this._data = dataService;
        this._cache = cacheService;
        this._command = commandService;
        this._contents = contentsService;
        this._sync = syncService;
    }

    // Data
    async loadMediaStations(): Promise<Map<string, string>> {
        return this._data.loadMediaStations();
    }
    createMediaStation(name: string): number {
        return this._data.createMediaStation(name);
    }
    async deleteMediaStation(id: number): Promise<void> {
        return this._data.deleteMediaStation(id);
    }
    renameMediaStation(id: number, newName: string): void {
        this._data.changeName(id, newName);
    }
    getControllerIp(id: number): string | null {
        return this._data.getControllerIp(id);
    }
    getMediaStationName(id: number): string {
        return this._data.getName(id);
    }

    // Cache
    cacheMediaStation(id: number): void {
        this._cache.cacheMediaStation(id);
    }
    async isMediaStationCached(id: number): Promise<boolean> {
        return this._cache.isMediaStationCached(id);
    }

    // Commands
    async play(mediaStationId: number, contentId: number | null): Promise<void> {
        return this._command.sendCommandPlay(mediaStationId, contentId);
    }
    async stop(mediaStationId: number): Promise<void> {
        return this._command.sendCommandStop(mediaStationId);
    }
    async pause(mediaStationId: number): Promise<void> {
        return this._command.sendCommandPause(mediaStationId);
    }
    async forward(mediaStationId: number): Promise<void> {
        return this._command.sendCommandFwd(mediaStationId);
    }
    async rewind(mediaStationId: number): Promise<void> {
        return this._command.sendCommandRew(mediaStationId);
    }
    async sync(mediaStationId: number, contentId: number, posInSec: number): Promise<void> {
        return this._command.sendCommandSync(mediaStationId, contentId, posInSec);
    }
    async seek(mediaStationId: number, posInSec: number): Promise<void> {
        return this._command.sendCommandSeek(mediaStationId, posInSec);
    }

    async mute(mediaStationId: number): Promise<void> {
        return this._command.sendCommandMute(mediaStationId);
    }
    async unmute(mediaStationId: number): Promise<void> {
        return this._command.sendCommandUnmute(mediaStationId);
    }
    async setVolume(mediaStationId: number, volume: number): Promise<void> {
        return this._command.sendCommandSetVolume(mediaStationId, volume);
    }

    // Contents
    async downloadContents(mediaStationId: number, preserveName: boolean, role: "admin" | "user" = "admin"): Promise<string> {
        return this._contents.downloadContentsOfMediaStation(mediaStationId, preserveName, role);
    }

    // Sync
    async runSync(mediaStationId: number, onSyncStep: (info: string) => void): Promise<boolean> {
        return this._sync.sync(mediaStationId, onSyncStep);
    }
}