export declare const createCrypto: () => {
    readonly crypto: any;
    readonly SubtleCrypto: any;
};
declare const endowmentModule: {
    names: readonly ["crypto", "SubtleCrypto"];
    factory: () => {
        readonly crypto: any;
        readonly SubtleCrypto: any;
    };
};
export default endowmentModule;
