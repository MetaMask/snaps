import type { JsonRpcRequest } from '@metamask/utils';

/**
 * A lifecycle event handler. This is called whenever a lifecycle event occurs,
 * such as the Snap being installed or updated.
 *
 * Note that using this handler requires the `endowment:lifecycle-hooks`
 * permission.
 *
 * @param args - The request arguments.
 * @param args.request - The JSON-RPC request sent to the Snap. This does not
 * contain any parameters.
 */
export type LifecycleEventHandler = (args: {
  request: JsonRpcRequest;
}) => Promise<unknown>;

/**
 * The `onInstall` handler. This is called after the Snap is installed.
 *
 * Note that using this handler requires the `endowment:lifecycle-hooks`
 * permission.
 *
 * This type is an alias for {@link LifecycleEventHandler}.
 *
 * @param args - The request arguments.
 * @param args.request - The JSON-RPC request sent to the Snap. This does not
 * contain any parameters.
 */
export type OnInstallHandler = LifecycleEventHandler;

/**
 * The `onUpdate` handler. This is called after the Snap is updated.
 *
 * Note that using this handler requires the `endowment:lifecycle-hooks`
 * permission.
 *
 * This type is an alias for {@link LifecycleEventHandler}.
 *
 * @param args - The request arguments.
 * @param args.request - The JSON-RPC request sent to the Snap. This does not
 * contain any parameters.
 */
export type OnUpdateHandler = LifecycleEventHandler;
