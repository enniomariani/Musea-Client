import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {MediaApp, MediaAppRole} from "../dataStructure/MediaApp";
import {NetworkService} from "src/mcf/renderer/network/NetworkService";
import {CheckOptions, MediaAppConnectionStatus, ConnectionStep, runPipeline, StepDef
} from "src/mcf/renderer/network/MediaAppConnectionSteps";

export class MediaAppConnectionService {
    private _mediaStationRepository: MediaStationRepository;
    private _networkService: NetworkService;

    constructor(mediaStationRepository: MediaStationRepository, networkService: NetworkService) {
        this._mediaStationRepository = mediaStationRepository;
        this._networkService = networkService;
    }

    /**
     * Check connection to media-app in 4 Steps:
     *
     * 1) ICMP echo (host reachability), fails if client pc is not reachable or ICMP-port is blocked.
     *      Note: ICMP can be blocked even when the service is reachable. However here it is mandatory.
     * 2) TCP connection to the ws-port, fails if client pc is not reachable or TCP-port is blocked.
     * 3) Send ping-signal per WebSocket and wait for pong
     * 4) Send registration-signal and wait for response (ONLY FOR ADMIN-ROLE)
     * -> if everything passes, the app is considered online
     *
     * @returns {Promise<MediaAppConnectionStatus>} The status of the connection
     */
    async checkConnection(ip: string, options: CheckOptions): Promise<MediaAppConnectionStatus> {
        const baseSteps: StepDef[] = [
            { step: ConnectionStep.IcmpPing, run: this._networkService.pcRespondsToPing.bind(this._networkService), failStatus: MediaAppConnectionStatus.IcmpPingFailed },
            { step: ConnectionStep.TcpConnect, run: this._networkService.openConnection.bind(this._networkService), failStatus: MediaAppConnectionStatus.TcpConnectionFailed },
            { step: ConnectionStep.WsPing, run: this._networkService.isMediaAppOnline.bind(this._networkService), failStatus: MediaAppConnectionStatus.WebSocketPingFailed },
        ];

        const steps = options.role === "admin"
            ? [...baseSteps, { step: ConnectionStep.Register, run: this._networkService.sendCheckRegistration.bind(this._networkService), failStatus: MediaAppConnectionStatus.RegistrationFailed }]
            : baseSteps;

        return runPipeline(ip, steps, options);
    }

    /**
     * Open the connection to the passed media-app and register to it
     *
     * @returns {Promise<boolean>} true if the registration was successful, false if not
     */
    async connectAndRegisterToMediaApp(mediaStationId: number, mediaAppId: number, role: ("admin" | "user") = "admin"): Promise<boolean> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;

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
     * Send unregister-command to media-app and close the connection
     */
    async unregisterAndCloseMediaApp(mediaStationId: number, mediaAppId: number): Promise<void> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;
        await this._networkService.unregisterAndCloseConnection(ip);
    }

    /**
     * Check if all media-apps (including the controller) are online, reachable and registration is possible (as admin-app)
     *
     * @returns {Promise<boolean>} true if all apps are online, false if not
     */
    async checkOnlineStatusOfAllMediaApps(id: number): Promise<boolean> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(id);
        const controller:MediaApp | null = mediaStation.mediaAppRegistry.get(0);
        let contentsJSONstr: string | null;
        let contentsJSON: any;

        if (controller === null || !controller.ip)
            return false;

        if (await this.checkConnection(controller.ip, {role:"admin"}) !== MediaAppConnectionStatus.Online)
            return false;

        contentsJSONstr = await this._networkService.getContentFileFrom(controller.ip);

        if (contentsJSONstr === null)
            return false;
        else if (contentsJSONstr === "{}")
            return true;
        else {
            contentsJSON = JSON.parse(contentsJSONstr);

            if (contentsJSON.mediaApps) {
                for (let i: number = 0; i < contentsJSON.mediaApps.length; i++) {
                    if (contentsJSON.mediaApps[i].role !== MediaAppRole.CONTROLLER)
                        if (await this.checkConnection(contentsJSON.mediaApps[i].ip, {role:"admin"}) !== MediaAppConnectionStatus.Online)
                            return false;
                }
            }

            await this._networkService.unregisterAndCloseConnection(controller.ip);
        }
        return true;
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