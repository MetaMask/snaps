import { logError } from '@metamask/snaps-utils';
import { ethErrors } from 'eth-rpc-errors';
import { selectHooks } from '../utils';
import { methodHandlers } from './handlers';
/**
 * Creates a middleware that handles permitted snap RPC methods.
 *
 * @param isSnap - A flag that should indicate whether the requesting origin is a snap or not.
 * @param hooks - An object containing the hooks made available to the permitted RPC methods.
 * @returns The middleware.
 */ export function createSnapsMethodMiddleware(isSnap, hooks) {
    // This is not actually a misused promise, the type is just wrong
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return async function methodMiddleware(request, response, next, end) {
        const handler = methodHandlers[request.method];
        if (handler) {
            if (request.method.startsWith('snap_') && !isSnap) {
                return end(ethErrors.rpc.methodNotFound());
            }
            // TODO: Once json-rpc-engine types are up to date, we should type this correctly
            const { implementation, hookNames } = handler;
            try {
                // Implementations may or may not be async, so we must await them.
                return await implementation(request, response, next, end, selectHooks(hooks, hookNames));
            } catch (error) {
                logError(error);
                return end(error);
            }
        }
        return next();
    };
}

//# sourceMappingURL=middleware.js.map