import {MediaAppDataService} from "@app/mcf/renderer/services/MediaAppDataService";
import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockMediaAppDataService extends MediaAppDataService{
    createMediaApp: jest.Mock;
    getAllMediaApps: jest.Mock;
    getName: jest.Mock;
    changeName: jest.Mock;
    getIp: jest.Mock;
    changeIp: jest.Mock;

    constructor() {
        super(mockMediaStationRepo);
        this.createMediaApp = jest.fn();
        this.getAllMediaApps = jest.fn();
        this.getName = jest.fn();
        this.changeName = jest.fn();
        this.getIp = jest.fn();
        this.changeIp = jest.fn();
    }
}