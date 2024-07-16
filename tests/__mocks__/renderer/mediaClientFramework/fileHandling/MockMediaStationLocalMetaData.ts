import {
    MediaStationLocalMetaData
} from "../../../../../public_html/js/renderer/mediaClientFramework/fileHandling/MediaStationLocalMetaData";

export class MockMediaStationLocalMetaData extends MediaStationLocalMetaData{

    load: jest.Mock;
    save: jest.Mock;

    constructor() {
        super();
        this.load = jest.fn();
        this.save = jest.fn();
    }
}