/// <reference types="node" />
/// <reference types="ses" />
import type { HandlerType, SnapExportsParameters } from '@metamask/snaps-utils';
import type { JsonRpcNotification, JsonRpcId, Json } from '@metamask/utils';
import type { Duplex } from 'stream';
export declare type InvokeSnapArgs = Omit<SnapExportsParameters[0], 'chainId'>;
export declare type InvokeSnap = (target: string, handler: HandlerType, args: InvokeSnapArgs | undefined) => Promise<Json>;
export declare class BaseSnapExecutor {
    private readonly snapData;
    private readonly commandStream;
    private readonly rpcStream;
    private readonly methods;
    private snapErrorHandler?;
    private snapPromiseErrorHandler?;
    private lastTeardown;
    protected constructor(commandStream: Duplex, rpcStream: Duplex);
    private errorHandler;
    private onCommandRequest;
    protected notify(requestObject: Omit<JsonRpcNotification, 'jsonrpc'>): void;
    protected respond(id: JsonRpcId, requestObject: Record<string, unknown>): void;
    /**
     * Attempts to evaluate a snap in SES. Generates APIs for the snap. May throw
     * on errors.
     *
     * @param snapId - The id of the snap.
     * @param sourceCode - The source code of the snap, in IIFE format.
     * @param _endowments - An array of the names of the endowments.
     */
    protected startSnap(snapId: string, sourceCode: string, _endowments?: string[]): Promise<void>;
    /**
     * Cancels all running evaluations of all snaps and clears all snap data.
     * NOTE:** Should only be called in response to the `terminate` RPC command.
     */
    protected onTerminate(): void;
    private registerSnapExports;
    /**
     * Instantiates a snap API object (i.e. `globalThis.snap`).
     *
     * @param provider - A StreamProvider connected to MetaMask.
     * @returns The snap provider object.
     */
    private createSnapGlobal;
    /**
     * Instantiates an EIP-1193 Ethereum provider object (i.e. `globalThis.ethereum`).
     *
     * @param provider - A StreamProvider connected to MetaMask.
     * @returns The EIP-1193 Ethereum provider object.
     */
    private createEIP1193Provider;
    /**
     * Removes the snap with the given name.
     *
     * @param snapId - The id of the snap to remove.
     */
    private removeSnap;
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
     */
    private executeInSnapContext;
}
