export enum SyncScope {
    MediaPlayer = "MediaPlayer",
    Controller = "Controller",
    MediaStation = "MediaStation"
}

export enum ConnectionStatus {
    IcmpPingFailed = "icmpPingFailed",
    TcpConnectionFailed = "tcpConnectionFailed",
    WebSocketPingFailed = "webSocketPingFailed",
    RegistrationFailed = "registrationFailed",
    Online = "online",
}

export type SyncEvent =
    | { scope: SyncScope.MediaPlayer; type: "Connecting"; appName: string; ip: string }
    | { scope: SyncScope.MediaPlayer; type: "ConnectionStatus"; status: ConnectionStatus }
    | { scope: SyncScope.MediaPlayer; type: "LoadMediaStart"; ext: string }
    | { scope: SyncScope.MediaPlayer; type: "MediaSendStart" }
    | { scope: SyncScope.MediaPlayer; type: "MediaSendingProgress"; progressPoint:string }
    | { scope: SyncScope.MediaPlayer; type: "MediaSendSuccess" }
    | { scope: SyncScope.MediaPlayer; type: "MediaSendFailed" }
    | { scope: SyncScope.MediaPlayer; type: "DeleteStart"; mediaPlayerId: number; id: number }
    | { scope: SyncScope.Controller; type: "NoControllerDefined" }
    | { scope: SyncScope.Controller; type: "Connecting"; ip: string, appName:string }
    | { scope: SyncScope.Controller; type: "SendingContents" }
    | { scope: SyncScope.Controller; type: "Connected" }
    | { scope: SyncScope.Controller; type: "Sent" }
    | { scope: SyncScope.MediaStation; type: "Done" };

export interface ProgressReporter {
    (event: SyncEvent): void;
}