import {MediaStationRepository} from "renderer/dataStructure/MediaStationRepository.js";
import {MediaStation} from "renderer/dataStructure/MediaStation.js";
import {MediaPlayer, MediaPlayerRole} from "renderer/dataStructure/MediaPlayer.js";

export interface IMediaPlayerData {
    ip: string
    name: string
    isController: boolean
}

export class MediaPlayerDataService {
    private _mediaStationRepository: MediaStationRepository;

    constructor(mediaStationRepository: MediaStationRepository) {
        this._mediaStationRepository = mediaStationRepository;
    }

    /**
     * Create media app. If it is the first created media-player in the media-station it becomes the controller.
     * If it is not the first media-player, it is set to default role.
     * If it is the controller, the media-station-metadata (media-station-name + ip of controller) are saved.
     */
    async createMediaPlayer(mediaStationId: number, name: string, ip: string): Promise<number> {
        let mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let mediaPlayerId: number;

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        mediaPlayerId = mediaStation.getNextMediaPlayerId();
        mediaStation.mediaPlayerRegistry.add(mediaPlayerId, name, ip, mediaPlayerId === 0 ? MediaPlayerRole.CONTROLLER : MediaPlayerRole.DEFAULT);

        if (mediaPlayerId === 0)
            await this._mediaStationRepository.saveMediaStations();

        return mediaPlayerId;
    }

    /**
     * Return a map of all media-players in the media-station.
     * The key is the media-player-id, the value is an object with the following properties:
     *  - name: name of the media-player
     *  - ip: ip of the media-player
     *  - isController: true if the media-player is the controller, false if it is a default-app
     */
    getAllMediaPlayers(mediaStationId: number): Map<number, IMediaPlayerData> {
        let map: Map<number, IMediaPlayerData> = new Map();
        let mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + mediaStationId);

        let allMediaPlayers: Map<number, MediaPlayer> = mediaStation.mediaPlayerRegistry.getAll();

        allMediaPlayers.forEach((mediaPlayer: MediaPlayer) => {
            map.set(mediaPlayer.id, {
                name: mediaPlayer.name,
                ip: mediaPlayer.ip,
                isController: mediaPlayer.role === MediaPlayerRole.CONTROLLER
            });
        });

        return map;
    }

    /**
     * Return the name of the media-player
     */
    getName(mediaStationId: number, mediaPlayerId: number): string {
        return this._getMediaPlayer(mediaStationId, mediaPlayerId).name;
    }

    /**
     * Change the name of the media-player
     */
    changeName(mediaStationId: number, mediaPlayerId: number, name: string): void {
        this._mediaStationRepository.requireMediaStation(mediaStationId);
        const mediaPlayer: MediaPlayer = this._getMediaPlayer(mediaStationId, mediaPlayerId);
        mediaPlayer.name = name;
    }

    /**
     * Return the ip of the media-player
     */
    getIp(mediaStationId: number, mediaPlayerId: number): string {
        return this._getMediaPlayer(mediaStationId, mediaPlayerId).ip;
    }

    /**
     * Change the ip of the media-player.
     * If mediaPlayer-id is 0 (means it is the controller), save the mediastation-metadata.
     */
    async changeIp(mediaStationId: number, mediaPlayerId: number, ip: string): Promise<void> {
        this._mediaStationRepository.requireMediaStation(mediaStationId);
        this._getMediaPlayer(mediaStationId, mediaPlayerId).ip = ip;

        if (mediaPlayerId === 0)
            await this._mediaStationRepository.saveMediaStations();
    }

    private _getMediaPlayer(mediaStationId: number, mediaPlayerId: number): MediaPlayer {
        let mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let mediaPlayer: MediaPlayer | null;

        mediaPlayer = mediaStation.mediaPlayerRegistry.get(mediaPlayerId);

        if (!mediaPlayer)
            throw new Error("Media-Player with this ID does not exist: " + mediaPlayerId);

        return mediaPlayer;
    }
}