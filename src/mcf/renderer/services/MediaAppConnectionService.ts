import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {MediaApp} from "../dataStructure/MediaApp";
import {NetworkService} from "src/mcf/renderer/network/NetworkService";

export enum ConnectionStep {
    IcmpPing = "icmpPing",
    TcpConnect = "tcpConnect",
    WsPing = "wsPing",
    Register = "register",
}

export enum ConnectionStatus {
    IcmpPingFailed = "icmpPingFailed",
    TcpConnectionFailed = "tcpConnectionFailed",
    WebSocketPingFailed = "webSocketPingFailed",
    RegistrationFailed = "registrationFailed",
    Online = "online",
}

export enum StepState {
    Started = "started",
    Succeeded = "succeeded",
    Failed = "failed"
}

export interface IConnectionProgress {
    step: ConnectionStep;
    state: StepState;
}

export class MediaAppConnectionService {
    private _mediaStationRepository: MediaStationRepository;
    private _networkService: NetworkService;

    constructor(mediaStationRepository: MediaStationRepository, networkService: NetworkService) {
        this._mediaStationRepository = mediaStationRepository;
        this._networkService = networkService;
    }

    /**
     * Check connection to media-app in 3 Steps:
     *
     * 1) ICMP echo (host reachability), fails if client pc is not reachable or ICMP-port is blocked.
     *      Note: ICMP can be blocked even when the service is reachable. However here it is mandatory.
     * 2) TCP connection to the ws-port, fails if client pc is not reachable or TCP-port is blocked.
     * 3) Send ping-signal per WebSocket and wait for pong
     * -> if everything passes, the app is considered online
     */
    async checkConnectionAsUserApp(mediaStationId: number, mediaAppId: number, onProgress?: (p: IConnectionProgress) => void): Promise<ConnectionStatus> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;
        return await this._checkConnectionAsUserApp(ip, onProgress);
    }

    /**
     * Check connection to media-app in 4 Steps:
     *
     * 1 -3) see checkConnectionAsUserApp()
     * 4) Send registration-signal and wait for response
     * -> if everything passes, the app is considered online
     */
    async checkConnectionAsAdminApp(mediaStationId: number, mediaAppId: number, onProgress?: (p: IConnectionProgress) => void): Promise<ConnectionStatus> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;
        return await this._checkConnectionAsAdminApp(ip, onProgress);
    }

    private async _checkConnectionAsAdminApp(ip: string, onProgress?: (p: IConnectionProgress) => void): Promise<ConnectionStatus> {
        let stepState: StepState;
        let result: ConnectionStatus = await this._checkConnectionAsUserApp(ip, onProgress);

        if (result !== ConnectionStatus.Online)
            return result;

        stepState = await this._checkConnectionStep(ip, this._networkService.sendCheckRegistration, ConnectionStep.Register, onProgress);

        if (stepState === StepState.Failed)
            return ConnectionStatus.RegistrationFailed;
        else
            return ConnectionStatus.Online;
    }

    private async _checkConnectionAsUserApp(ip: string, onProgress?: (p: IConnectionProgress) => void): Promise<ConnectionStatus> {
        let stepState: StepState;

        stepState = await this._checkConnectionStep(ip, this._networkService.pcRespondsToPing, ConnectionStep.IcmpPing, onProgress);

        if (stepState === StepState.Failed)
            return ConnectionStatus.IcmpPingFailed;

        stepState = await this._checkConnectionStep(ip, this._networkService.openConnection, ConnectionStep.TcpConnect, onProgress);

        if (stepState === StepState.Failed)
            return ConnectionStatus.TcpConnectionFailed;

        stepState = await this._checkConnectionStep(ip, this._networkService.isMediaAppOnline, ConnectionStep.WsPing, onProgress);

        if (stepState === StepState.Failed)
            return ConnectionStatus.WebSocketPingFailed;

        return ConnectionStatus.Online;
    }

    private async _checkConnectionStep(ip: string, stepFunc: (ip: string) => Promise<boolean>, step: ConnectionStep, onProgress?: (p: IConnectionProgress) => void): Promise<StepState> {
        if (onProgress)
            onProgress({step: step, state: StepState.Started});

        const wasSuccesful: boolean = await stepFunc(ip);
        const stepState: StepState = wasSuccesful ? StepState.Succeeded : StepState.Failed;

        if (onProgress)
            onProgress({step: step, state: stepState});

        return stepState;
    }

    async pcRespondsToPing(mediaStationId: number, mediaAppId: number): Promise<boolean> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;
        return await this._networkService.pcRespondsToPing(ip);
    }

    /**
     * opens the connection to the passed media-app and registers to it
     *
     * @param {number} mediaStationId
     * @param {number} mediaAppId
     * @param {string} role      either "user" or "admin", default is "admin"
     * @returns {Promise<boolean>}
     */
    async connectAndRegisterToMediaApp(mediaStationId: number, mediaAppId: number, role: string = "admin"): Promise<boolean> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;

        if (role !== "admin" && role !== "user")
            throw new Error("Role not valid: " + role);

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

    async unregisterAndCloseMediaApp(mediaStationId: number, mediaAppId: number): Promise<void> {
        let ip: string = this._getMediaApp(mediaStationId, mediaAppId).ip;
        await this._networkService.unregisterAndCloseConnection(ip);
    }

    /**
     * checks if all media-apps (including the controller) are online, reachable and registration is possible (as admin-app)
     *
     * returns true if this is true for all of them
     *
     * returns false if one of the media-apps is not reachable
     *
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async checkOnlineStatusOfAllMediaApps(id: number): Promise<boolean> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(id);
        const controllerIP: string = mediaStation.mediaAppRegistry.getControllerIp();
        let contentsJSONstr: string;
        let contentsJSON: any;

        if (!controllerIP)
            return false;

        if (await this._checkConnectionAsAdminApp(controllerIP) !== ConnectionStatus.Online)
            return false;

        contentsJSONstr = await this._networkService.getContentFileFrom(controllerIP);

        if (contentsJSONstr === null)
            return false;
        else if (contentsJSONstr === "{}")
            return true;
        else {
            contentsJSON = JSON.parse(contentsJSONstr);

            if (contentsJSON.mediaApps) {
                for (let i: number = 0; i < contentsJSON.mediaApps.length; i++) {
                    if (contentsJSON.mediaApps[i].role !== MediaApp.ROLE_CONTROLLER)
                        if (await this._checkConnectionAsAdminApp(contentsJSON.mediaApps[i].ip) !== ConnectionStatus.Online)
                            return false;
                }
            }

            await this._networkService.unregisterAndCloseConnection(controllerIP);
        }
        return true;
    }

    private _getMediaApp(mediaStationId: number, mediaAppId: number): MediaApp {
        let mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let mediaApp: MediaApp;

        mediaApp = mediaStation.mediaAppRegistry.get(mediaAppId);

        if (!mediaApp)
            throw new Error("Media-App with this ID does not exist: " + mediaAppId);

        return mediaApp;
    }
}