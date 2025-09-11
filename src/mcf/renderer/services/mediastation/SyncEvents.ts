export enum SyncScope {
    MediaApp = "MediaApp",
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
    | { scope: SyncScope.MediaApp; type: "Connecting"; appName: string; ip: string }
    | { scope: SyncScope.MediaApp; type: "ConnectionStatus"; status: ConnectionStatus }
    | { scope: SyncScope.MediaApp; type: "LoadMediaStart"; ext: string }
    | { scope: SyncScope.MediaApp; type: "MediaSendStart" }
    | { scope: SyncScope.MediaApp; type: "MediaSendingProgress"; progressPoint:string }
    | { scope: SyncScope.MediaApp; type: "MediaSendSuccess" }
    | { scope: SyncScope.MediaApp; type: "MediaSendFailed" }
    | { scope: SyncScope.MediaApp; type: "DeleteStart"; mediaAppId: number; id: number }
    | { scope: SyncScope.Controller; type: "Connecting"; ip: string }
    | { scope: SyncScope.Controller; type: "SendingContents" }
    | { scope: SyncScope.Controller; type: "Sent" }
    | { scope: SyncScope.MediaStation; type: "Done" };

export interface ProgressReporter {
    (event: SyncEvent): void;
}