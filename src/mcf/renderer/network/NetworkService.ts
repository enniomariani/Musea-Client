import {NetworkConnectionHandler} from "src/mcf/renderer/network/NetworkConnectionHandler";
import {ConvertNetworkData} from "src/mcf/renderer/network/ConvertNetworkData";
import {NetworkCommandRouter} from "./NetworkCommandRouter";

type PromiseHandler<T = any> = {
    resolve: (value: T) => void;
    reject: (error?: any) => void;
};

export class NetworkService {
    private _networkConnectionHandler: NetworkConnectionHandler;
    private _dataReceivedPromises: Map<string, PromiseHandler>;
    private _onConnectionClosedPromises: Map<string, PromiseHandler<void>>;
    private _networkCommandRouter: NetworkCommandRouter;

    constructor(networkConnectionHandler: NetworkConnectionHandler, networkCommandRouter: NetworkCommandRouter = new NetworkCommandRouter()) {
        this._networkConnectionHandler = networkConnectionHandler;
        this._dataReceivedPromises = new Map();
        this._onConnectionClosedPromises = new Map();
        this._networkCommandRouter = networkCommandRouter;
        this._networkCommandRouter.onPingReceived(this._onPingReceived.bind(this));
    }

    /**
     * Open a connection to the passed ip
     * Return true if the connections could be opened
     */
    async openConnection(ip: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this._networkConnectionHandler.hasConnection(ip)) {
                console.info("Connection is already open: ", ip);
                resolve(true);
            } else {
                this._networkConnectionHandler.createConnection(
                    ip,
                    () => {
                        resolve(true);
                    },
                    () => {
                        resolve(false);
                    },
                    this._onConnectionClosed.bind(this),
                    this._onDataReceived.bind(this)
                );
            }
        });
    }

    private async _onPingReceived(ip: string): Promise<void> {
        await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("network", "pong"));
    }

    public closeConnection(ip: string): void {
        this._networkConnectionHandler.closeConnection(ip);
    }

    /**
     * Send a "ping"(ICMP) signal to the ip and return if it was succesful (timeout defined in backend)
     */
    async pcRespondsToPing(ip: string): Promise<boolean> {
        try {
            return await this._networkConnectionHandler.ping(ip);
        } catch (error) {
            return false;
        }
    }

    onBlockReceived(callback: (() => void) | null = null): void {
        this._networkCommandRouter.onBlockReceived(callback);
    }

    onUnBlockReceived(callback: (() => void) | null = null): void {
        this._networkCommandRouter.onUnBlockReceived(callback);
    }

    /**
     * Send a "ping" signal to the ip (if it is connected) via websocket and waits the amount of timeout in MS
     * until it returns a "false" if it did not receive a pong-signal until then
     */
    async isMediaAppOnline(ip: string, timeoutMS: number = 3000): Promise<boolean> {
        return await this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("network", "ping"), timeoutMS, false);
    }

    async sendRegistrationAdminApp(ip: string, timeoutMS: number = 3000): Promise<string> {
        return await this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("network", "register", "admin"), timeoutMS, "no");
    }

    async sendRegistrationUserApp(ip: string, timeoutMS: number = 3000): Promise<string> {
        return await this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("network", "register", "user"), timeoutMS, "no");
    }

    async sendCheckRegistration(ip: string, timeoutMS: number = 3000): Promise<boolean> {
        return await this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("network", "isRegistrationPossible"), timeoutMS, false);
    }

    async unregisterAndCloseConnection(ip: string, timeoutMS: number = 3000): Promise<void> {
        return await this._createConnectionClosedPromise(ip, ConvertNetworkData.encodeCommand("network", "disconnect"), timeoutMS);
    }

    /**
     * Send a command to the ip which asks for the content file saved on it. The media-app should
     * return an empty JSON if there is no content-file or the JSON of the content-file
     *
     * Returns null if there was no response from the controller-app during the timeout passed
     */
    async getContentFileFrom(ip: string, timeoutMS: number = 3000): Promise<string | null> {
        return this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("contents", "get"), timeoutMS, null);
    }

    /**
     * Send a command to the ip which contains the passed media-file and type. If the transfer was succesful, the promise
     * returns the number of the newly created media from the media-app if not it returns null
     */
    async sendMediaFileToIp(ip: string, mediaType: string, mediaFile: Uint8Array, timeoutMS: number = 3000, onSendChunk: Function): Promise<number | null> {
        return this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("media", "put", mediaType, mediaFile), timeoutMS, null, onSendChunk);
    }

    public async sendContentFileTo(ip: string, contentFileJSON: string): Promise<void> {
        await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("contents", "put", contentFileJSON));
    }

    public async sendMediaControlTo(ip: string, commands: string[]): Promise<void> {
        await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("media", "control", ...commands));
    }

    public async sendLightCommandTo(ip: string, commands: string[]): Promise<void> {
        await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("light", ...commands));
    }

    public async sendSystemCommandTo(ip: string, commands: string[]): Promise<void> {
        await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("system", ...commands));
    }

    public async sendDeleteMediaTo(ip: string, id: number): Promise<void> {
        await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("media", "delete", id.toString()));
    }

    private _onConnectionClosed(ip: string): void {
        const promise = this._onConnectionClosedPromises.get(ip);

        if (promise) {
            promise.resolve();
            this._onConnectionClosedPromises.delete(ip);
        }

        //if the app is waiting for a response of a client, but during that, the connection was closed, resolve the
        //promise with null
        if (this._dataReceivedPromises.has(ip)) {
            this._dataReceivedPromises.get(ip)?.resolve(null);
            this._dataReceivedPromises.delete(ip);
        }
    }

    private async _createConnectionClosedPromise(ip: string, command: Uint8Array, timeout: number): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const timer = setTimeout(() => {
                this._onConnectionClosedPromises.delete(ip);
                this.closeConnection(ip);
                resolve();
            }, timeout);

            this._onConnectionClosedPromises.set(ip, {
                resolve: () => {
                    clearTimeout(timer);
                    resolve();
                },
                reject: () => {
                    clearTimeout(timer);
                    reject();
                }
            });

            await this._networkConnectionHandler.sendData(ip, command, null);
        });
    }

    private async _createNetworkPromise(
        ip: string,
        command: Uint8Array,
        timeout: number,
        rejectValue: any,
        onSendChunk: Function | null = null
    ): Promise<any> {

        // Step 1: Send the data
        const sendSuccessful = await this._networkConnectionHandler.sendData(ip, command, onSendChunk);

        if (!sendSuccessful) {
            console.error("Connection closed during sending-process: reject-value: ", rejectValue);
            return rejectValue;
        }

        if (onSendChunk !== null)
            onSendChunk("Daten gesendet, warte auf Antwort...");

        // Step 2: Wait for the response with timeout
        return this._waitForResponse(ip, timeout, rejectValue);
    }

    private _waitForResponse(ip: string, timeout: number, rejectValue: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this._cleanupPromise(ip);
                resolve(rejectValue);
            }, timeout);

            this._dataReceivedPromises.set(ip, {
                resolve: (value) => {
                    clearTimeout(timer);
                    this._cleanupPromise(ip);
                    resolve(value);
                },
                reject: (error) => {
                    clearTimeout(timer);
                    this._cleanupPromise(ip);
                    reject(error);
                }
            });
        });
    }

    private _cleanupPromise(ip: string): void {
        this._dataReceivedPromises.delete(ip);
    }

    private async _onDataReceived(ip: string, data: Uint8Array): Promise<void> {
        const convertedData = ConvertNetworkData.decodeCommand(data);
        const promise = this._dataReceivedPromises.get(ip);

        //the router executes promise.resolve/reject which then triggers the promise-handler defined in
        //the method _waitForResponse
        await this._networkCommandRouter.routeCommand(ip, convertedData, promise);
    }
}