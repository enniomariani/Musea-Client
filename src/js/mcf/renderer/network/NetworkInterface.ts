export interface IOnReceivedData {
    (data: Uint8Array): void
}

export class NetworkInterface extends EventTarget {

    static CONNECTED: string = "connectedToServer";
    static ERROR: string = "connectionError";
    static CLOSED: string = "connectionClosed";

    private _connected: boolean = false;
    private _connection: WebSocket = null;

    private _onError = null;
    private _onOpen = null;
    private _onClosed = null;
    private _onDataReceivedCallBack = null;

    private _connectionTimeoutTimer:number;

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
     * calls onError if the connection could not be opened
     *
     * @param {string} url
     * @param {Function} onOpen
     * @param {Function} onError
     * @param {Function} onClosed
     * @param {IOnReceivedData} onDataReceived
     * @returns {}
     */
    connectToServer(url: string, onOpen: Function = null, onError: Function = null, onClosed: Function = null, onDataReceived: IOnReceivedData = null): void {

        //return false if the Websocket exists and is connecting (state 0), opening (state 1) or closing (state 2)
        if (this._connection !== null && this._connection.readyState !== 3) {
            console.log("WebSocketConnection: connection already exists and is not closed!");
            return;
        }

        this._onOpen = onOpen;
        this._onError = onError;
        this._onClosed = onClosed;
        this._onDataReceivedCallBack = onDataReceived;

        try {
            this._connection = new WebSocket(url);

            // @ts-ignore
            this._connectionTimeoutTimer = setTimeout(() => {
                console.log("timeout reached!")
                this._connection.close(); // Close WebSocket connection if timeout happens
            }, 3000);

        } catch (error) {
            console.error("NetworkInterface Error: ", error);
            if (onError)
                onError();
            return;
        }

        this._connection.binaryType = "arraybuffer";

        this._connection.addEventListener("error", this._onConnectionErrorFunc);
        this._connection.addEventListener("open", this._onConnectionOpenFunc);
        this._connection.addEventListener("close", this._onConnectionClosedFunc);
        this._connection.addEventListener("message", this._onDataReceivedFunc);
    }

    private _onConnectionOpen(): void {
        console.log("WebSocketConnection: WebSocket open to: ", this._connection.url);
        this._connected = true;

        clearTimeout(this._connectionTimeoutTimer);

        if (this._onOpen)
            this._onOpen();

        this.dispatchEvent(new Event(NetworkInterface.CONNECTED));
    }

    private _onConnectionClosed(): void {
        console.log("WebSocketConnection: WebSocket CLOSED");
        this._connected = false;

        this._connection.removeEventListener("error", this._onConnectionErrorFunc);
        this._connection.removeEventListener("open", this._onConnectionOpenFunc);
        this._connection.removeEventListener("close", this._onConnectionClosedFunc);

        if (this._onClosed)
            this._onClosed();

        this.dispatchEvent(new Event(NetworkInterface.CLOSED));
    }

    private _onConnectionError(): void {
        console.log("WebSocketConnection: WebSocket error");
        this._connected = false;

        if (this._onError)
            this._onError();

        this.dispatchEvent(new Event(NetworkInterface.ERROR));
    }

    private _onDataReceived(e): void {
        console.log("WebSocketConnection: Data received: ", e.data);

        let dataAsArray: Uint8Array;

        //if the received data is a string, convert it to a Uint8Array (I always send data as Uint8Array, however in the test-
        //cases the data is sent as string (because the server.send-function used in the tests sends always strings)
        if (typeof e.data === "string")
            dataAsArray = this._stringToUint8Array(e.data);
        else if (e.data instanceof ArrayBuffer)
            dataAsArray = new Uint8Array(e.data);
        else
            throw new Error("Websocket received data which is neither a string nor a Uint8Array!")

        if (this._onDataReceivedCallBack)
            this._onDataReceivedCallBack(dataAsArray);
    }

    /**
     * returns true if the connection exists and was ready and false if not
     *
     * @param {Uint8Array} buffer
     * @param {number} chunkSizeInBytes    // default 32MB chunks (was the fastest in tests compared with 16MB, 8 MB and 64MB))
     * @returns {boolean}
     */
    async sendDataToServer(buffer: Uint8Array, chunkSizeInBytes: number = 32768 * 1024):Promise<boolean>{
        let dataViewChunks: DataView = new DataView(new ArrayBuffer(2));
        let chunksInfo:Uint8Array = new Uint8Array(2);
        let arrayToSend: Uint8Array;
        let offset:number = 0;
        let counter:number = 0;

        if (this._connection === null || this._connection.readyState !== 1) {
            console.error("WebSocketConnection: sending of string not possible, because connection not ready");
            return false;
        } else {
            console.log("network interface: send data: ", buffer.length)
            console.log("network interface: amount of chunks: ", Math.ceil((buffer.length + 2) / chunkSizeInBytes))

            //buffer.length + 2 because the 2 bytes with the information about the amount of chunks are added after the calculation
            //on how many chunks are sent
            dataViewChunks.setUint16(0, Math.ceil((buffer.length + 2) / chunkSizeInBytes), true);
            chunksInfo.set(new Uint8Array(dataViewChunks.buffer));

            arrayToSend = new Uint8Array(dataViewChunks.buffer.byteLength + buffer.length);
            arrayToSend.set(chunksInfo);
            arrayToSend.set(buffer, chunksInfo.length);

            while (offset < arrayToSend.length) {
                counter++;
                const chunk:Uint8Array = arrayToSend.slice(offset, offset + chunkSizeInBytes);

                await this._sendChunk(chunk)
                offset += chunkSizeInBytes;
            }

            return true;
        }
    }

    private async _sendChunk(chunk:Uint8Array):Promise<void> {
        return new Promise((resolve) => {
            this._connection.send(chunk)
            setTimeout(resolve, 0); // Set the timeout to 0 ms (or adjust as needed)
        });
    }

    closeConnection(): void {
        this._connection.close();
    }

    private _stringToUint8Array(inputString: string): Uint8Array {
        const numberStrings: string[] = inputString.split(',');
        const numbers: number[] = numberStrings.map(str => parseInt(str, 10));
        const uint8Array: Uint8Array = new Uint8Array(numbers);
        return uint8Array;
    }

    get connected(): boolean {
        return this._connected;
    }
}