export class ConvertNetworkData {

    static VERSION:string = "0.1";

    static DATA_INDICATOR_TEXT: number = 0;
    static DATA_INDICATOR_BINARY_DATA: number = 1;
    static INTERPRETATION_ERROR:string = "error, data could not be interpreted!";

    constructor() {}

    static encodeCommand(...parts: (string | Uint8Array)[]): Uint8Array {
        const encoder: TextEncoder = new TextEncoder();
        const numParts: number = parts.length;
        const headerLength: number = 1 + 5 * numParts; // 5 bytes per part (dataType + offset) + one byte for saving how many parts there are
        const buffers: Uint8Array[] = [];
        const header: DataView = new DataView(new ArrayBuffer(headerLength));
        let offset: number;
        let partTypes: number[] = [];

        // Prepare the parts and read if the type is string or binary data
        //if the data is a string, convert it to binary data
        parts.forEach(part => {
            if (typeof part === 'string') {
                buffers.push(encoder.encode(part));
                partTypes.push(ConvertNetworkData.DATA_INDICATOR_TEXT);
            } else if (part instanceof ArrayBuffer || part instanceof Uint8Array) {
                buffers.push(new Uint8Array(part));
                partTypes.push(ConvertNetworkData.DATA_INDICATOR_BINARY_DATA);
            } else
                console.log("ConvertNetworkData: part is of a not known data-format! " + part);
        });

        // Create the header
        header.setUint8(0, numParts); // Store the number of parts at in the first byte of the header
        offset = headerLength;
        //loop through all parts and save the offset (the first byte where they start) in the header
        parts.forEach((part, index) => {
            header.setUint8(1 + index * 5, partTypes[index]);
            header.setUint32(2 + index * 5, offset, true);
            offset += buffers[index].length;
        });

        // Concatenate header and parts
        const totalLength: number = headerLength + buffers.reduce((sum, buffer) => sum + buffer.length, 0);
        const result: Uint8Array = new Uint8Array(totalLength);

        // Copy header
        result.set(new Uint8Array(header.buffer));

        // Copy parts
        offset = headerLength;
        buffers.forEach(buffer => {
            result.set(buffer, offset);
            offset += buffer.length;
        });

        return result;
    }

    /**
     * decodes the passed data into an array of strings and Uint8Arrays.
     *
     * Returns INTERPRETATION_ERROR as  the first element of the array if the data is not valid
     *
     * @param {Uint8Array} data
     * @returns {(string | Uint8Array)[]}
     */
    static decodeCommand(data: Uint8Array): (string | Uint8Array)[] {
        const parts: (string | Uint8Array)[] = [];
        const decoder: TextDecoder = new TextDecoder();
        let partTypes: number[] = [];

        // Read the first byte in the header which holds the information how many parts there are
        const headerFirstByte: Uint8Array = new Uint8Array(data, 0, 1);

        if(data.length <= 0)
            return [ConvertNetworkData.INTERPRETATION_ERROR];

        const numParts: number = headerFirstByte.at(0);

        if(numParts <= 0)
            return [ConvertNetworkData.INTERPRETATION_ERROR];

        //read the rest of the header where the offsets to all parts are stored in 4-byte integers
        //the header is like this long:
        //1 byte for the number of parts
        //5 bytes per part (4 for offset + one for data-type)
        //if there are 2 parts: the header is 11 bytes long
        const header: DataView = new DataView(data.buffer, 1, 5 * numParts);

        //read the data-types of the parts
        for (let i: number = 0; i < numParts; i++)
            partTypes.push(header.getUint8(i * 5));

        //read the offsets in the header (the first byte is already ignored before, so it can start at 0 of the header)
        const startOffsets = [];
        for (let i: number = 0; i < numParts; i++)
            startOffsets.push(header.getUint32(i * 5 + 1, true));

        for (let i: number = 0; i < numParts; i++) {
            const start = startOffsets[i];
            const end = startOffsets[i + 1];
            const part: Uint8Array = data.slice(start, end);

            // console.log("CHECK PART: ", i, " from parts: ", numParts, " part-data: ", part.buffer);

            if(part.length <= 0)
                return [ConvertNetworkData.INTERPRETATION_ERROR];

            if (partTypes[i] === ConvertNetworkData.DATA_INDICATOR_TEXT) {
                // console.log("FOUND STRING DATA IN PART: ", i, decoder.decode(part))
                parts.push(decoder.decode(part));
            } else if (partTypes[i] === ConvertNetworkData.DATA_INDICATOR_BINARY_DATA) {
                // console.log("FOUND BINARY DATA IN PART: ", i)
                parts.push(part);
            }
        }

        return parts;
    }
}