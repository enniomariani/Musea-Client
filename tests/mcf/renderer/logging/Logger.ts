export interface  ILogger{
    info(message:string): void;
    error(message:string): void;
}

export class Logger implements ILogger{
    constructor() {
    }

    info(message:string): void{

    }

    error(message:string): void{

    }
}