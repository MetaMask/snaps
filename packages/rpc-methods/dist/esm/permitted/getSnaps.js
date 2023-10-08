const hookNames = {
    getSnaps: true
};
/**
 * `wallet_getSnaps` gets the requester's permitted and installed Snaps.
 */ export const getSnapsHandler = {
    methodNames: [
        'wallet_getSnaps'
    ],
    implementation: getSnapsImplementation,
    hookNames
};
/**
 * The `wallet_getSnaps` method implementation.
 * Fetches available snaps for the requesting origin and adds them to the JSON-RPC response.
 *
 * @param _req - The JSON-RPC request object. Not used by this function.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getSnaps - A function that returns the snaps available for the requesting origin.
 * @returns Nothing.
 */ async function getSnapsImplementation(_req, res, _next, end, { getSnaps }) {
    // getSnaps is already bound to the origin
    res.result = await getSnaps();
    return end();
}

//# sourceMappingURL=getSnaps.js.map