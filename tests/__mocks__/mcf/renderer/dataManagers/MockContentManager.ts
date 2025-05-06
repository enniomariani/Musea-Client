import {ContentManager} from "../../../../../src/js/mcf/renderer/dataManagers/ContentManager";

export class MockContentManager extends ContentManager{

    createContent: jest.Mock;
    getContent: jest.Mock;
    changeName: jest.Mock;
    changeFolder: jest.Mock;
    deleteContent: jest.Mock;

    getDuration: jest.Mock;

    changeLightIntensity: jest.Mock;


    constructor() {
        super();
        this.createContent = jest.fn();
        this.getContent = jest.fn();
        this.changeName = jest.fn();
        this.changeFolder = jest.fn();
        this.deleteContent = jest.fn();
        this.getDuration = jest.fn();

        this.changeLightIntensity = jest.fn();
    }
}