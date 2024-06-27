/**
 * Evaluate the given bundle in the SES environment. This is a wrapper around
 * {@link evalBundle} that throws a {@link CommandError} if the bundle cannot be
 * evaluated.
 *
 * @param path - The path to the bundle.
 * @throws If the bundle cannot be evaluated.
 */
export declare function evaluate(path: string): Promise<import("@metamask/snaps-utils/node").EvalOutput>;
