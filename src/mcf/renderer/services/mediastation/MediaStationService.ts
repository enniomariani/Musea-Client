import {MediaStationDataService} from "src/mcf/renderer/services/mediastation/MediaStationDataService";
import {MediaStationCacheService} from "src/mcf/renderer/services/mediastation/MediaStationCacheService";
import {MediaStationCommandService} from "src/mcf/renderer/services/mediastation/MediaStationCommandService";
import {MediaStationContentsService} from "src/mcf/renderer/services/mediastation/MediaStationContentsService";
import {MediaStationSyncService} from "src/mcf/renderer/services/mediastation/MediaStationSyncService";
import {ProgressReporter} from "src/mcf/renderer/services/mediastation/SyncEvents";
import {MediaStationEventService} from "src/mcf/renderer/services/mediastation/MediaStationEventService";

export class MediaStationService {
    private _data: MediaStationDataService;
    private _cache: MediaStationCacheService;
    private _command: MediaStationCommandService;
    private _contents: MediaStationContentsService;
    private _sync: MediaStationSyncService;
    private _events:MediaStationEventService;

    constructor(
        dataService: MediaStationDataService,
        cacheService: MediaStationCacheService,
        commandService: MediaStationCommandService,
        contentsService: MediaStationContentsService,
        syncService: MediaStationSyncService,
        eventService: MediaStationEventService
    ) {
        this._data = dataService;
        this._cache = cacheService;
        this._command = commandService;
        this._contents = contentsService;
        this._sync = syncService;
        this._events = eventService
    }

    // Data
    /**
     * (Re-) load all media-stations + controller-ips from the saved JSON-file
     *
     * clears all previsously loaded media-stations and resets the media-station-id-counter before loading the
     *
     * mediastation-metadata-file (savedMediaStations.json)
     *
     * @returns {Promise<Map<string, string>>} A map of media-station-names and controller-ips
     */
    async loadMediaStations(): Promise<Map<string, string>> {
        return this._data.loadMediaStations();
    }

    /**
     * Add media-station and save the name to the mediastation-metadata-file (savedMediaStations.json)
     *
     * @returns {Promise<number>}   The id of the newly created media-station
     */
    async createMediaStation(name: string): Promise<number> {
        return await this._data.createMediaStation(name);
    }

    /**
     * Remove a mediastation and save the new mediastation-metadata-file (savedMediaStations.json)
     *
     * Caution: at the moment mediastaions can be deleted, but the data on the media-apps remains ->
     * If a media-app with existing data is inserted into another media-station, this can lead to unforseen bugs/errors!
     */
    async deleteMediaStation(id: number): Promise<void> {
        return this._data.deleteMediaStation(id);
    }

    /**
     * Rename a mediastation and save the new mediastation-metadata-file (savedMediaStations.json)
     */
    async renameMediaStation(id: number, newName: string): Promise<void> {
        await this._data.changeName(id, newName);
    }

    /**
     * get the ip of the controller of the media-station
     *
     * @param {number} id id of the media-station
     * @returns {string | null} return null there is no controller defined in the media-station. If the controller does not
     * have an ip-address, return ""
     */
    getControllerIp(id: number): string | null {
        return this._data.getControllerIp(id);
    }

    /**
     * Return the name of the media-station with the given id
     */
    getMediaStationName(id: number): string {
        return this._data.getName(id);
    }

    // Cache
    /**
     * Cache the whole content (folder-structure, tags, contents, ..., except the media-files) of the media-station with the given id.
     * The cached contents.json file will be saved in the data folder.
     * The file persists until the media-station is succesfully synced
     */
    cacheMediaStation(id: number): void {
        this._cache.cacheMediaStation(id);
    }
    /**
     * Check if the media-station with the given id is cached
     */
    async isMediaStationCached(id: number): Promise<boolean> {
        return this._cache.isMediaStationCached(id);
    }

    // Commands
    /**
     * Send the command play to all media-apps defined in the media-station
     *
     * @param {number} mediaStationId
     * @param {number | null} contentId     if null, the actual set media is played
     * @returns {Promise<void>}
     */
    async play(mediaStationId: number, contentId: number | null): Promise<void> {
        return this._command.sendCommandPlay(mediaStationId, contentId);
    }

