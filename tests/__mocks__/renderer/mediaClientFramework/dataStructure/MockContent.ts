import {Content} from "../../../../../public_html/js/renderer/mediaClientFramework/dataStructure/Content";


export class MockContent extends Content{

    getMaxDuration: jest.Mock;

    constructor(id) {
        super(id);
        this.getMaxDuration = jest.fn();
    }
}