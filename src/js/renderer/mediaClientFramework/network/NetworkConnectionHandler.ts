import {NetworkInterface} from "./NetworkInterface";

export interface IOnReceivedConnectionData{
    (ip:string, data:Uint8Array):void
}

export interface IOnClosedConnection{
    (ip:string):void
}

export  class NetworkConnectionHandler{

    private _connections: Map<string, NetworkInterface>;
    private _networkInterfaceFactory: NetworkInterface;
    private _backenNetworkService:IBackenNetworkService;

    constructor(networkInterfaceFactory = () => new NetworkInterface(), backenNetworkService:IBackenNetworkService = window.backendNetworkService) {
        this._connections = new Map();
        this._networkInterfaceFactory = networkInterfaceFactory();
        this._backenNetworkService = backenNetworkService;
    }

    /**
     * Creates and stores a new connection.
     *
     * @param {string} ip - Unique identifier for the connection.
     * @param {Function} onOpen - Callback for when the connection opens.
     * @param {Function} onError - Callback for when an error occurs.
     * @param {IOnClosedConnection} onClosed - Callback for when the connection closes.
     * @param {IOnReceivedConnectionData} onDataReceived - Callback for when data is received.
     * @returns {boolean} - Returns true if the connection is successfully created, otherwise false.
     */
    createConnection(ip: string, onOpen: Function, onError: Function, onClosed: IOnClosedConnection = null, onDataReceived: IOnReceivedConnectionData = null): void {
        const url:string = "ws://" + ip + ":5000";

        if (this._connections.has(ip)) {
            console.error(`Connection to ip ${ip} already exists.`);
            return;
        }

        const networkInterface:NetworkInterface = this._networkInterfaceFactory;
        networkInterface.connectToServer(url, ()=>{
            console.log("create connection!")
                this._connections.set(ip, networkInterface);
                onOpen();
            }, onError,
            ()=>{
                console.log("Connection-Handler: CLOSE: ", ip);
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
     * @returns {boolean} - Returns true if the data is successfully sent, otherwise false.
     */
    sendData(ip: string, data: Uint8Array): boolean {
        const connection:NetworkInterface = this._connections.get(ip);

        if (!connection) {
            console.error(`No connection found with ip ${ip}.`);
            return false;
        }

        return connection.sendDataToServer(data);
    }

    /**
     * Closes a specific connection.
     *
     * @param {string} ip - Unique IP for the connection.
     */
    closeConnection(ip: string): void {
        const connection:NetworkInterface = this._connections.get(ip);
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