    /**
     * Send the command stop to all media-apps defined in the media-station
     */
    async stop(mediaStationId: number): Promise<void> {
        return this._command.sendCommandStop(mediaStationId);
    }

    /**
     * Send the command pause to all media-apps defined in the media-station
     */
    async pause(mediaStationId: number): Promise<void> {
        return this._command.sendCommandPause(mediaStationId);
    }

    /**
     * Send the command forward (video-fwd) to all media-apps defined in the media-station
     */
    async forward(mediaStationId: number): Promise<void> {
        return this._command.sendCommandFwd(mediaStationId);
    }

    /**
     * Send the command rewind (video-rew) to all media-apps defined in the media-station
     */
    async rewind(mediaStationId: number): Promise<void> {
        return this._command.sendCommandRew(mediaStationId);
    }

    /**
     * Send the command sync to all media-apps defined in the media-station. Sync-calls are sent to synchronise playback
     * among the different media-apps
     */
    async sync(mediaStationId: number, contentId: number, posInSec: number): Promise<void> {
        return this._command.sendCommandSync(mediaStationId, contentId, posInSec);
    }

    /**
     * Send seek command to all media-apps defined in the media-station
     *
     * Prints an error and does not send the command if posInSec is negative
     */
    async seek(mediaStationId: number, posInSec: number): Promise<void> {
        return this._command.sendCommandSeek(mediaStationId, posInSec);
    }

    /**
     * Send command mute to all media-apps defined in the media-station
     */
    async mute(mediaStationId: number): Promise<void> {
        return this._command.sendCommandMute(mediaStationId);
    }

    /**
     * Send command un-mute to all media-apps defined in the media-station
     */
    async unmute(mediaStationId: number): Promise<void> {
        return this._command.sendCommandUnmute(mediaStationId);
    }

    /**
     * Send command set volume to all media-apps defined in the media-station
     */
    async setVolume(mediaStationId: number, volume: number): Promise<void> {
        return this._command.sendCommandSetVolume(mediaStationId, volume);
    }

    // Contents
    //TO DO: mit enums ergänzen, wenn download-klasse dann enums hat!
    /**
     * Download the contents.json file (the file that holds all meta-information about the folder-structure, contents, light-intensity,
     * tags, ...) from the controller-app of the media-station with the given id.
     *
     * Connects and registers to the controller-app with the role "role". Does not close the connection after downloading the contents.
     *
     * @param {number} mediaStationId
     * @param {boolean} preserveName
     * @param {"admin" | "user"} role   user = apps that do not block the media-station. admin = apps that block the media-station and send
     * block/unblock-commands to apps connected with the role "user". Only one admin + one user-app can be connected to a media-station at the same time
     * @returns {Promise<string>}
     */
    async downloadContents(mediaStationId: number, preserveName: boolean, role: "admin" | "user" = "admin"): Promise<string> {
        return this._contents.downloadContentsOfMediaStation(mediaStationId, preserveName, role);
    }

    // Sync
    /**
     * Send the file contents.json to the controller (which holds folder-structure, content-info, tag-info, etc.) and all cached media-files
     * to their specific media-app and delete-commands to delete media files.
     *
     * If a media-file is sent succesfully (and the ID created on the media-app is received): Delete the cached file
     *
     * If all media-files + all delete-commands are sent, send the contents.json-File to the controller and delete the cached one.
     *
     * To check if the last sync was succesful, call isMediaStationCached(). If it returns true, the sync was NOT succesful.
     *
     * Attention: always registers as admin-app!
     *
     * @param {number} mediaStationId
     * @param {ProgressReporter} progressReporter Emit an info-event after and before every sync-step.
     * @returns {Promise<boolean>}
     */
    async syncMediaStation(mediaStationId: number, progressReporter: ProgressReporter): Promise<boolean> {
        return this._sync.sync(mediaStationId, progressReporter);
    }

    // Events
    /**
     * Is executed when a block-event is received from a media-app (only apps registered as role "user" receive block-events)
     */
    onBlockReceived(callback:() => void): void {
        this._events.onBlockReceived(callback);
    }

    /**
     * Is executed when an un-block-event is received from a media-app (only apps registered as role "user" receive unblock-events)
     */
    onUnBlockReceived(callback:() => void): void {
        this._events.onUnBlockReceived(callback);
    }
}