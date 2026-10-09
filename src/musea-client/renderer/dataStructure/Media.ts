export interface IMedia{
    idOnMediaPlayer:number
    mediaPlayerId:number
    exportToJSON:any
    fileName:any
}

export class BaseMedia implements IMedia{

    protected _idOnMediaPlayer:number = -1;
    protected _mediaPlayerId:number = -1;
    protected _fileName:string = "";

    constructor() {}

    exportToJSON():any{
        return {
            mediaPlayerId: this._mediaPlayerId,
            idOnMediaPlayer: this._idOnMediaPlayer,
            filename: this._fileName
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

    override exportToJSON():any{
        return {
            mediaPlayerId: this._mediaPlayerId,
            type: "image",
            idOnMediaPlayer: this._idOnMediaPlayer,
            fileName: this._fileName
        }
    }
}

export class Video extends BaseMedia implements IMedia{
    private _duration:number = -1;
    private _subtitles:SubtitleInternal[] = [];

    constructor() {
        super();
    }

    override exportToJSON():any{
        let subJSON:any[] = [];

        this._subtitles.forEach((sub) =>{
            subJSON.push(sub.exportToJSON());
        });

        return {
            mediaPlayerId: this._mediaPlayerId,
            type: "video",
            idOnMediaPlayer: this._idOnMediaPlayer,
            duration: this._duration,
            fileName: this._fileName,
            subtitles: subJSON
        }
    }

    get subtitles(): SubtitleInternal[] {
        return this._subtitles;
    }

    set subtitles(value: SubtitleInternal[]) {
        this._subtitles = value;
    }

    get duration(): number {
        return this._duration;
    }

    set duration(value: number) {
        this._duration = value;
    }
}

export class SubtitleInternal {
    constructor(private readonly _iso6392T: string, private readonly _title: string) {}

    get iso6392T() { return this._iso6392T; }
    get title() { return this._title; }

    exportToJSON():any{
        return {
            iso6392T: this._iso6392T,
            title: this._title
        }
    }
}