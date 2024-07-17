/**
 * SIP-6 test vectors.
 */
export declare const ENTROPY_VECTORS: ({
    snapId: string;
    derivationPath: string;
    entropy: string;
    salt?: undefined;
} | {
    snapId: string;
    salt: string;
    derivationPath: string;
    entropy: string;
})[];
