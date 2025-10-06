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
     * opens a connection to the passed ip
     *
     * resolves the promise with false if the connection could not be opened
     *
     * should not throw an error
     *
     * @param {string} ip
     * @returns {Promise<boolean>}
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
                        console.log("CONNECTION ESTABLISHED TO: ", ip);
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
        console.log("ping received from: ", ip);
        await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("network", "pong"));
    }

    public closeConnection(ip: string): void {
        this._networkConnectionHandler.closeConnection(ip);
    }

    /**
     * sends a "ping"(ICMP) signal to the ip and returns if it was succesful (timeout defined in backend)
     *
     * @param {string} ip
     * @returns {Promise<boolean>}
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
     * sends a "ping" signal to the ip (if it is connected) via websocket and waits the amount of timeout in MS
     * until it returns a "false" if it did not receive a pong-signal until then
     *
     * @param {string} ip
     * @param {number} timeout  in MS
     * @returns {Promise<boolean>}
     */
    async isMediaAppOnline(ip: string, timeout: number = 3000): Promise<boolean> {
        return await this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("network", "ping"), timeout, false);
    }

    async sendRegistrationAdminApp(ip: string, timeout: number = 3000): Promise<string> {
        return await this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("network", "register", "admin"), timeout, "no");
    }

    async sendRegistrationUserApp(ip: string, timeout: number = 3000): Promise<string> {
        return await this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("network", "register", "user"), timeout, "no");
    }

    async sendCheckRegistration(ip: string, timeout: number = 3000): Promise<boolean> {
        return await this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("network", "isRegistrationPossible"), timeout, false);
    }

    async unregisterAndCloseConnection(ip: string, timeout: number = 3000): Promise<void> {
        return await this._createConnectionClosedPromise(ip, ConvertNetworkData.encodeCommand("network", "disconnect"), timeout);
    }

    /**
     * sends a command to the ip which asks for the content file saved on it. The media-app should
     * return an empty JSON if there is no content-file or the JSON of the content-file
     *
     * Returns null if there was no response from the controller-app during the timeout passed
     *
     * @param {string} ip
     * @param {number} timeout  in MS
     * @returns {Promise<string|null>}
     */
    async getContentFileFrom(ip: string, timeout: number = 3000): Promise<string | null> {
        return this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("contents", "get"), timeout, null);
    }

    /**
     * sends a command to the ip which contains the passed media-file and type. If the transfer was succesful, the promise
     * returns the number of the newly created media from the media-app if not it returns null
     *
     * @param {string} ip
     * @param {string} mediaType
     * @param {Uint8Array} mediaFile
     * @param {number} timeout
     * @returns {Promise<string>}
     */
    async sendMediaFileToIp(ip: string, mediaType: string, mediaFile: Uint8Array, timeout: number = 3000, onSendChunk: Function): Promise<number> {
        return this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("media", "put", mediaType, mediaFile), timeout, null, onSendChunk);
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
        console.info('Connection closed: ', ip, this._onConnectionClosedPromises, this._dataReceivedPromises.has(ip));
        const promise = this._onConnectionClosedPromises.get(ip);

        if (promise) {
            console.log("CONNECTION CLOSED WITH PROMISE: ", promise)
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
                console.log("Networkservice: close connection after timeout")
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

            console.log("Networkservice: send command: ", command)
            await this._networkConnectionHandler.sendData(ip, command, null);
        });
    }

    private async _createNetworkPromise(ip: string, command: Uint8Array, timeout: number, rejectValue: any, onSendChunk: Function | null = null): Promise<any> {

        return new Promise(async (resolve, reject) => {

            console.log("sending data to: ", ip);
            let answer: boolean = await this._networkConnectionHandler.sendData(ip, command, onSendChunk);

            //if the connection was closed during the sending-process, resolve with reject-value
            if (!answer) {
                console.error("Connection closed during sending-process: reject-value: ", rejectValue)
                resolve(rejectValue);
                return;
            }

            if (onSendChunk !== null)
                onSendChunk("Daten gesendet, warte auf Antwort...");

            const timer = setTimeout(() => {
                console.log("timeout reached!", rejectValue);
                this._dataReceivedPromises.delete(ip);
                resolve(rejectValue); // Resolve with rejectValue on timeout
            }, timeout);

            this._dataReceivedPromises.set(ip, {
                resolve: (value) => {
                    console.log("resolve network-send-promise: ", value, timer)
                    if (timer) clearTimeout(timer);

                    this._dataReceivedPromises.delete(ip);
                    resolve(value);
                },
                reject: (error) => {
                    if (timer) clearTimeout(timer);

                    this._dataReceivedPromises.delete(ip);
                    reject(error);
                }
            });
        });
    }

    private async _onDataReceived(ip: string, data: Uint8Array): Promise<void> {
        const convertedData = ConvertNetworkData.decodeCommand(data);
        const promise = this._dataReceivedPromises.get(ip);
        await this._networkCommandRouter.routeCommand(ip, convertedData, promise);
    }
}