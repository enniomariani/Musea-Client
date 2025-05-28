export class ConvertNetworkData {

    static VERSION:string = "0.2";

    //0.2: - improved memory-usage in both methods

    static DATA_INDICATOR_TEXT: number = 0;
    static DATA_INDICATOR_BINARY_DATA: number = 1;
    static INTERPRETATION_ERROR:string = "error, data could not be interpreted!";

    constructor() {}

    static encodeCommand(...parts: (string | Uint8Array)[]): Uint8Array {
        const encoder: TextEncoder = new TextEncoder();
        const numParts: number = parts.length;
        const headerLength: number = 1 + 5 * numParts; // 5 bytes per part (dataType + offset) + one byte for saving how many parts there are

        let totalLength:number = headerLength;
        const partTypes: number[] = [];

        parts.forEach(part => {
            let length: number;
            if (typeof part === 'string') {
                const encodedPart = encoder.encode(part);
                partTypes.push(ConvertNetworkData.DATA_INDICATOR_TEXT);
                length = encodedPart.length;
            } else if (part instanceof Uint8Array) {
                partTypes.push(ConvertNetworkData.DATA_INDICATOR_BINARY_DATA);
                length = part.length;
            } else {
                console.error("ConvertNetworkData: unknown data format: ", part);
                return; // Skip invalid parts
            }
            totalLength += length;
        });

        // Create the final buffer
        const result:Uint8Array = new Uint8Array(totalLength);
        const header:DataView = new DataView(result.buffer, 0, headerLength);

        // Set the number of parts in the first byte of the header
        header.setUint8(0, numParts);

        let offset:number = headerLength;

        // Second pass: set part offsets in the header and copy data directly into result buffer
        parts.forEach((part, index) => {
            header.setUint8(1 + index * 5, partTypes[index]); // Set part type
            header.setUint32(2 + index * 5, offset, true);    // Set part offset

            if (typeof part === 'string') {
                const encodedPart:Uint8Array = encoder.encode(part);
                result.set(encodedPart, offset); // Directly set the encoded part in result buffer
                offset += encodedPart.length;
            } else if (part instanceof Uint8Array) {
                result.set(part, offset); // Directly copy Uint8Array into result buffer
                offset += part.length;
            }
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
        const decoder = new TextDecoder();

        if (data.length <= 0)
            return [ConvertNetworkData.INTERPRETATION_ERROR];

        const numParts = data[0];  // Read the first byte for the number of parts

        if (numParts <= 0)
            return [ConvertNetworkData.INTERPRETATION_ERROR];

        // Calculate header length (1 byte for numParts, 5 bytes per part)
        const headerLength = 1 + numParts * 5;

        if (data.length < headerLength)
            return [ConvertNetworkData.INTERPRETATION_ERROR]; // Handle invalid data

        const header = new DataView(data.buffer, data.byteOffset + 1, numParts * 5); // Extract the header view

        // Process each part
        for (let i = 0; i < numParts; i++) {
            const partType = header.getUint8(i * 5); // Get the type of the part
            const startOffset = header.getUint32(i * 5 + 1, true); // Get the offset

            const endOffset = (i + 1 < numParts)
                ? header.getUint32((i + 1) * 5 + 1, true)  // Get next offset if not the last part
                : data.length;  // If it's the last part, use the full data length

            const partData = data.subarray(startOffset, endOffset);  // Use subarray to avoid memory copy

            if (partData.length <= 0) {
                return [ConvertNetworkData.INTERPRETATION_ERROR];  // Handle invalid part
            }

            // Handle text or binary data based on the part type
            if (partType === ConvertNetworkData.DATA_INDICATOR_TEXT) {
                parts.push(decoder.decode(partData));  // Decode text directly
            } else if (partType === ConvertNetworkData.DATA_INDICATOR_BINARY_DATA) {
                parts.push(partData);  // Push the binary data directly (no extra copy)
            } else {
                return [ConvertNetworkData.INTERPRETATION_ERROR];  // Handle unknown data type
            }
        }

        return parts;
    }
}