import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {MediaApp} from "../dataStructure/MediaApp";

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

    async createMediaApp(mediaStationId: number, name: string, ip: string): Promise<number> {
        let mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let mediaAppId: number;

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        mediaAppId = mediaStation.getNextMediaAppId();
        mediaStation.mediaAppRegistry.add(mediaAppId, name, ip, mediaAppId === 0 ? MediaApp.ROLE_CONTROLLER : MediaApp.ROLE_DEFAULT);

        if (mediaAppId === 0)
            await this._mediaStationRepository.saveMediaStations();

        return mediaAppId;
    }

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
                isController: mediaApp.role === MediaApp.ROLE_CONTROLLER
            });
        });

        return map;
    }

    getName(mediaStationId: number, mediaAppId: number): string {
        return this._getMediaApp(mediaStationId, mediaAppId).name;
    }

    changeName(mediaStationId: number, mediaAppId: number, name: string): void {
        this._mediaStationRepository.requireMediaStation(mediaStationId);
        const mediaApp: MediaApp = this._getMediaApp(mediaStationId, mediaAppId);
        mediaApp.name = name;
    }

    getIp(mediaStationId: number, mediaAppId: number): string {
        return this._getMediaApp(mediaStationId, mediaAppId).ip;
    }

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