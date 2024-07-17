/**
 * Creates the iframe to be used as the execution environment. This may run
 * forever if the iframe never loads, but the promise should be wrapped in
 * an initialization timeout in the SnapController.
 *
 * @param uri - The iframe URI.
 * @param id - The ID to assign to the iframe.
 * @param sandbox - Whether to enable the sandbox attribute.
 * @returns A promise that resolves to the contentWindow of the iframe.
 */
export declare function createWindow(uri: string, id: string, sandbox?: boolean): Promise<Window>;
