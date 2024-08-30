import {NetworkConnectionHandler} from "../network/NetworkConnectionHandler";
import {ConvertNetworkData} from "../network/ConvertNetworkData";


export class NetworkService {

    private _networkConnectionHandler: NetworkConnectionHandler;
    private _dataReceivedPromises: Map<string, { resolve: (value:any) => void, reject: (error: any) => void }>;
    private _onConnectionClosedPromises: Map<string, { resolve: () => void, reject: () => void }>;

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
            if(this._networkConnectionHandler.hasConnection(ip)){
                console.info("Connection is already open: ", ip);
                resolve(true);
            }
            else{
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

    public closeConnection(ip:string):void{
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

    /**
     * sends a "ping" signal to the ip (if it is connected) via websocket and waits the amount of timeout in MS
     * until it returns a "false" if it did not receive a pong-signal until then
     *
     * @param {string} ip
     * @param {number} timeout  in MS
     * @returns {Promise<boolean>}
     */
    async isMediaAppOnline(ip:string, timeout:number = 3000):Promise<boolean>{
        return await this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("network", "ping"), timeout, false);
    }

    async sendRegistration(ip:string, timeout:number = 3000):Promise<boolean>{
        return await this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("network", "register", "admin"), timeout, false);
    }

    async unregisterAndCloseConnection(ip:string, timeout:number = 3000):Promise<void>{
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
    async getContentFileFrom(ip:string, timeout:number = 3000):Promise<string|null>{
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
    async sendMediaFileToIp(ip:string,mediaType:string, mediaFile:Uint8Array, timeout:number = 90000):Promise<number>{
        return this._createNetworkPromise(ip, ConvertNetworkData.encodeCommand("media", "put", mediaType, mediaFile), timeout, null);
    }

    public async sendContentFileTo(ip:string, contentFileJSON:string):Promise<void>{
        await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("contents", "put", contentFileJSON));
    }

    public async sendMediaControlTo(ip:string, command:string):Promise<void>{
        await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("media", "control", command));
    }

    public async sendDeleteMediaTo(ip:string, id:number):Promise<void>{
        await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("media", "delete", id.toString()));
    }

    private _onConnectionClosed(ip:string): void {
        console.info('Connection closed: ', ip, this._onConnectionClosedPromises);
        const promise = this._onConnectionClosedPromises.get(ip);

        if (promise) {
            console.log("CONNECTION CLOSED WITH PROMISE: ", promise)
            promise.resolve();
            this._onConnectionClosedPromises.delete(ip);
        }
    }

    private async _createConnectionClosedPromise(ip:string, command:Uint8Array, timeout:number):Promise<void>{
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
            await this._networkConnectionHandler.sendData(ip, command);
        });
    }

    private async _createNetworkPromise(ip:string, command:Uint8Array, timeout:number, rejectValue:any):Promise<any>{
        return new Promise(async (resolve, reject) => {
            const timer = setTimeout(() => {
                this._dataReceivedPromises.delete(ip);
                resolve(rejectValue);
            }, timeout);

            this._dataReceivedPromises.set(ip, {
                resolve: (value) => {
                    clearTimeout(timer);
                    resolve(value);
                },
                reject: (error) => {
                    clearTimeout(timer);
                    reject(error);
                }
            });

            await this._networkConnectionHandler.sendData(ip, command);
        });
    }

    private async _onDataReceived(ip:string, data:Uint8Array): Promise<void> {
        let convertedData:(string|Uint8Array)[] = ConvertNetworkData.decodeCommand(data);
        const promise = this._dataReceivedPromises.get(ip);
        console.info('network service: Data received:', ip, data, convertedData);

        if(convertedData[0] !== ConvertNetworkData.INTERPRETATION_ERROR){
            if(convertedData.length < 2)
                return;
            if(convertedData[0] === "network" && convertedData[1] === "ping")
                await this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("network", "pong"));
            else if(convertedData[0] === "network" && convertedData[1] === "pong"){
                if (promise) {
                    promise.resolve(true);
                    this._dataReceivedPromises.delete(ip);
                }
            }else if(convertedData[0] === "network" && convertedData[1] === "registration"){
                if (promise) {
                    promise.resolve(convertedData[2] === "accepted");
                    this._dataReceivedPromises.delete(ip);
                }
            } else if(convertedData[0] === "contents" && convertedData[1] === "put" && convertedData[2] !== null){
                if (promise) {
                    promise.resolve(convertedData[2]);
                    this._dataReceivedPromises.delete(ip);
                }
            }else if(convertedData[0] === "media" && convertedData[1] === "put" && convertedData[2] !== null && typeof convertedData[2] === "string"){
                if (promise) {
                    promise.resolve(parseInt(convertedData[2]));
                    this._dataReceivedPromises.delete(ip);
                }
            }else
                console.error("Non-valid network-command received: ", convertedData);
        }

        //if the client answers with a not-defined command, reject the promise and return null
        if (promise) {
            promise.resolve(null);
            this._dataReceivedPromises.delete(ip);
        }
    }
}