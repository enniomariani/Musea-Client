import {NetworkInterface} from "./NetworkInterface";

export interface IOnReceivedConnectionData{
    (ip:string, data:Uint8Array):void
}

export interface IOnClosedConnection{
    (ip:string):void
}

export  class NetworkConnectionHandler{

    private _connections: Map<string, NetworkInterface>;
    private _backenNetworkService:IBackendNetworkService;

    constructor( backenNetworkService:IBackendNetworkService = window.backendNetworkService) {
        this._connections = new Map();
        this._backenNetworkService = backenNetworkService;
    }

    /**
     * Creates and stores a new connection.
     *
     * If the connection already exists it prints an error, but does not throw an error
     *
     * If the connection could not be openend, it calls onError()
     *
     * @param {string} ip - Unique identifier for the connection.
     * @param {Function} onOpen - Callback for when the connection opens.
     * @param {Function} onError - Callback for when an error occurs.
     * @param {IOnClosedConnection} onClosed - Callback for when the connection closes.
     * @param {IOnReceivedConnectionData} onDataReceived - Callback for when data is received.
     * @param {NetworkInterface} networkInterface - a new instance for this connection
     * @returns {boolean} - Returns true if the connection is successfully created, otherwise false.
     */
    createConnection(ip: string, onOpen: Function, onError: Function, onClosed: IOnClosedConnection | null = null,  onDataReceived: IOnReceivedConnectionData | null = null, networkInterface:NetworkInterface = new NetworkInterface()): void {
        const url:string = "ws://" + ip + ":5000";

        if (this._connections.has(ip)) {
            console.error(`Connection to ip ${ip} already exists.`);
            return;
        }

        networkInterface.connectToServer(url, ()=>{
                this._connections.set(ip, networkInterface);
                onOpen();
            }, onError,
            ()=>{
                console.log("Connection-Handler: CLOSE: ", ip);
                this._connections.delete(ip);
                if(onClosed)
                    onClosed(ip);
            },
            (data:Uint8Array)=>{
                if(onDataReceived)
                    onDataReceived(ip, data);
            });
    }

    hasConnection(ip:string):boolean{
        return this._connections.has(ip);
    }

    /**
     * Sends data to a specific connection.
     *
     * @param {string} ip - IP-address of the connection
     * @param {Uint8Array} data - The data to send.
     * @param {Function} onSendChunk - the function that is called on each chunk sent
     * @returns {boolean} - Returns true if the data is successfully sent, otherwise false.
     */
    async sendData(ip: string, data: Uint8Array, onSendChunk:Function | null = null): Promise<boolean> {
        const connection:NetworkInterface | undefined = this._connections.get(ip);

        if (!connection) {
            console.error(`No connection found with ip ${ip}.`);
            return false;
        }

        return await connection.sendDataToServer(data, onSendChunk);
    }

    /**
     * Closes a specific connection.
     *
     * @param {string} ip - Unique IP for the connection.
     */
    closeConnection(ip: string): void {
        const connection:NetworkInterface | undefined = this._connections.get(ip);
        if (!connection) {
            console.error(`No connection found with ip ${ip}.`);
            return;
        }

        connection.closeConnection();
        this._connections.delete(ip);
    }

    async ping(ip:string):Promise<boolean>{
        return this._backenNetworkService.ping(ip);
    }
}
