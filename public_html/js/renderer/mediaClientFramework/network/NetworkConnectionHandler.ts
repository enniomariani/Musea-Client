import {IOnReceivedData, NetworkInterface} from "./NetworkInterface";

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
     * @param {Function} onClosed - Callback for when the connection closes.
     * @param {IOnReceivedData} onDataReceived - Callback for when data is received.
     * @returns {boolean} - Returns true if the connection is successfully created, otherwise false.
     */
    createConnection(ip: string, onOpen: Function = null, onError: Function = null, onClosed: Function = null, onDataReceived: IOnReceivedData = null): boolean {
        const url:string = "ws://" + ip + ":5000";

        if (this._connections.has(ip)) {
            console.error(`Connection to ip ${ip} already exists.`);
            return false;
        }

        const networkInterface:NetworkInterface = this._networkInterfaceFactory;
        const success:boolean = networkInterface.connectToServer(url, onOpen, onError, onClosed, onDataReceived);

        if (success)
            this._connections.set(ip, networkInterface);

        return success;
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
