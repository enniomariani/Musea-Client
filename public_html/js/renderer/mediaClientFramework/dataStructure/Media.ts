import {MediaApp} from "./MediaApp";


export interface IMedia{
    idOnMediaApp:number
    mediaApp:MediaApp
}

export class BaseMedia implements IMedia{

    private _idOnMediaApp:number;
    private _mediaApp:MediaApp;

    constructor() {}

    get idOnMediaApp(): number {
        return this._idOnMediaApp;
    }

    set idOnMediaApp(value: number) {
        this._idOnMediaApp = value;
    }

    get mediaApp(): MediaApp {
        return this._mediaApp;
    }

    set mediaApp(value: MediaApp) {
        this._mediaApp = value;
    }
}

export class Image extends BaseMedia implements IMedia{
    constructor() {
        super();
    }
}

export class Video extends BaseMedia implements IMedia{
    private _duration:number;

    constructor() {
        super();
    }

    get duration(): number {
        return this._duration;
    }

    set duration(value: number) {
        this._duration = value;
    }
}