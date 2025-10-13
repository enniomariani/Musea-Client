import {MediaStationRepository} from "../dataStructure/MediaStationRepository.js";
import {MediaStation} from "../dataStructure/MediaStation.js";
import {MediaApp, MediaAppRole} from "../dataStructure/MediaApp.js";

export interface IMediaAppData {
    ip: string
    name: string
    isController: boolean
}

export class MediaAppDataService {
    private _mediaStationRepository: MediaStationRepository;

    constructor(mediaStationRepository: MediaStationRepository) {
        this._mediaStationRepository = mediaStationRepository;
    }

    /**
     * Create media app. If it is the first created media-app in the media-station it becomes the controller.
     * If it is not the first media-app, it is set to default role.
     * If it is the controller, the media-station-metadata (media-station-name + ip of controller) are saved.
     */
    async createMediaApp(mediaStationId: number, name: string, ip: string): Promise<number> {
        let mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let mediaAppId: number;

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        mediaAppId = mediaStation.getNextMediaAppId();
        mediaStation.mediaAppRegistry.add(mediaAppId, name, ip, mediaAppId === 0 ? MediaAppRole.CONTROLLER : MediaAppRole.DEFAULT);

        if (mediaAppId === 0)
            await this._mediaStationRepository.saveMediaStations();

        return mediaAppId;
    }

    /**
     * Return a map of all media-apps in the media-station.
     * The key is the media-app-id, the value is an object with the following properties:
     *  - name: name of the media-app
     *  - ip: ip of the media-app
     *  - isController: true if the media-app is the controller, false if it is a default-app
     */
    getAllMediaApps(mediaStationId: number): Map<number, IMediaAppData> {
        let map: Map<number, IMediaAppData> = new Map();
        let mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        let allMediaApps: Map<number, MediaApp> = mediaStation.mediaAppRegistry.getAll();

        allMediaApps.forEach((mediaApp: MediaApp) => {
            map.set(mediaApp.id, {
                name: mediaApp.name,
                ip: mediaApp.ip,
                isController: mediaApp.role === MediaAppRole.CONTROLLER
            });
        });

        return map;
    }

    /**
     * Return the name of the media-app
     */
    getName(mediaStationId: number, mediaAppId: number): string {
        return this._getMediaApp(mediaStationId, mediaAppId).name;
    }

    /**
     * Change the name of the media-app
     */
    changeName(mediaStationId: number, mediaAppId: number, name: string): void {
        this._mediaStationRepository.requireMediaStation(mediaStationId);
        const mediaApp: MediaApp = this._getMediaApp(mediaStationId, mediaAppId);
        mediaApp.name = name;
    }

    /**
     * Return the ip of the media-app
     */
    getIp(mediaStationId: number, mediaAppId: number): string {
        return this._getMediaApp(mediaStationId, mediaAppId).ip;
    }

    /**
     * Change the ip of the media-app.
     * If mediaApp-id is 0 (means it is the controller), save the mediastation-metadata.
     */
    async changeIp(mediaStationId: number, mediaAppId: number, ip: string): Promise<void> {
        this._mediaStationRepository.requireMediaStation(mediaStationId);
        this._getMediaApp(mediaStationId, mediaAppId).ip = ip;

        if (mediaAppId === 0)
            await this._mediaStationRepository.saveMediaStations();
    }

    private _getMediaApp(mediaStationId: number, mediaAppId: number): MediaApp {
        let mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let mediaApp: MediaApp | null;

        mediaApp = mediaStation.mediaAppRegistry.get(mediaAppId);

        if (!mediaApp)
            throw new Error("Media-App with this ID does not exist: " + mediaAppId);

        return mediaApp;
    }
}