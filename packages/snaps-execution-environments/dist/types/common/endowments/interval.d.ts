declare const endowmentModule: {
    names: readonly ["setInterval", "clearInterval"];
    factory: () => {
        readonly setInterval: (handler: TimerHandler, timeout?: number) => unknown;
        readonly clearInterval: (handle: unknown) => void;
        readonly teardownFunction: () => void;
    };
};
export default endowmentModule;
