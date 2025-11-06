import {MediaStationRepository} from "../dataStructure/MediaStationRepository.js";
import {MediaStation} from "../dataStructure/MediaStation.js";
import {MediaPlayer, MediaPlayerRole} from "../dataStructure/MediaPlayer.js";
import {NetworkService} from "renderer/network/NetworkService.js";
import {CheckOptions, MediaPlayerConnectionStatus, ConnectionStep, runPipeline, StepDef
} from "renderer/network/MediaPlayerConnectionSteps.js";

export class MediaPlayerConnectionService {
    private _mediaStationRepository: MediaStationRepository;
    private _networkService: NetworkService;

    constructor(mediaStationRepository: MediaStationRepository, networkService: NetworkService) {
        this._mediaStationRepository = mediaStationRepository;
        this._networkService = networkService;
    }

    /**
     * Check connection to media-player in 4 Steps:
     *
     * 1) ICMP echo (host reachability), fails if client pc is not reachable or ICMP-port is blocked.
     *      Note: ICMP can be blocked even when the service is reachable. However here it is mandatory.
     * 2) TCP connection to the ws-port, fails if client pc is not reachable or TCP-port is blocked.
     * 3) Send ping-signal per WebSocket and wait for pong
     * 4) Send registration-signal and wait for response (ONLY FOR ADMIN-ROLE)
     * -> if everything passes, the app is considered online
     *
     * @returns {Promise<MediaPlayerConnectionStatus>} The status of the connection
     */
    async checkConnection(ip: string, options: CheckOptions): Promise<MediaPlayerConnectionStatus> {
        const baseSteps: StepDef[] = [
            { step: ConnectionStep.IcmpPing, run: this._networkService.pcRespondsToPing.bind(this._networkService), failStatus: MediaPlayerConnectionStatus.IcmpPingFailed },
            { step: ConnectionStep.TcpConnect, run: this._networkService.openConnection.bind(this._networkService), failStatus: MediaPlayerConnectionStatus.TcpConnectionFailed },
            { step: ConnectionStep.WsPing, run: this._networkService.isMediaPlayerOnline.bind(this._networkService), failStatus: MediaPlayerConnectionStatus.WebSocketPingFailed },
        ];

        const steps = options.role === "admin"
            ? [...baseSteps, { step: ConnectionStep.Register, run: this._networkService.sendCheckRegistration.bind(this._networkService), failStatus: MediaPlayerConnectionStatus.RegistrationFailed }]
            : baseSteps;

        return runPipeline(ip, steps, options);
    }

    /**
     * Open the connection to the passed media-player and register to it
     *
     * @returns {Promise<boolean>} true if the registration was successful, false if not
     */
    async connectAndRegisterToMediaPlayer(mediaStationId: number, mediaPlayerId: number, role: ("admin" | "user") = "admin"): Promise<boolean> {
        let ip: string = this._getMediaPlayer(mediaStationId, mediaPlayerId).ip;

        if (!await this._networkService.openConnection(ip))
            return false;

        if (role === "admin") {
            if (await this._networkService.sendRegistrationAdminApp(ip) === "no")
                return false;
        } else if (role === "user") {
            if (await this._networkService.sendRegistrationUserApp(ip) === "no")
                return false;
        }

        return true;
    }

    /**
     * Send unregister-command to media-player and close the connection
     */
    async unregisterAndCloseMediaPlayer(mediaStationId: number, mediaPlayerId: number): Promise<void> {
        let ip: string = this._getMediaPlayer(mediaStationId, mediaPlayerId).ip;
        await this._networkService.unregisterAndCloseConnection(ip);
    }

    /**
     * Check if all media-players (including the controller) are online, reachable and registration is possible (as admin-app)
     *
     * @returns {Promise<boolean>} true if all apps are online, false if not
     */
    async checkOnlineStatusOfAllMediaPlayers(id: number): Promise<boolean> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(id);
        const controller:MediaPlayer | null = mediaStation.mediaPlayerRegistry.get(0);
        let contentsJSONstr: string | null;
        let contentsJSON: any;

        if (controller === null || !controller.ip)
            return false;

        if (await this.checkConnection(controller.ip, {role:"admin"}) !== MediaPlayerConnectionStatus.Online)
            return false;

        contentsJSONstr = await this._networkService.getContentFileFrom(controller.ip);

        if (contentsJSONstr === null)
            return false;
        else if (contentsJSONstr === "{}")
            return true;
        else {
            contentsJSON = JSON.parse(contentsJSONstr);

            if (contentsJSON.mediaPlayers) {
                for (let i: number = 0; i < contentsJSON.mediaPlayers.length; i++) {
                    if (contentsJSON.mediaPlayers[i].role !== MediaPlayerRole.CONTROLLER)
                        if (await this.checkConnection(contentsJSON.mediaPlayers[i].ip, {role:"admin"}) !== MediaPlayerConnectionStatus.Online)
                            return false;
                }
            }

            await this._networkService.unregisterAndCloseConnection(controller.ip);
        }
        return true;
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