import {MockMediaStationRepository} from "../dataStructure/MockMediaStationRepository";
import {TagDataService} from "../../../../../src/mcf/renderer/services/TagDataService";

const mockMediaStationRepo:MockMediaStationRepository = new MockMediaStationRepository();

export class MockTagService extends TagDataService {
    createTag: jest.Mock;
    deleteTag: jest.Mock;
    getAllTags: jest.Mock;

    addTagToContent: jest.Mock;
    removeTagFromContent: jest.Mock;
    getTagIdsForContent: jest.Mock;

    findContentsByTag: jest.Mock;


    constructor() {
        super(mockMediaStationRepo);

        this.createTag = jest.fn();
        this.deleteTag = jest.fn();
        this.getAllTags = jest.fn();

        this.addTagToContent = jest.fn();
        this.removeTagFromContent = jest.fn();
        this.getTagIdsForContent = jest.fn();

        this.findContentsByTag = jest.fn();
    }
}