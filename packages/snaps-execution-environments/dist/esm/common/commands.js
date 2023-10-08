import { HandlerType } from '@metamask/snaps-utils';
import { assertExhaustive } from '@metamask/utils';
import { assertIsOnTransactionRequestArguments, assertIsOnNameLookupRequestArguments } from './validation';
/**
 * Formats the arguments for the given handler.
 *
 * @param origin - The origin of the request.
 * @param handler - The handler to pass the request to.
 * @param request - The request object.
 * @returns The formatted arguments.
 */ export function getHandlerArguments(origin, handler, request) {
    // `request` is already validated by the time this function is called.
    switch(handler){
        case HandlerType.OnTransaction:
            {
                assertIsOnTransactionRequestArguments(request.params);
                const { transaction, chainId, transactionOrigin } = request.params;
                return {
                    transaction,
                    chainId,
                    transactionOrigin
                };
            }
        case HandlerType.OnNameLookup:
            {
                assertIsOnNameLookupRequestArguments(request.params);
                // TS complains that domain/address are not part of the type
                // casting here as we've already validated the request args in the above step.
                const { chainId, domain, address } = request.params;
                return domain ? {
                    chainId,
                    domain
                } : {
                    chainId,
                    address
                };
            }
        case HandlerType.OnRpcRequest:
        case HandlerType.OnKeyringRequest:
            return {
                origin,
                request
            };
        case HandlerType.OnCronjob:
        case HandlerType.OnInstall:
        case HandlerType.OnUpdate:
            return {
                request
            };
        default:
            return assertExhaustive(handler);
    }
}
/**
 * Gets an object mapping internal, "command" JSON-RPC method names to their
 * implementations.
 *
 * @param startSnap - A function that starts a snap.
 * @param invokeSnap - A function that invokes the RPC method handler of a
 * snap.
 * @param onTerminate - A function that will be called when this executor is
 * terminated in order to handle cleanup tasks.
 * @returns An object containing the "command" method implementations.
 */ export function getCommandMethodImplementations(startSnap, invokeSnap, onTerminate) {
    return {
        ping: async ()=>Promise.resolve('OK'),
        terminate: async ()=>{
            onTerminate();
            return Promise.resolve('OK');
        },
        executeSnap: async (snapId, sourceCode, endowments)=>{
            await startSnap(snapId, sourceCode, endowments);
            return 'OK';
        },
        snapRpc: async (target, handler, origin, request)=>{
            return await invokeSnap(target, handler, getHandlerArguments(origin, handler, request)) ?? null;
        }
    };
}

//# sourceMappingURL=commands.js.map