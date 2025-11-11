export const MediaPlayerRole = {
    CONTROLLER: "roleController",
    DEFAULT: "roleDefault"
} as const;
export type MediaPlayerRole = typeof MediaPlayerRole[keyof typeof MediaPlayerRole];

export class MediaPlayer {

    private _id: number;
    private _role: MediaPlayerRole = MediaPlayerRole.DEFAULT;
    private _name: string = "";
    private _ip: string = "";

    constructor(id:number) {
        this._id = id;
    }

    get id(): number {
        return this._id;
    }

    get role(): MediaPlayerRole {
        return this._role;
    }

    set role(value: MediaPlayerRole) {
        this._role = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get ip(): string {
        return this._ip;
    }

    set ip(value: string) {
        this._ip = value;
    }
}