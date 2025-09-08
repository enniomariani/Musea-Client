import {afterEach, beforeEach, describe, it, jest, test} from "@jest/globals";
import {ConvertNetworkData} from "../../../../src/mcf/renderer/network/ConvertNetworkData";

beforeEach(() => {

});

afterEach(() => {
    jest.clearAllMocks();
});

function arrayBufferToHex(buffer: ArrayBuffer): string {
    const byteArray: Uint8Array = new Uint8Array(buffer);
    let str: string = "[";
    let tempStr: string;
    byteArray.forEach((value: number, index: number) => {
        tempStr = value.toString(16);

        str += tempStr.length === 1 ? "0x0" : "0x";
        str += tempStr;

        if (index < byteArray.length - 1)
            str += ",";
    })
    str += "]";
    return str;
}

function asciiCodesOfString(str: string): number[] {
    const codes: number[] = [];
    for (let i:number = 0; i < str.length; i++)
        codes.push(str.charCodeAt(i));

    return codes;
}

const cases = [
    {
        dataParts: ["xxyy"],
        expectedData: new Uint8Array([1, ConvertNetworkData.DATA_INDICATOR_TEXT,6,0,0,0, ...asciiCodesOfString("xxyy")]),
        get description() {
            return `data '${this.dataParts.join(' ')}' should return ${arrayBufferToHex(this.expectedData)}`;
        }
    },
    {
        dataParts: ["network"],
        expectedData: new Uint8Array([1, ConvertNetworkData.DATA_INDICATOR_TEXT,6,0,0,0,...asciiCodesOfString("network")]),
        get description() {
            return `data '${this.dataParts.join(' ')}' should return ${arrayBufferToHex(this.expectedData)}`;
        }
    },
    {
        dataParts: ["network", "ping"],
        expectedData: new Uint8Array([2, ConvertNetworkData.DATA_INDICATOR_TEXT,11,0,0,0, ConvertNetworkData.DATA_INDICATOR_TEXT,18,0,0,0,
            ...asciiCodesOfString("network"),
            ...asciiCodesOfString("ping")]),
        get description() {
            return `data '${this.dataParts.join(' ')}' should return ${arrayBufferToHex(this.expectedData)}`;
        }
    },
    {
        dataParts: ["network", "register"],
        expectedData: new Uint8Array([2, ConvertNetworkData.DATA_INDICATOR_TEXT,11,0,0,0, ConvertNetworkData.DATA_INDICATOR_TEXT,18,0,0,0,
            ...asciiCodesOfString("network"),
            ...asciiCodesOfString("register")]),
        get description() {
            return `data '${this.dataParts.join(' ')}' should return ${arrayBufferToHex(this.expectedData)}`;
        }
    },
    {
        dataParts: ["network", "register", "admin"],
        expectedData: new Uint8Array([3, ConvertNetworkData.DATA_INDICATOR_TEXT,16,0,0,0, ConvertNetworkData.DATA_INDICATOR_TEXT,23,0,0,0,
            ConvertNetworkData.DATA_INDICATOR_TEXT,31,0,0,0,
            ...asciiCodesOfString("network"),
            ...asciiCodesOfString("register"),
            ...asciiCodesOfString("admin")]),
        get description() {
            return `data '${this.dataParts.join(' ')}' should return ${arrayBufferToHex(this.expectedData)}`;
        }
    },
    {
        dataParts: ["network", "register", "user", "usernameX"],
        expectedData: new Uint8Array([4, ConvertNetworkData.DATA_INDICATOR_TEXT,21,0,0,0,
            ConvertNetworkData.DATA_INDICATOR_TEXT,28,0,0,0, ConvertNetworkData.DATA_INDICATOR_TEXT,36,0,0,0,
            ConvertNetworkData.DATA_INDICATOR_TEXT,40,0,0,0,
            ...asciiCodesOfString("network"),
            ...asciiCodesOfString("register"),
            ...asciiCodesOfString("user"),
            ...asciiCodesOfString("usernameX")
        ]),
        get description() {
            return `data '${this.dataParts.join(' ')}' should return ${arrayBufferToHex(this.expectedData)}`;
        }
    },
    {
        dataParts: ["media", "put", new Uint8Array([20, 0, 2, 50, 30, 100])],
        expectedData: new Uint8Array([3, 0,16,0,0,0, 0,21,0,0,0, ConvertNetworkData.DATA_INDICATOR_BINARY_DATA,24,0,0,0,
            ...asciiCodesOfString("media"),
            ...asciiCodesOfString("put"),
            20, 0, 2, 50, 30, 100]),
        get description() {
            return `data '${this.dataParts.join(' ')}' should return ${arrayBufferToHex(this.expectedData)}`;
        }
    },
    {
        dataParts: ["media", "put", new Uint8Array([3, 2, 2, 50])],
        expectedData: new Uint8Array([3, 0,16,0,0,0, 0,21,0,0,0, ConvertNetworkData.DATA_INDICATOR_BINARY_DATA,24,0,0,0,
            ...asciiCodesOfString("media"),
            ...asciiCodesOfString("put"),
            3, 2, 2, 50]),
        get description() {
            return `data '${this.dataParts.join(' ')}' should return ${arrayBufferToHex(this.expectedData)}`;
        }
    },
    {
        dataParts: ["contents", "put", "{}"],
        expectedData: new Uint8Array([3, 0,16,0,0,0, 0,24,0,0,0, ConvertNetworkData.DATA_INDICATOR_TEXT,27,0,0,0,
            ...asciiCodesOfString("contents"),
            ...asciiCodesOfString("put"),
            ...asciiCodesOfString("{}")]),
        get description() {
            return `data '${this.dataParts.join(' ')}' should return ${arrayBufferToHex(this.expectedData)}`;
        }
    },
];

describe('encodeCommand(): ', () => {
    test.each(cases)('$description', ({dataParts, expectedData}) => {
        if(expectedData instanceof Uint8Array) {
            let data: ArrayBuffer = ConvertNetworkData.encodeCommand(...dataParts);

            console.log("--ENCODE COMPARE-- \nRECEVIED: ", new Uint8Array(data), "\n EXPECTED: ", expectedData);

            expect(data).toStrictEqual(expectedData);
        }
    });
});

describe('decodeCommand(): ', () => {

    test.each(cases)('$description', ({dataParts, expectedData}) => {
        let data = ConvertNetworkData.decodeCommand(expectedData);

        console.log("--DECODE COMPARE-- \nRECEVIED: ", data, "\n EXPECTED: ", dataParts);

        expect(data).toStrictEqual(dataParts);
    });

    it("should return an error string if the passed data is empty", ()=>{
        let command:Uint8Array = new Uint8Array([]);
        let convertedCommand = ConvertNetworkData.decodeCommand(command);

        expect(convertedCommand).toStrictEqual([ConvertNetworkData.INTERPRETATION_ERROR]);
    });

    it("should return an error string if the passed data has 0 parts defined in the header (first byte)", ()=>{
        let command:Uint8Array = new Uint8Array([0,1,200,10,30,50]);
        let convertedCommand = ConvertNetworkData.decodeCommand(command);

        expect(convertedCommand).toStrictEqual([ConvertNetworkData.INTERPRETATION_ERROR]);
    });

    it("should return an error string if the passed data has only a header and no parts", ()=>{
        let command:Uint8Array = new Uint8Array([1,1,200,10,30,50]);
        let convertedCommand = ConvertNetworkData.decodeCommand(command);

        expect(convertedCommand).toStrictEqual([ConvertNetworkData.INTERPRETATION_ERROR]);
    });
});