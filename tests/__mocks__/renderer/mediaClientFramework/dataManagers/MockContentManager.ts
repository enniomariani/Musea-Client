import {ContentManager} from "../../../../../public_html/js/renderer/mediaClientFramework/dataManagers/ContentManager";

export class MockContentManager extends ContentManager{

    createContent: jest.Mock;
    getContent: jest.Mock;
    changeName: jest.Mock;
    deleteContent: jest.Mock;
    getDuration: jest.Mock;


    constructor() {
        super();
        this.createContent = jest.fn();
        this.getContent = jest.fn();
        this.changeName = jest.fn();
        this.deleteContent = jest.fn();
        this.getDuration = jest.fn();
    }
}