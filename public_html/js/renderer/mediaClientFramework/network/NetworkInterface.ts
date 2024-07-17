export interface IOnReceivedData{
    (data:Uint8Array):void
}

export class NetworkInterface extends EventTarget{

    static CONNECTED:string = "connectedToServer";
    static ERROR:string = "connectionError";
    static CLOSED:string = "connectionClosed";

    private _connected:boolean = false;
    private _connection:WebSocket = null;

    private _onError = null;
    private _onOpen = null;
    private _onClosed = null;
    private _onDataReceivedCallBack = null;

    _onConnectionOpenFunc = this._onConnectionOpen.bind(this);
    _onConnectionErrorFunc = this._onConnectionError.bind(this);
    _onConnectionClosedFunc = this._onConnectionClosed.bind(this);
    _onDataReceivedFunc = this._onDataReceived.bind(this);

    constructor() {
        super();
    }

    /**
     * creates a websocket-connection to the passed url and port.
     *
     * Listen for the WebSocketConnection.CONNECTED event or use the onOpen-callback before you send messages to the server
     *
     * the callback-functions are triggered before the events
     *
     * @param {string} url
     * @param {Function} onOpen
     * @param {Function} onError
     * @param {Function} onClosed
     * @param {IOnReceivedData} onDataReceived
     * @returns {boolean}
     */
    connectToServer(url:string, onOpen:Function = null, onError:Function = null, onClosed:Function = null, onDataReceived:IOnReceivedData = null):boolean {

        //return false if the Websocket exists and is connecting (state 0), opening (state 1) or closing (state 2)
        if (this._connection !== null && this._connection.readyState !== 3) {
            console.log("WebSocketConnection: connection already exists and is not closed!");
            return false;
        }

        this._onOpen = onOpen;
        this._onError = onError;
        this._onClosed = onClosed;
        this._onDataReceivedCallBack = onDataReceived;

        this._connection = new WebSocket(url);

        this._connection.addEventListener("error", this._onConnectionErrorFunc);
        this._connection.addEventListener("open", this._onConnectionOpenFunc);
        this._connection.addEventListener("close", this._onConnectionClosedFunc);
        this._connection.addEventListener("message", this._onDataReceivedFunc);

        return true;
    }

    private _onConnectionOpen():void {
        console.log("WebSocketConnection: WebSocket open to: ", this._connection.url);
        this._connected = true;

        if(this._onOpen)
            this._onOpen();

        this.dispatchEvent(new Event(NetworkInterface.CONNECTED));
    }

    private _onConnectionClosed():void {
        console.log("WebSocketConnection: WebSocket CLOSED");
        this._connected = false;

        this._connection.removeEventListener("error", this._onConnectionErrorFunc);
        this._connection.removeEventListener("open", this._onConnectionOpenFunc);
        this._connection.removeEventListener("close", this._onConnectionClosedFunc);

        if(this._onClosed)
            this._onClosed();

        this.dispatchEvent(new Event(NetworkInterface.CLOSED));
    }

    private _onConnectionError():void {
        console.log("WebSocketConnection: WebSocket error");
        this._connected = false;

        if(this._onError)
            this._onError();

        this.dispatchEvent(new Event(NetworkInterface.ERROR));
    }

    private _onDataReceived(e):void {
        console.log("WebSocketConnection: Data received: ", typeof e.data, e.data);

        let dataAsArray:Uint8Array;

        //if the received data is a string, convert it to a Uint8Array (I always send data as Uint8Array, however in the test-
        //cases the data is sent as string (because the server.send-function used in the tests sends always strings)
        if(typeof e.data === "string")
            dataAsArray = this._stringToUint8Array(e.data);
        else
            dataAsArray = e.data;

        if(this._onDataReceivedCallBack)
            this._onDataReceivedCallBack(dataAsArray);
    }

    /**
     * returns true if the connection exists and was ready and false if not
     *
     * @param {Uint8Array} buffer
     * @returns {boolean}
     */
    sendDataToServer(buffer:Uint8Array):boolean {
        if (this._connection === null || this._connection.readyState !== 1) {
            console.error("WebSocketConnection: sending of string not possible, because connection not ready");
            return false;
        } else {
            this._connection.send(buffer);
            return true;
        }
    }

    closeConnection():void{
        this._connection.close();
    }

    private _stringToUint8Array(inputString:string):Uint8Array {
        const numberStrings:string[] = inputString.split(',');
        const numbers:number[] = numberStrings.map(str => parseInt(str, 10));
        const uint8Array:Uint8Array = new Uint8Array(numbers);
        return uint8Array;
    }

    get connected(): boolean {
        return this._connected;
    }
}