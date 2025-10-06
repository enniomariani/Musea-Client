import {ConvertNetworkData} from "./ConvertNetworkData";

type PromiseHandler<T = any> = {
    resolve: (value: T) => void;
    reject: (error?: any) => void;
};

export class NetworkCommandRouter {

    private _onBlockReceivedCallback: Function | null = null;
    private _onUnBlockReceivedCallback: Function | null = null;
    private _onPingReceived: Function | null = null;

    constructor(){}

    onBlockReceived(callback: (() => void) | null = null): void {
        this._onBlockReceivedCallback = callback;
    }

    onUnBlockReceived(callback: (() => void) | null = null): void {
        this._onUnBlockReceivedCallback = callback;
    }

    onPingReceived(callback:((ip:string) => void) | null = null):void{
        this._onPingReceived = callback;
    }

    async routeCommand(
        ip: string,
        command: (string | Uint8Array)[],
        promise?: PromiseHandler
    ): Promise<void> {

        if (command[0] === ConvertNetworkData.INTERPRETATION_ERROR) {
            console.error("Non-valid command received: ", command);
            this._resolveWithNull(promise, ip);
            return;
        }

        if (command.length < 2) return;

        const [category, action, ...params] = command;

        if (category === "network") {
            await this._handleNetworkCommand(ip, action as string, params, promise);
        } else if (category === "contents") {
            this._handleContentsCommand(ip, action as string, params, promise);
        } else if (category === "media") {
            this._handleMediaCommand(ip, action as string, params, promise);
        } else if (category === "system") {
            this._handleSystemCommand(ip, action as string, params, promise);
        } else {
            console.error("Non-valid command received: ", command);
            this._resolveWithNull(promise, ip);
        }
    }

    private async _handleNetworkCommand(
        ip: string,
        action: string,
        params: (string | Uint8Array)[],
        promise?: PromiseHandler
    ): Promise<void> {
        switch (action) {
            case "ping":
                this._onPingReceived?.(ip);
                break;
            case "pong":
                promise?.resolve(true);
                break;
            case "registration":
                if (params[0] === "accepted") promise?.resolve("yes");
                else if (params[0] === "accepted_block") promise?.resolve("yes_blocked");
                else promise?.resolve("no");
                break;
            case "isRegistrationPossible":
                promise?.resolve(params[0] === "yes");
                break;
            default:
                console.error("Non-valid network command received: ", action, params);
                this._resolveWithNull(promise, ip);
                break;
        }
    }

    private _handleContentsCommand(
        ip: string,
        action: string,
        params: (string | Uint8Array)[],
        promise?: PromiseHandler
    ): void {
        if (action === "put" && params[0] !== null) {
            console.log("contents received: ", params[0]);
            promise?.resolve(params[0]);
        } else {
            console.error("Non-valid content-command received: ", action, params);
            this._resolveWithNull(promise, ip);
        }
    }

    private _handleMediaCommand(
        ip: string,
        action: string,
        params: (string | Uint8Array)[],
        promise?: PromiseHandler
    ): void {
        if (action === "put" && params[0] !== null && typeof params[0] === "string") {
            console.log("media received: ", params[0], promise);
            promise?.resolve(parseInt(params[0]));
        } else {
            console.error("Non-valid media-command received: ", action, params);
            this._resolveWithNull(promise, ip);
        }
    }

    private _handleSystemCommand(
        ip: string,
        action: string,
        params: (string | Uint8Array)[],
        promise?: PromiseHandler): void {
        if (action === "block") {
            this._onBlockReceivedCallback?.();
        } else if (action === "unblock") {
            this._onUnBlockReceivedCallback?.();
        } else {
            console.error("Non-valid system-command received: ", action, params);
            this._resolveWithNull(promise, ip);
        }
    }

    private _resolveWithNull(promise: PromiseHandler | undefined, ip: string): void {
        promise?.resolve(null);
    }
}