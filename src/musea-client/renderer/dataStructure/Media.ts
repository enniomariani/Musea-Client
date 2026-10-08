export interface IMedia{
    idOnMediaPlayer:number
    mediaPlayerId:number
    exportToJSON:any
    fileName:any
}

export class BaseMedia implements IMedia{

    protected _idOnMediaPlayer:number = -1;
    protected _mediaPlayerId:number = -1;
    private _fileName:string = "";

    constructor() {}

    exportToJSON():any{
        return {
            idOnMediaPlayer: this._idOnMediaPlayer,
            mediaPlayerId: this._mediaPlayerId
        }
    }

    get idOnMediaPlayer(): number {
        return this._idOnMediaPlayer;
    }

    set idOnMediaPlayer(value: number) {
        this._idOnMediaPlayer = value;
    }

    get mediaPlayerId(): number {
        return this._mediaPlayerId;
    }

    set mediaPlayerId(value: number) {
        this._mediaPlayerId = value;
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
    private _subtitles:Subtitle[] = [];

    constructor() {
        super();
    }

    exportToJSON():any{
        return {
            idOnMediaPlayer: this._idOnMediaPlayer,
            mediaPlayerId: this._mediaPlayerId,
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

export class Subtitle{
    private _iso6392:string = "";
    private _title: string = "";

    exportToJSON():any{
        return {
            iso6392: this._iso6392,
            title: this._title
        }
    }

    get iso6392(): string {
        return this._iso6392;
    }

    set iso6392(value: string) {
        this._iso6392 = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }
}