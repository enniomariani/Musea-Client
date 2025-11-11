import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository.js";
import {ContentDataService} from "renderer/services/ContentDataService.js";
import {MockMediaService} from "./MockMediaService.js";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();
const mockMediaService:MockMediaService = new MockMediaService();


export class MockContentDataService extends ContentDataService {
    createContent: jest.Mock;
    changeName: jest.Mock;
    getName: jest.Mock;
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
        this.getName = jest.fn();
        this.deleteContent = jest.fn();
        this.changeFolder = jest.fn();

        this.getLightIntensity = jest.fn();
        this.changeLightIntensity = jest.fn();

        this.getMaxDuration = jest.fn();
        this.getFolderId = jest.fn();
    }
}