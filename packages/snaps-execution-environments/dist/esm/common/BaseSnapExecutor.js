// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../../../../node_modules/ses/types.d.ts" />
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
import { StreamProvider } from '@metamask/providers';
import { SNAP_EXPORT_NAMES, logError, SNAP_EXPORTS } from '@metamask/snaps-utils';
import { isObject, isValidJson, assert, isJsonRpcRequest, hasProperty, getSafeJson } from '@metamask/utils';
import { errorCodes, ethErrors, serializeError } from 'eth-rpc-errors';
import { createIdRemapMiddleware } from 'json-rpc-engine';
import { validate } from 'superstruct';
import { log } from '../logging';
import { getCommandMethodImplementations } from './commands';
import { createEndowments } from './endowments';
import { addEventListener, removeEventListener } from './globalEvents';
import { sortParamKeys } from './sortParams';
import { assertEthereumOutboundRequest, assertSnapOutboundRequest, constructError, sanitizeRequestArguments, proxyStreamProvider, withTeardown } from './utils';
import { ExecuteSnapRequestArgumentsStruct, PingRequestArgumentsStruct, SnapRpcRequestArgumentsStruct, TerminateRequestArgumentsStruct } from './validation';
const fallbackError = {
    code: errorCodes.rpc.internal,
    message: 'Execution Environment Error'
};
/**
 * The supported methods in the execution environment. The validator checks the
 * incoming JSON-RPC request, and the `params` property is used for sorting the
 * parameters, if they are an object.
 */ const EXECUTION_ENVIRONMENT_METHODS = {
    ping: {
        struct: PingRequestArgumentsStruct,
        params: []
    },
    executeSnap: {
        struct: ExecuteSnapRequestArgumentsStruct,
        params: [
            'snapId',
            'sourceCode',
            'endowments'
        ]
    },
    terminate: {
        struct: TerminateRequestArgumentsStruct,
        params: []
    },
    snapRpc: {
        struct: SnapRpcRequestArgumentsStruct,
        params: [
            'target',
            'handler',
            'origin',
            'request'
        ]
    }
};
export class BaseSnapExecutor {
    errorHandler(error, data) {
        const constructedError = constructError(error);
        const serializedError = serializeError(constructedError, {
            fallbackError,
            shouldIncludeStack: false
        });
        // We're setting it this way to avoid sentData.stack = undefined
        const sentData = {
            ...data,
            stack: constructedError?.stack ?? null
        };
        this.notify({
            method: 'UnhandledError',
            params: {
                error: {
                    ...serializedError,
                    data: sentData
                }
            }
        });
    }
    async onCommandRequest(message) {
        if (!isJsonRpcRequest(message)) {
            throw new Error('Command stream received a non-JSON-RPC request.');
        }
        const { id, method, params } = message;
        if (!hasProperty(EXECUTION_ENVIRONMENT_METHODS, method)) {
            this.respond(id, {
                error: ethErrors.rpc.methodNotFound({
                    data: {
                        method
                    }
                }).serialize()
            });
            return;
        }
        const methodObject = EXECUTION_ENVIRONMENT_METHODS[method];
        // support params by-name and by-position
        const paramsAsArray = sortParamKeys(methodObject.params, params);
        const [error] = validate(paramsAsArray, methodObject.struct);
        if (error) {
            this.respond(id, {
                error: ethErrors.rpc.invalidParams({
                    message: `Invalid parameters for method "${method}": ${error.message}.`,
                    data: {
                        method,
                        params: paramsAsArray
                    }
                }).serialize()
            });
            return;
        }
        try {
            const result = await this.methods[method](...paramsAsArray);
            this.respond(id, {
                result
            });
        } catch (rpcError) {
            this.respond(id, {
                error: serializeError(rpcError, {
                    fallbackError
                })
            });
        }
    }
    notify(requestObject) {
        if (!isValidJson(requestObject) || !isObject(requestObject)) {
            throw new Error('JSON-RPC notifications must be JSON serializable objects');
        }
        this.commandStream.write({
            ...requestObject,
            jsonrpc: '2.0'
        });
    }
    respond(id, requestObject) {
        if (!isValidJson(requestObject) || !isObject(requestObject)) {
            // Instead of throwing, we directly respond with an error.
            // This prevents an issue where we wouldn't respond when errors were non-serializable
            this.commandStream.write({
                error: serializeError(new Error('JSON-RPC responses must be JSON serializable objects.'), {
                    fallbackError
                }),
                id,
                jsonrpc: '2.0'
            });
            return;
        }
        this.commandStream.write({
            ...requestObject,
            id,
            jsonrpc: '2.0'
        });
    }
    /**
   * Attempts to evaluate a snap in SES. Generates APIs for the snap. May throw
   * on errors.
   *
   * @param snapId - The id of the snap.
   * @param sourceCode - The source code of the snap, in IIFE format.
   * @param _endowments - An array of the names of the endowments.
   */ async startSnap(snapId, sourceCode, _endowments) {
        log(`Starting snap '${snapId}' in worker.`);
        if (this.snapPromiseErrorHandler) {
            removeEventListener('unhandledrejection', this.snapPromiseErrorHandler);
        }
        if (this.snapErrorHandler) {
            removeEventListener('error', this.snapErrorHandler);
        }
        this.snapErrorHandler = (error)=>{
            this.errorHandler(error.error, {
                snapId
            });
        };
        this.snapPromiseErrorHandler = (error)=>{
            this.errorHandler(error instanceof Error ? error : error.reason, {
                snapId
            });
        };
        const provider = new StreamProvider(this.rpcStream, {
            jsonRpcStreamName: 'metamask-provider',
            rpcMiddleware: [
                createIdRemapMiddleware()
            ]
        });
        await provider.initialize();
        const snap = this.createSnapGlobal(provider);
        const ethereum = this.createEIP1193Provider(provider);
        // We specifically use any type because the Snap can modify the object any way they want
        const snapModule = {
            exports: {}
        };
        try {
            const { endowments, teardown: endowmentTeardown } = createEndowments(snap, ethereum, snapId, _endowments);
            // !!! Ensure that this is the only place the data is being set.
            // Other methods access the object value and mutate its properties.
            this.snapData.set(snapId, {
                idleTeardown: endowmentTeardown,
                runningEvaluations: new Set(),
                exports: {}
            });
            addEventListener('unhandledRejection', this.snapPromiseErrorHandler);
            addEventListener('error', this.snapErrorHandler);
            const compartment = new Compartment({
                ...endowments,
                module: snapModule,
                exports: snapModule.exports
            });
            // All of those are JavaScript runtime specific and self referential,
            // but we add them for compatibility sake with external libraries.
            //
            // We can't do that in the injected globals object above
            // because SES creates its own globalThis
            compartment.globalThis.self = compartment.globalThis;
            compartment.globalThis.global = compartment.globalThis;
            compartment.globalThis.window = compartment.globalThis;
            await this.executeInSnapContext(snapId, ()=>{
                compartment.evaluate(sourceCode);
                this.registerSnapExports(snapId, snapModule);
            });
        } catch (error) {
            this.removeSnap(snapId);
            throw new Error(`Error while running snap '${snapId}': ${error.message}`);
        }
    }
    /**
   * Cancels all running evaluations of all snaps and clears all snap data.
   * NOTE:** Should only be called in response to the `terminate` RPC command.
   */ onTerminate() {
        // `stop()` tears down snap endowments.
        // Teardown will also be run for each snap as soon as there are
        // no more running evaluations for that snap.
        this.snapData.forEach((data)=>data.runningEvaluations.forEach((evaluation)=>evaluation.stop()));
        this.snapData.clear();
    }
    registerSnapExports(snapId, snapModule) {
        const data = this.snapData.get(snapId);
        // Somebody deleted the snap before we could register.
        if (!data) {
            return;
        }
        data.exports = SNAP_EXPORT_NAMES.reduce((acc, exportName)=>{
            const snapExport = snapModule.exports[exportName];
            const { validator } = SNAP_EXPORTS[exportName];
            if (validator(snapExport)) {
                return {
                    ...acc,
                    [exportName]: snapExport
                };
            }
            return acc;
        }, {});
    }
    /**
   * Instantiates a snap API object (i.e. `globalThis.snap`).
   *
   * @param provider - A StreamProvider connected to MetaMask.
   * @returns The snap provider object.
   */ createSnapGlobal(provider) {
        const originalRequest = provider.request.bind(provider);
        const request = async (args)=>{
            const sanitizedArgs = sanitizeRequestArguments(args);
            assertSnapOutboundRequest(sanitizedArgs);
            this.notify({
                method: 'OutboundRequest'
            });
            try {
                return await withTeardown(originalRequest(sanitizedArgs), this);
            } finally{
                this.notify({
                    method: 'OutboundResponse'
                });
            }
        };
        // Proxy target is intentionally set to be an empty object, to ensure
        // that access to the prototype chain is not possible.
        const snapGlobalProxy = new Proxy({}, {
            has (_target, prop) {
                return typeof prop === 'string' && [
                    'request'
                ].includes(prop);
            },
            get (_target, prop) {
                if (prop === 'request') {
                    return request;
                }
                return undefined;
            }
        });
        return harden(snapGlobalProxy);
    }
    /**
   * Instantiates an EIP-1193 Ethereum provider object (i.e. `globalThis.ethereum`).
   *
   * @param provider - A StreamProvider connected to MetaMask.
   * @returns The EIP-1193 Ethereum provider object.
   */ createEIP1193Provider(provider) {
        const originalRequest = provider.request.bind(provider);
        const request = async (args)=>{
            const sanitizedArgs = sanitizeRequestArguments(args);
            assertEthereumOutboundRequest(sanitizedArgs);
            this.notify({
                method: 'OutboundRequest'
            });
            try {
                return await withTeardown(originalRequest(sanitizedArgs), this);
            } finally{
                this.notify({
                    method: 'OutboundResponse'
                });
            }
        };
        const streamProviderProxy = proxyStreamProvider(provider, request);
        return harden(streamProviderProxy);
    }
    /**
   * Removes the snap with the given name.
   *
   * @param snapId - The id of the snap to remove.
   */ removeSnap(snapId) {
        this.snapData.delete(snapId);
    }
    /**
   * Calls the specified executor function in the context of the specified snap.
   * Essentially, this means that the operation performed by the executor is
   * counted as an evaluation of the specified snap. When the count of running
   * evaluations of a snap reaches zero, its endowments are torn down.
   *
   * @param snapId - The id of the snap whose context to execute in.
   * @param executor - The function that will be executed in the snap's context.
   * @returns The executor's return value.
   * @template Result - The return value of the executor.
   */ async executeInSnapContext(snapId, executor) {
        const data = this.snapData.get(snapId);
        if (data === undefined) {
            throw new Error(`Tried to execute in context of unknown snap: "${snapId}".`);
        }
        let stop;
        const stopPromise = new Promise((_, reject)=>stop = ()=>reject(// TODO(rekmarks): Specify / standardize error code for this case.
                ethErrors.rpc.internal(`The snap "${snapId}" has been terminated during execution.`)));
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const evaluationData = {
            stop: stop
        };
        try {
            data.runningEvaluations.add(evaluationData);
            // Notice that we have to await this executor.
            // If we didn't, we would decrease the amount of running evaluations
            // before the promise actually resolves
            return await Promise.race([
                executor(),
                stopPromise
            ]);
        } finally{
            data.runningEvaluations.delete(evaluationData);
            if (data.runningEvaluations.size === 0) {
                this.lastTeardown += 1;
                await data.idleTeardown();
            }
        }
    }
    constructor(commandStream, rpcStream){
        _define_property(this, "snapData", void 0);
        _define_property(this, "commandStream", void 0);
        _define_property(this, "rpcStream", void 0);
        _define_property(this, "methods", void 0);
        _define_property(this, "snapErrorHandler", void 0);
        _define_property(this, "snapPromiseErrorHandler", void 0);
        _define_property(this, "lastTeardown", 0);
        this.snapData = new Map();
        this.commandStream = commandStream;
        this.commandStream.on('data', (data)=>{
            this.onCommandRequest(data).catch((error)=>{
                // TODO: Decide how to handle errors.
                logError(error);
            });
        });
        this.rpcStream = rpcStream;
        this.methods = getCommandMethodImplementations(this.startSnap.bind(this), async (target, handlerType, args)=>{
            const data = this.snapData.get(target);
            // We're capturing the handler in case someone modifies the data object
            // before the call.
            const handler = data?.exports[handlerType];
            const { required } = SNAP_EXPORTS[handlerType];
            assert(!required || handler !== undefined, `No ${handlerType} handler exported for snap "${target}`);
            // Certain handlers are not required. If they are not exported, we
            // return null.
            if (!handler) {
                return null;
            }
            // TODO: fix handler args type cast
            let result = await this.executeInSnapContext(target, ()=>handler(args));
            // The handler might not return anything, but undefined is not valid JSON.
            if (result === undefined) {
                result = null;
            }
            // /!\ Always return only sanitized JSON to prevent security flaws. /!\
            try {
                return getSafeJson(result);
            } catch (error) {
                throw new TypeError(`Received non-JSON-serializable value: ${error.message.replace(/^Assertion failed: /u, '')}`);
            }
        }, this.onTerminate.bind(this));
    }
}

//# sourceMappingURL=BaseSnapExecutor.js.map