declare const endowmentModule: {
    names: readonly ["setTimeout", "clearTimeout"];
    factory: () => {
        readonly setTimeout: (handler: TimerHandler, timeout?: number) => unknown;
        readonly clearTimeout: (handle: unknown) => void;
        readonly teardownFunction: () => void;
    };
};
export default endowmentModule;
