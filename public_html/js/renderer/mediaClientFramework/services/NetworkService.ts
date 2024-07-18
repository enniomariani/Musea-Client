import {NetworkConnectionHandler} from "../network/NetworkConnectionHandler";
import {ConvertNetworkData} from "../network/ConvertNetworkData";


export class NetworkService {

    private _networkConnectionHandler: NetworkConnectionHandler;
    private _dataReceivedPromises: Map<string, { resolve: (value:boolean) => void, reject: (error: any) => void }>;

    constructor(networkConnectionHandler: NetworkConnectionHandler = new NetworkConnectionHandler()) {
        this._networkConnectionHandler = networkConnectionHandler;
        this._dataReceivedPromises = new Map();
    }

    async openConnection(ip: string): Promise<boolean> {
        console.log("NetworkService: create connection: ", ip);

        return new Promise((resolve, reject) => {
            this._networkConnectionHandler.createConnection(
                ip,
                () => {
                    console.log("NetworkService: CONNECTION ESTABLISHED TO: ", ip);
                    resolve(true);
                },
                (error) => {
                    reject(error);
                },
                this._onConnectionClosed.bind(this),
                this._onDataReceived.bind(this)
            );
        });
    }

    /**
     * sends a "ping"(ICMP) signal to the ip and waits the amount of timeout in MS
     * until it returns a "false" if it did not receive a response
     *
     * @param {string} ip
     * @param {number} timeout  in MS
     * @returns {Promise<boolean>}
     */
    async checkIfPCisReachable(ip: string, timeout: number = 3000): Promise<boolean> {
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
    async checkIfMediaAppIsReachable(ip:string, timeout:number = 3000):Promise<boolean>{
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this._dataReceivedPromises.delete(ip);
                resolve(false);
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

            this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("network", "ping"));
        });
    }

    private _onConnectionClosed(ip:string): void {
        console.info('Connection closed: ', ip);
    }

    private _onDataReceived(ip:string, data:Uint8Array): void {
        let convertedData:(string|Uint8Array)[] = ConvertNetworkData.decodeCommand(data);
        const promise = this._dataReceivedPromises.get(ip);
        console.info('network service: Data received:', ip, data, convertedData);

        if(convertedData[0] !== ConvertNetworkData.INTERPRETATION_ERROR){
            if(convertedData.length < 2)
                return;
            if(convertedData[0] === "network" && convertedData[1] === "ping")
                this._networkConnectionHandler.sendData(ip, ConvertNetworkData.encodeCommand("network", "pong"));
            else if(convertedData[0] === "network" && convertedData[1] === "pong"){
                if (promise) {
                    promise.resolve(true); // Resolve the promise with the received data
                    this._dataReceivedPromises.delete(ip);
                }
            }
        }

        if (promise) {
            promise.resolve(false); // Resolve the promise with the received data
            this._dataReceivedPromises.delete(ip);
        }
    }
}