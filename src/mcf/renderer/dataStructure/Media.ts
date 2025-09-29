export interface IMedia{
    idOnMediaApp:number
    mediaAppId:number
    exportToJSON:any
    fileName:any
}

export class BaseMedia implements IMedia{

    protected _idOnMediaApp:number = -1;
    protected _mediaAppId:number = -1;
    private _fileName:string = "";

    constructor() {}

    exportToJSON():any{
        return {
            idOnMediaApp: this._idOnMediaApp,
            mediaAppId: this._mediaAppId
        }
    }

    get idOnMediaApp(): number {
        return this._idOnMediaApp;
    }

    set idOnMediaApp(value: number) {
        this._idOnMediaApp = value;
    }

    get mediaAppId(): number {
        return this._mediaAppId;
    }

    set mediaAppId(value: number) {
        this._mediaAppId = value;
    }

    get fileName(): string {
        return this._fileName;
    }

    set fileName(value: string) {
        this._fileName = value;
    }
}

export class Image extends BaseMedia implements IMedia{
    constructor() {
        super();
    }
}

export class Video extends BaseMedia implements IMedia{
    private _duration:number = -1;

    constructor() {
        super();
    }

    exportToJSON():any{
        return {
            idOnMediaApp: this._idOnMediaApp,
            mediaAppId: this._mediaAppId,
            duration: this._duration
        }
    }

    get duration(): number {
        return this._duration;
    }

    set duration(value: number) {
        this._duration = value;
    }
}