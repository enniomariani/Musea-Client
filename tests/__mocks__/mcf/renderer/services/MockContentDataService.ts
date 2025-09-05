import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {ContentDataService} from "src/mcf/renderer/services/ContentDataService";
import {MockMediaService} from "./MockMediaService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockMediaService:MockMediaService = new MockMediaService();


export class MockContentDataService extends ContentDataService {
    createContent: jest.Mock;
    changeName: jest.Mock;
    deleteContent: jest.Mock;
    changeFolder: jest.Mock;

    getLightIntensity: jest.Mock;
    changeLightIntensity: jest.Mock;

    getMaxDuration: jest.Mock;

    getFolderId: jest.Mock;

    constructor() {
        super(mockMediaStationRepo, mockMediaService);
        this.createContent = jest.fn();
        this.changeName = jest.fn();
        this.deleteContent = jest.fn();
        this.changeFolder = jest.fn();

        this.getLightIntensity = jest.fn();
        this.changeLightIntensity = jest.fn();

        this.getMaxDuration = jest.fn();
        this.getFolderId = jest.fn();
    }
}