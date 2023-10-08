declare const endowmentModule: {
    names: readonly ["TextEncoder"];
    factory: () => {
        readonly TextEncoder: {
            new (): TextEncoder;
            prototype: TextEncoder;
        };
    };
};
export default endowmentModule;
