import {
    runPipeline,
    ConnectionStep,
    StepState,
    StepDef,
    CheckOptions,
    IConnectionProgress,
    MediaAppConnectionStatus
} from "renderer/network/MediaAppConnectionSteps";

describe("MediaAppConnectionSteps - runPipeline", () => {
    const ip = "10.0.0.1";

    const makeStep = (
        step: ConnectionStep,
        resultOrFn: boolean | (() => Promise<boolean>),
        failStatus: MediaAppConnectionStatus
    ): StepDef => {
        const run = jest.fn(async () => {
            if (typeof resultOrFn === "function") {
                return await (resultOrFn as () => Promise<boolean>)();
            }
            return resultOrFn as boolean;
        });
        return { step, run, failStatus };
    };

    const collectProgress = () => {
        const progress: IConnectionProgress[] = [];
        const onProgress: CheckOptions["onProgress"] = (p) => progress.push(p);
        return { progress, onProgress };
    };

    it("returns Online and emits Started/Succeeded for each step when all succeed (user role)", async () => {
        const s1 = makeStep(ConnectionStep.IcmpPing, true, MediaAppConnectionStatus.IcmpPingFailed);
        const s2 = makeStep(ConnectionStep.TcpConnect, true, MediaAppConnectionStatus.TcpConnectionFailed);
        const s3 = makeStep(ConnectionStep.WsPing, true, MediaAppConnectionStatus.WebSocketPingFailed);
        const steps = [s1, s2, s3];

        const { progress, onProgress } = collectProgress();

        const status = await runPipeline(ip, steps, { role: "user", onProgress });

        expect(status).toBe(MediaAppConnectionStatus.Online);

        // Verify order and states
        expect(progress).toEqual([
            { step: ConnectionStep.IcmpPing, state: StepState.Started },
            { step: ConnectionStep.IcmpPing, state: StepState.Succeeded },
            { step: ConnectionStep.TcpConnect, state: StepState.Started },
            { step: ConnectionStep.TcpConnect, state: StepState.Succeeded },
            { step: ConnectionStep.WsPing, state: StepState.Started },
            { step: ConnectionStep.WsPing, state: StepState.Succeeded },
        ]);

        // Each run is called with the IP exactly once
        for (const s of steps) {
            expect(s.run).toHaveBeenCalledTimes(1);
            expect(s.run).toHaveBeenCalledWith(ip);
        }
    });

    it("stops on first failure and returns corresponding failStatus (user role)", async () => {
        const s1 = makeStep(ConnectionStep.IcmpPing, true, MediaAppConnectionStatus.IcmpPingFailed);
        const s2 = makeStep(ConnectionStep.TcpConnect, false, MediaAppConnectionStatus.TcpConnectionFailed);
        // Would succeed, but must not be executed
        const s3 = makeStep(ConnectionStep.WsPing, true, MediaAppConnectionStatus.WebSocketPingFailed);

        const steps = [s1, s2, s3];
        const { progress, onProgress } = collectProgress();

        const status = await runPipeline(ip, steps, { role: "user", onProgress });

        expect(status).toBe(MediaAppConnectionStatus.TcpConnectionFailed);

        // Verify it emitted only up to the failing step
        expect(progress).toEqual([
            { step: ConnectionStep.IcmpPing, state: StepState.Started },
            { step: ConnectionStep.IcmpPing, state: StepState.Succeeded },
            { step: ConnectionStep.TcpConnect, state: StepState.Started },
            { step: ConnectionStep.TcpConnect, state: StepState.Failed },
        ]);

        expect(s1.run).toHaveBeenCalledTimes(1);
        expect(s2.run).toHaveBeenCalledTimes(1);
        expect(s3.run).not.toHaveBeenCalled();
    });

    it("includes Register step for admin role and succeeds", async () => {
        const s1 = makeStep(ConnectionStep.IcmpPing, true, MediaAppConnectionStatus.IcmpPingFailed);
        const s2 = makeStep(ConnectionStep.TcpConnect, true, MediaAppConnectionStatus.TcpConnectionFailed);
        const s3 = makeStep(ConnectionStep.WsPing, true, MediaAppConnectionStatus.WebSocketPingFailed);
        const s4 = makeStep(ConnectionStep.Register, true, MediaAppConnectionStatus.RegistrationFailed);

        const steps = [s1, s2, s3, s4];
        const { progress, onProgress } = collectProgress();

        const status = await runPipeline(ip, steps, { role: "admin", onProgress });

        expect(status).toBe(MediaAppConnectionStatus.Online);
        expect(progress).toEqual([
            { step: ConnectionStep.IcmpPing, state: StepState.Started },
            { step: ConnectionStep.IcmpPing, state: StepState.Succeeded },
            { step: ConnectionStep.TcpConnect, state: StepState.Started },
            { step: ConnectionStep.TcpConnect, state: StepState.Succeeded },
            { step: ConnectionStep.WsPing, state: StepState.Started },
            { step: ConnectionStep.WsPing, state: StepState.Succeeded },
            { step: ConnectionStep.Register, state: StepState.Started },
            { step: ConnectionStep.Register, state: StepState.Succeeded },
        ]);
    });

    it("fails on Register step for admin role and returns RegistrationFailed", async () => {
        const s1 = makeStep(ConnectionStep.IcmpPing, true, MediaAppConnectionStatus.IcmpPingFailed);
        const s2 = makeStep(ConnectionStep.TcpConnect, true, MediaAppConnectionStatus.TcpConnectionFailed);
        const s3 = makeStep(ConnectionStep.WsPing, true, MediaAppConnectionStatus.WebSocketPingFailed);
        const s4 = makeStep(ConnectionStep.Register, false, MediaAppConnectionStatus.RegistrationFailed);

        const steps = [s1, s2, s3, s4];
        const { progress, onProgress } = collectProgress();

        const status = await runPipeline(ip, steps, { role: "admin", onProgress });

        expect(status).toBe(MediaAppConnectionStatus.RegistrationFailed);
        expect(progress).toEqual([
            { step: ConnectionStep.IcmpPing, state: StepState.Started },
            { step: ConnectionStep.IcmpPing, state: StepState.Succeeded },
            { step: ConnectionStep.TcpConnect, state: StepState.Started },
            { step: ConnectionStep.TcpConnect, state: StepState.Succeeded },
            { step: ConnectionStep.WsPing, state: StepState.Started },
            { step: ConnectionStep.WsPing, state: StepState.Succeeded },
            { step: ConnectionStep.Register, state: StepState.Started },
            { step: ConnectionStep.Register, state: StepState.Failed },
        ]);
    });

    it("does not require onProgress and still returns Online", async () => {
        const steps: StepDef[] = [
            makeStep(ConnectionStep.IcmpPing, true, MediaAppConnectionStatus.IcmpPingFailed),
            makeStep(ConnectionStep.TcpConnect, true, MediaAppConnectionStatus.TcpConnectionFailed),
            makeStep(ConnectionStep.WsPing, true, MediaAppConnectionStatus.WebSocketPingFailed),
        ];

        // No onProgress provided
        const status = await runPipeline(ip, steps, { role: "user" });

        expect(status).toBe(MediaAppConnectionStatus.Online);
    });

    it("propagates rejection if a step throws", async () => {
        const s1 = makeStep(ConnectionStep.IcmpPing, true, MediaAppConnectionStatus.IcmpPingFailed);
        const s2: StepDef = {
            step: ConnectionStep.TcpConnect,
            run: jest.fn(async () => {
                throw new Error("Network error");
            }),
            failStatus: MediaAppConnectionStatus.TcpConnectionFailed,
        };
        const steps = [s1, s2];

        await expect(runPipeline(ip, steps, { role: "user" })).rejects.toThrow("Network error");

        expect(s1.run).toHaveBeenCalledTimes(1);
        expect(s2.run).toHaveBeenCalledTimes(1);
    });

    it("calls each step with the same IP in order", async () => {
        const calls: ConnectionStep[] = [];
        const orderedStep = (step: ConnectionStep, result: boolean, fail: MediaAppConnectionStatus): StepDef => ({
            step,
            run: jest.fn(async () => {
                calls.push(step);
                return result;
            }),
            failStatus: fail,
        });

        const s1 = orderedStep(ConnectionStep.IcmpPing, true, MediaAppConnectionStatus.IcmpPingFailed);
        const s2 = orderedStep(ConnectionStep.TcpConnect, true, MediaAppConnectionStatus.TcpConnectionFailed);
        const s3 = orderedStep(ConnectionStep.WsPing, true, MediaAppConnectionStatus.WebSocketPingFailed);
        const steps = [s1, s2, s3];

        const status = await runPipeline(ip, steps, { role: "user" });

        expect(status).toBe(MediaAppConnectionStatus.Online);
        expect(calls).toEqual([ConnectionStep.IcmpPing, ConnectionStep.TcpConnect, ConnectionStep.WsPing]);

        for (const s of steps) {
            expect(s.run).toHaveBeenCalledWith(ip);
        }
    });
});