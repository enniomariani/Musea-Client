export enum ConnectionStep {
    IcmpPing = "icmpPing",
    TcpConnect = "tcpConnect",
    WsPing = "wsPing",
    Register = "register",
}

export enum MediaAppConnectionStatus {
    IcmpPingFailed = "icmpPingFailed",
    TcpConnectionFailed = "tcpConnectionFailed",
    WebSocketPingFailed = "webSocketPingFailed",
    RegistrationFailed = "registrationFailed",
    Online = "online",
}

export enum StepState {
    Started = "started",
    Succeeded = "succeeded",
    Failed = "failed"
}

export interface IConnectionProgress {
    step: ConnectionStep;
    state: StepState;
}
export interface StepDef {
    step: ConnectionStep;
    run: (ip: string) => Promise<boolean>;
    failStatus: MediaAppConnectionStatus;
}

export interface CheckOptions {
    role: "user" | "admin";
    onProgress?: (p: IConnectionProgress) => void;
}

export async function runPipeline(ip: string, steps: StepDef[], opts: CheckOptions): Promise<MediaAppConnectionStatus> {
    for (const s of steps) {
        opts.onProgress?.({ step: s.step, state: StepState.Started });
        const ok:boolean = await s.run(ip);
        opts.onProgress?.({ step: s.step, state: ok ? StepState.Succeeded : StepState.Failed });
        if (!ok) return s.failStatus;
    }
    return MediaAppConnectionStatus.Online;
}