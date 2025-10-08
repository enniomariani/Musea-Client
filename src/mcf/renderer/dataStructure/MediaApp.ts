export const MediaAppRole = {
    CONTROLLER: "roleController",
    DEFAULT: "roleDefault"
} as const;
export type MediaAppRole = typeof MediaAppRole[keyof typeof MediaAppRole];

export class MediaApp {

    private _id: number;
    private _role: MediaAppRole = MediaAppRole.DEFAULT;
    private _name: string = "";
    private _ip: string = "";

    constructor(id:number) {
        this._id = id;
    }

    get id(): number {
        return this._id;
    }

    get role(): MediaAppRole {
        return this._role;
    }

    set role(value: MediaAppRole) {
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