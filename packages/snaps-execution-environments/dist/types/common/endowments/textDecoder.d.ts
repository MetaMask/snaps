declare const endowmentModule: {
    names: readonly ["TextDecoder"];
    factory: () => {
        readonly TextDecoder: {
            new (label?: string | undefined, options?: TextDecoderOptions | undefined): TextDecoder;
            prototype: TextDecoder;
        };
    };
};
export default endowmentModule;
