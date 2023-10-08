/**
 * Create a {@link Math} object, with the same properties as the global
 * {@link Math} object, but with the {@link Math.random} method replaced.
 *
 * @returns The {@link Math} object with the {@link Math.random} method
 * replaced.
 */
declare function createMath(): {
    Math: {
        random: () => number;
        E?: number | undefined;
        LN10?: number | undefined;
        LN2?: number | undefined;
        LOG2E?: number | undefined;
        LOG10E?: number | undefined;
        PI?: number | undefined;
        SQRT1_2?: number | undefined;
        SQRT2?: number | undefined;
        abs?: ((x: number) => number) | undefined;
        acos?: ((x: number) => number) | undefined;
        asin?: ((x: number) => number) | undefined;
        atan?: ((x: number) => number) | undefined;
        atan2?: ((y: number, x: number) => number) | undefined;
        ceil?: ((x: number) => number) | undefined;
        cos?: ((x: number) => number) | undefined;
        exp?: ((x: number) => number) | undefined;
        floor?: ((x: number) => number) | undefined;
        log?: ((x: number) => number) | undefined;
        max?: ((...values: number[]) => number) | undefined;
        min?: ((...values: number[]) => number) | undefined;
        pow?: ((x: number, y: number) => number) | undefined;
        round?: ((x: number) => number) | undefined;
        sin?: ((x: number) => number) | undefined;
        sqrt?: ((x: number) => number) | undefined;
        tan?: ((x: number) => number) | undefined;
        clz32?: ((x: number) => number) | undefined;
        imul?: ((x: number, y: number) => number) | undefined;
        sign?: ((x: number) => number) | undefined;
        log10?: ((x: number) => number) | undefined;
        log2?: ((x: number) => number) | undefined;
        log1p?: ((x: number) => number) | undefined;
        expm1?: ((x: number) => number) | undefined;
        cosh?: ((x: number) => number) | undefined;
        sinh?: ((x: number) => number) | undefined;
        tanh?: ((x: number) => number) | undefined;
        acosh?: ((x: number) => number) | undefined;
        asinh?: ((x: number) => number) | undefined;
        atanh?: ((x: number) => number) | undefined;
        hypot?: ((...values: number[]) => number) | undefined;
        trunc?: ((x: number) => number) | undefined;
        fround?: ((x: number) => number) | undefined;
        cbrt?: ((x: number) => number) | undefined;
        [Symbol.toStringTag]?: string | undefined;
    };
};
declare const endowmentModule: {
    names: readonly ["Math"];
    factory: typeof createMath;
};
export default endowmentModule;
