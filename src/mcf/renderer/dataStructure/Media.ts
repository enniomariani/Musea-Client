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