import {NetworkConnectionHandler} from "../network/NetworkConnectionHandler";
import {ConvertNetworkData} from "../network/ConvertNetworkData";


export class NetworkService {

    private _networkConnectionHandler: NetworkConnectionHandler;
    private _dataReceivedPromises: Map<string, { resolve: (value: any) => void, reject: (error: any) => void }>;
    private _onConnectionClosedPromises: Map<string, { resolve: () => void, reject: () => void }>;

    private _onBlockReceivedCallback: Function;
    private _onUnBlockReceivedCallback: Function;

    constructor(networkConnectionHandler: NetworkConnectionHandler = new NetworkConnectionHandler()) {
        this._networkConnectionHandler = networkConnectionHandler;
        this._dataReceivedPromises = new Map();
        this._onConnectionClosedPromises = new Map();
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

    public closeConnection(ip: string): void {
        console.log("Networkservice: close connection: ", ip)
        this._networkConnectionHandler.closeConnection(ip);
    }

    /**
     * sends a "ping"(ICMP) signal to the ip and waits the amount of timeout in MS
     * until it returns a "false" if it did not receive a response
     *
     * @param {string} ip
     * @param {number} timeout  in MS
     * @returns {Promise<boolean>}
     */
    async pcRespondsToPing(ip: string, timeout: number = 3000): Promise<boolean> {
        console.log("net-service: ping icmp")
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                resolve(false);
            }, timeout);

            this._networkConnectionHandler.ping(ip)
                .then(result => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    }

    onBlockReceived(callback: Function): void {
        this._onBlockReceivedCallback = callback;
    }

    onUnBlockReceived(callback: Function): void {
        this._onUnBlockReceivedCallback = callback;
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
        console.log("get contents file from: ", ip)
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
        console.log("Send media-file to ip: ", ip, mediaType)
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
            this._dataReceivedPromises.get(ip).resolve(null);
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

    private async _createNetworkPromise(ip: string, command: Uint8Array, timeout: number, rejectValue: any, onSendChunk: Function = null): Promise<any> {

        return new Promise(async (resolve, reject) => {

            console.log("sending data to: ", ip);
            let answer:boolean = await this._networkConnectionHandler.sendData(ip, command, onSendChunk);

            command = null;

            //if the connection was closed during the sending-process, resolve with reject-value
            if (!answer) {
                console.error("Connection closed during sending-process: reject-value: ", rejectValue)
                resolve(rejectValue);
                return;
            }

            console.log("data sent!");

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
        let convertedData: (string | Uint8Array)[] = ConvertNetworkData.decodeCommand(data);
        const promise = this._dataReceivedPromises.get(ip);
        console.info('network service: Data received:', ip, data, convertedData);

        if (convertedData[0] !== ConvertNetworkData.INTERPRETATION_ERROR) {
            if (convertedData.length < 2)
                return;
            if (convertedData[0] === "network" && convertedData[1] === "ping")
                await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("network", "pong"));
            else if (convertedData[0] === "network" && convertedData[1] === "pong") {
                if (promise)
                    promise.resolve(true);
            } else if (convertedData[0] === "network" && convertedData[1] === "registration") {
                if (promise) {
                    if (convertedData[2] === "accepted")
                        promise.resolve("yes");
                    else if (convertedData[2] === "accepted_block")
                        promise.resolve("yes_blocked");
                    else
                        promise.resolve("no");
                }
            } else if (convertedData[0] === "network" && convertedData[1] === "isRegistrationPossible" && convertedData[2] === "yes") {
                if (promise)
                    promise.resolve(true);
            } else if (convertedData[0] === "network" && convertedData[1] === "isRegistrationPossible" && convertedData[2] === "no") {
                if (promise)
                    promise.resolve(false);
            } else if (convertedData[0] === "contents" && convertedData[1] === "put" && convertedData[2] !== null) {
                console.log("contents received: ", convertedData[2])
                if (promise)
                    promise.resolve(convertedData[2]);
            } else if (convertedData[0] === "media" && convertedData[1] === "put" && convertedData[2] !== null && typeof convertedData[2] === "string") {
                console.log("media received: ", convertedData[2], promise)

                if (promise)
                    promise.resolve(parseInt(convertedData[2]));
            } else if (convertedData[0] === "system" && convertedData[1] === "block") {
                if (this._onBlockReceivedCallback)
                    this._onBlockReceivedCallback();
            } else if (convertedData[0] === "system" && convertedData[1] === "unblock") {
                if (this._onUnBlockReceivedCallback)
                    this._onUnBlockReceivedCallback();
            } else
                console.error("Non-valid network-command received: ", convertedData);
        }

        //if the client answers with a not-defined command, reject the promise and return null
        if (promise) {
            promise.resolve(null);
            this._dataReceivedPromises.delete(ip);
        }
    }
}