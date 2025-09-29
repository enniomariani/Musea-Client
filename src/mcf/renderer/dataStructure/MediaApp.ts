export class MediaApp {

    static ROLE_CONTROLLER:string = "roleController";
    static ROLE_DEFAULT:string = "roleDefault";

    private _id: number;
    private _role: string = "";
    private _name: string = "";
    private _ip: string = "";

    constructor(id:number) {
        this._id = id;
    }

    get id(): number {
        return this._id;
    }

    get role(): string {
        return this._role;
    }

    set role(value: string) {
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