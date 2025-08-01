/**
 * A lifecycle event handler. This is called whenever a lifecycle event occurs,
 * such as the Snap being installed or updated.
 *
 * Note that using this handler requires the `endowment:lifecycle-hooks`
 * permission.
 *
 * @param args - The request arguments.
 * @param args.origin - The origin that triggered the lifecycle event hook.
 */
export type LifecycleEventHandler = (args: {
  origin: string;
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
 * @param args.origin - The origin that triggered the lifecycle event hook.
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
 * @param args.origin - The origin that triggered the lifecycle event hook.
 */
export type OnUpdateHandler = LifecycleEventHandler;

/**
 * The `onStart` handler. This is called when the client is started.
 *
 * Note that using this handler requires the `endowment:lifecycle-hooks`
 * permission.
 *
 * This type is an alias for {@link LifecycleEventHandler}.
 *
 * @param args - The request arguments.
 * @param args.origin - The origin that triggered the lifecycle event hook.
 */
export type OnStartHandler = LifecycleEventHandler;

/**
 * The `onActive` handler. This is called when the client becomes active.
 *
 * Note that using this handler requires the `endowment:lifecycle-hooks`
 * permission.
 *
 * This type is an alias for {@link LifecycleEventHandler}.
 *
 * @param args - The request arguments.
 * @param args.origin - The origin that triggered the lifecycle event hook.
 */
export type OnActiveHandler = LifecycleEventHandler;

/**
 * The `onInactive` handler. This is called when the client becomes inactive.
 *
 * Note that using this handler requires the `endowment:lifecycle-hooks`
 * permission.
 *
 * This type is an alias for {@link LifecycleEventHandler}.
 *
 * @param args - The request arguments.
 * @param args.origin - The origin that triggered the lifecycle event hook.
 */
export type OnInactiveHandler = LifecycleEventHandler;
