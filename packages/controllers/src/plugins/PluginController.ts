import { ethErrors, serializeError } from 'eth-rpc-errors';
import type { Patch } from 'immer';
import { IOcapLdCapability } from 'rpc-cap/dist/src/@types/ocap-ld';
import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import { Json } from 'json-rpc-engine';
import {
  ErrorJSON,
  ErrorMessageEvent,
  PluginData,
  PluginName,
  UnresponsiveMessageEvent,
} from '@metamask/snap-types';
import { nanoid } from 'nanoid';
import {
  GetRpcMessageHandler,
  ExecutePlugin,
  TerminateAll,
  TerminatePlugin,
} from '../services/ExecutionEnvironmentService';
import { INLINE_PLUGINS } from './inlinePlugins';

export const controllerName = 'PluginController';

export const PLUGIN_PREFIX = 'wallet_plugin_';
export const PLUGIN_PREFIX_REGEX = new RegExp(`^${PLUGIN_PREFIX}`, 'u');
const SERIALIZABLE_PLUGIN_PROPERTIES = new Set([
  'initialPermissions',
  'name',
  'permissionName',
]);

type RequestedPluginPermissions = {
  [permission: string]: Json;
};

export type SerializablePlugin = {
  initialPermissions: RequestedPluginPermissions;
  name: string;
  permissionName: string;
  version: string;
  status: PluginStatus;
  enabled: boolean;
};

export type Plugin = SerializablePlugin & {
  sourceCode: string;
};

export type PluginError = {
  message: string;
  code: number;
  data?: Json;
};

export type ProcessPluginReturnType =
  | SerializablePlugin
  | { error: ReturnType<typeof serializeError> };
export type InstallPluginsResult = {
  [pluginName: string]: ProcessPluginReturnType;
};

// Types that probably should be defined elsewhere in prod
type RemoveAllPermissionsFunction = (pluginIds: string[]) => void;
type CloseAllConnectionsFunction = (domain: string) => void;
type RequestPermissionsFunction = (
  domain: string,
  requestedPermissions: RequestedPluginPermissions,
) => Promise<IOcapLdCapability[]>;
type HasPermissionFunction = (
  domain: string,
  permissionName: string,
) => boolean;
type GetPermissionsFunction = (domain: string) => IOcapLdCapability[];
type PluginId = string;
type StoredPlugins = Record<PluginId, Plugin>;

export type PluginControllerState = {
  inlinePluginIsRunning: boolean;
  plugins: StoredPlugins;
  pluginStates: {
    [PluginId: string]: Json;
  };
  pluginErrors: {
    [internalID: string]: PluginError & { internalID: string };
  };
};

export type PluginStateChange = {
  type: `${typeof controllerName}:stateChange`;
  payload: [PluginControllerState, Patch[]];
};

// TODO: Create actions
export type PluginControllerActions = never;

export type PluginControllerEvents = PluginStateChange;

// TODO: Use ControllerMessenger events
type PluginControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  PluginControllerActions,
  PluginControllerEvents | ErrorMessageEvent | UnresponsiveMessageEvent,
  never,
  ErrorMessageEvent['type'] | UnresponsiveMessageEvent['type']
>;

type PluginControllerArgs = {
  messenger: PluginControllerMessenger;
  state?: PluginControllerState;
  removeAllPermissionsFor: RemoveAllPermissionsFunction;
  closeAllConnections: CloseAllConnectionsFunction;
  requestPermissions: RequestPermissionsFunction;
  getPermissions: GetPermissionsFunction;
  hasPermission: HasPermissionFunction;
  terminatePlugin: TerminatePlugin;
  terminateAllPlugins: TerminateAll;
  executePlugin: ExecutePlugin;
  getRpcMessageHandler: GetRpcMessageHandler;
  maxIdleTime?: number;
  idleTimeCheckInterval?: number;
};

type AddPluginBase = {
  name: string;
};

type AddPluginByFetchingArgs = AddPluginBase & {
  manifestUrl: string;
};

// The parts of a plugin package.json file that we care about
type PluginManifest = {
  version: string;
  web3Wallet: { initialPermissions: RequestedPluginPermissions };
};

type AddPluginDirectlyArgs = AddPluginBase & {
  manifest: PluginManifest;
  sourceCode: string;
};

type AddPluginArgs = AddPluginByFetchingArgs | AddPluginDirectlyArgs;

const defaultState: PluginControllerState = {
  pluginErrors: {},
  inlinePluginIsRunning: false,
  plugins: {},
  pluginStates: {},
};

export enum PluginStatus {
  idle = 'idle',
  running = 'running',
  stopped = 'stopped',
  crashed = 'crashed',
}

export enum PluginStatusEvent {
  start = 'start',
  stop = 'stop',
  crash = 'crash',
}

/**
 * Guard transitioning when the plugin is disabled.
 */
const disabledGuard = (serializedPlugin: SerializablePlugin) => {
  return serializedPlugin.enabled;
};

/**
 * The StateMachine configuration for a plugins `status` state.
 * Using a state machine for a plugins `status` ensures that the plugin transitions to a valid next lifecycle state.
 * Supports a very minimal subset of XState conventions outlined in `_transitionPluginState`.
 */
const pluginStatusStateMachineConfig = {
  initial: PluginStatus.idle,
  states: {
    [PluginStatus.idle]: {
      on: {
        [PluginStatusEvent.start]: {
          target: PluginStatus.running,
          cond: disabledGuard,
        },
      },
    },
    [PluginStatus.running]: {
      on: {
        [PluginStatusEvent.stop]: PluginStatus.stopped,
        [PluginStatusEvent.crash]: PluginStatus.crashed,
      },
    },
    [PluginStatus.stopped]: {
      on: {
        [PluginStatusEvent.start]: {
          target: PluginStatus.running,
          cond: disabledGuard,
        },
      },
    },
    [PluginStatus.crashed]: {
      on: {
        [PluginStatusEvent.start]: {
          target: PluginStatus.running,
          cond: disabledGuard,
        },
      },
    },
  },
} as const;

const name = 'PluginController';

/*
 * A plugin is initialized in three phases:
 * - Add: Loads the plugin from a remote source and parses it.
 * - Authorize: Requests the plugin's required permissions from the user.
 * - Start: Initializes the plugin in its SES realm with the authorized permissions.
 */

export class PluginController extends BaseController<
  string,
  PluginControllerState,
  PluginControllerMessenger
> {
  private _removeAllPermissionsFor: RemoveAllPermissionsFunction;

  private _closeAllConnections: CloseAllConnectionsFunction;

  private _requestPermissions: RequestPermissionsFunction;

  private _getPermissions: GetPermissionsFunction;

  private _hasPermission: HasPermissionFunction;

  private _terminatePlugin: TerminatePlugin;

  private _terminateAllPlugins: TerminateAll;

  private _executePlugin: ExecutePlugin;

  private _getRpcMessageHandler: GetRpcMessageHandler;

  private _pluginsBeingAdded: Map<string, Promise<Plugin>>;

  private _maxIdleTime: number;

  private _idleTimeCheckInterval: number;

  private _timeoutForLastRequestStatus?: NodeJS.Timeout;

  private _lastRequestMap: Map<PluginName, number>;

  private _rpcHandlerMap: Map<
    PluginName,
    (origin: string, request: Record<string, unknown>) => Promise<unknown>
  >;

  constructor({
    removeAllPermissionsFor,
    closeAllConnections,
    requestPermissions,
    getPermissions,
    terminatePlugin,
    terminateAllPlugins,
    hasPermission,
    executePlugin,
    getRpcMessageHandler,
    messenger,
    state,
    maxIdleTime = 30000,
    idleTimeCheckInterval = 5000,
  }: PluginControllerArgs) {
    super({
      messenger,
      metadata: {
        pluginErrors: {
          persist: false,
          anonymous: false,
        },
        inlinePluginIsRunning: {
          persist: false,
          anonymous: false,
        },
        pluginStates: {
          persist: true,
          anonymous: false,
        },
        plugins: {
          persist: (plugins) => {
            return Object.values(plugins)
              .map((plugin) => {
                return {
                  ...plugin,
                  status: pluginStatusStateMachineConfig.initial,
                };
              })
              .reduce((memo: Record<string, Plugin>, plugin) => {
                memo[plugin.name] = plugin;
                return memo;
              }, {});
          },
          anonymous: false,
        },
      },
      name,
      state: { ...defaultState, ...state },
    });

    this._removeAllPermissionsFor = removeAllPermissionsFor;
    this._closeAllConnections = closeAllConnections;
    this._requestPermissions = requestPermissions;
    this._getPermissions = getPermissions;
    this._hasPermission = hasPermission;

    this._terminatePlugin = terminatePlugin;
    this._terminateAllPlugins = terminateAllPlugins;
    this._executePlugin = executePlugin;
    this._getRpcMessageHandler = getRpcMessageHandler;
    this._onUnhandledPluginError = this._onUnhandledPluginError.bind(this);
    this._onUnresponsivePlugin = this._onUnresponsivePlugin.bind(this);

    this.messagingSystem.subscribe(
      'ServiceMessenger:unhandledError',
      this._onUnhandledPluginError,
    );

    this.messagingSystem.subscribe(
      'ServiceMessenger:unresponsive',
      this._onUnresponsivePlugin,
    );

    this._pluginsBeingAdded = new Map();
    this._maxIdleTime = maxIdleTime;
    this._idleTimeCheckInterval = idleTimeCheckInterval;
    this._pollForLastRequestStatus();
    this._lastRequestMap = new Map();
    this._rpcHandlerMap = new Map();
  }

  _pollForLastRequestStatus() {
    this._timeoutForLastRequestStatus = setTimeout(async () => {
      this._stopPluginsLastRequestPastMax();
      this._pollForLastRequestStatus();
    }, this._idleTimeCheckInterval);
  }

  _stopPluginsLastRequestPastMax() {
    this._lastRequestMap.forEach(async (val, pluginName) => {
      if (this._maxIdleTime && val > Date.now() - this._maxIdleTime) {
        this.stopPlugin(pluginName);
      }
    });
  }

  _onUnresponsivePlugin(pluginName: string) {
    this._transitionPluginState(pluginName, PluginStatusEvent.crash);
    this._stopPlugin(pluginName, false);
    this.addPluginError({
      code: -32001, // just made this code up
      message: 'Plugin Unresponsive',
      data: {
        pluginName,
      },
    });
  }

  _onUnhandledPluginError(pluginName: string, error: ErrorJSON) {
    this._transitionPluginState(pluginName, PluginStatusEvent.crash);
    this._stopPlugin(pluginName, false);
    this.addPluginError(error);
  }

  /**
   * Transitions between states using `pluginStatusStateMachineConfig` as the template to figure out the next state.
   * This transition function uses a very minimal subset of XState conventions:
   * - supports initial state
   * - .on supports raw event target string
   * - .on supports {target, cond} object
   * - the arguments for `cond` is the `SerializedPlugin` instead of Xstate convention of `(event, context) => boolean`
   * @param pluginName the name of the plugin to transition
   * @param event the event enum to use to transition
   */
  _transitionPluginState(pluginName: string, event: PluginStatusEvent) {
    const pluginStatus = this.state.plugins[pluginName].status;
    let nextStatus =
      (pluginStatusStateMachineConfig.states[pluginStatus].on as any)[event] ??
      pluginStatus;
    if (nextStatus.cond) {
      const cond = nextStatus.cond(this.state.plugins[pluginName]);
      if (cond === false) {
        throw new Error(
          `Condition failed for state transition "${pluginName}" with event "${event}".`,
        );
      }
    }

    if (nextStatus.target) {
      nextStatus = nextStatus.target;
    }

    if (nextStatus === pluginStatus) {
      return;
    }

    this.update((state: any) => {
      state.plugins[pluginName].status = nextStatus;
    });
  }

  /**
   * Runs existing (installed) plugins.
   * Deletes any plugins that cannot be started.
   */
  async runExistingPlugins(): Promise<void> {
    const { plugins } = this.state;

    if (Object.keys(plugins).length > 0) {
      console.log('Starting existing plugins...', plugins);
    } else {
      console.log('No existing plugins to run.');
      return;
    }

    await Promise.all(
      Object.values(plugins).map(async ({ name: pluginName, sourceCode }) => {
        console.log(`Starting: ${pluginName}`);

        try {
          await this._startPlugin({
            pluginName,
            sourceCode,
          });
        } catch (err) {
          console.warn(`Failed to start "${pluginName}", deleting it.`, err);
          // Clean up failed plugins:
          this.removePlugin(pluginName);
        }
      }),
    );
  }

  /**
   * Starts the given plugin. Throws an error if no such plugin exists
   * or if it is already running.
   *
   * @param pluginName - The name of the plugin to start.
   */
  async startPlugin(pluginName: string): Promise<void> {
    const plugin = this.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found.`);
    }

    if (this.state.plugins[pluginName].enabled === false) {
      throw new Error(`Plugin "${pluginName}" is disabled.`);
    }

    await this._startPlugin({
      pluginName,
      sourceCode: plugin.sourceCode,
    });
  }

  /**
   * Enables the given plugin. A plugin can only be started if it is enabled.
   *
   * @param pluginName - The name of the plugin to enable.
   */
  enablePlugin(pluginName: string): void {
    this.update((state: any) => {
      state.plugins[pluginName].enabled = true;
    });
  }

  /**
   * Disables the given plugin. A plugin can only be started if it is enabled.
   *
   * @param pluginName - The name of the plugin to disable.
   */
  disablePlugin(pluginName: string): void {
    this.stopPlugin(pluginName);
    this.update((state: any) => {
      state.plugins[pluginName].enabled = false;
    });
  }

  /**
   * Stops the given plugin. Throws an error if no such plugin exists
   * or if it is already stopped.
   *
   * @param pluginName - The name of the plugin to stop.
   */
  stopPlugin(pluginName: string): void {
    const plugin = this.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found.`);
    }

    if (!this.isRunning(pluginName)) {
      throw new Error(`Plugin "${pluginName}" already stopped.`);
    }

    this._stopPlugin(pluginName);
    console.log(`Plugin "${pluginName}" stopped.`);
  }

  /**
   * Stops the given plugin, removes all hooks, closes all connections, and
   * terminates its worker.
   *
   * @param pluginName - The name of the plugin to stop.
   * @param setNotRunning - Whether to mark the plugin as not running.
   * Should only be set to false if the plugin is about to be deleted.
   */
  private _stopPlugin(pluginName: string, setNotRunning = true): void {
    this._closeAllConnections(pluginName);
    this._terminatePlugin(pluginName);
    if (setNotRunning) {
      this._transitionPluginState(pluginName, PluginStatusEvent.stop);
    }
  }

  /**
   * Returns whether the given plugin is running.
   * Throws an error if the plugin doesn't exist.
   *
   * @param pluginName - The name of the plugin to check.
   */
  isRunning(pluginName: string): boolean {
    const plugin = this.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found.`);
    }

    return plugin.status === PluginStatus.running;
  }

  /**
   * Returns whether the given plugin has been added to state.
   *
   * @param pluginName - The name of the plugin to check for.
   */
  has(pluginName: string): boolean {
    return pluginName in this.state.plugins;
  }

  /**
   * Gets the plugin with the given name if it exists, including all data.
   * This should not be used if the plugin is to be serializable, as e.g.
   * the plugin sourceCode may be quite large.
   *
   * @param pluginName - The name of the plugin to get.
   */
  get(pluginName: string) {
    return this.state.plugins[pluginName];
  }

  /**
   * Gets the plugin with the given name if it exists, excluding any
   * non-serializable or expensive-to-serialize data.
   *
   * @param pluginName - The name of the plugin to get.
   */
  getSerializable(pluginName: string): SerializablePlugin | null {
    const plugin = this.get(pluginName);

    return plugin
      ? // The cast to "any" of the accumulator object is due to a TypeScript bug
        (Object.keys(plugin).reduce((serialized, key) => {
          if (SERIALIZABLE_PLUGIN_PROPERTIES.has(key as keyof Plugin)) {
            serialized[key] = plugin[key as keyof SerializablePlugin];
          }

          return serialized;
        }, {} as any) as SerializablePlugin)
      : null;
  }

  /**
   * Updates the own state of the plugin with the given name.
   * This is distinct from the state MetaMask uses to manage plugins.
   *
   * @param pluginName - The name of the plugin whose state should be updated.
   * @param newPluginState - The new state of the plugin.
   */
  async updatePluginState(
    pluginName: string,
    newPluginState: Json,
  ): Promise<void> {
    this.update((state: any) => {
      state.pluginStates[pluginName] = newPluginState;
    });
  }

  /**
   * Adds error from a plugin to the PluginControllers state.
   *
   * @param pluginError - The error to store on the PluginController
   */
  async addPluginError(pluginError: PluginError) {
    this.update((state: any) => {
      const id = nanoid();
      state.pluginErrors[id] = {
        ...pluginError,
        internalID: id,
      };
    });
  }

  /**
   * Removes an error by internalID from a the PluginControllers state.
   *
   * @param internalID - The internal error ID to remove on the PluginController
   */
  async removePluginError(internalID: string) {
    this.update((state: any) => {
      delete state.pluginErrors[internalID];
    });
  }

  /**
   * Clears all errors from the PluginControllers state.
   *
   */
  async clearPluginErrors() {
    this.update((state: any) => {
      state.pluginErrors = {};
    });
  }

  /**
   * Gets the own state of the plugin with the given name.
   * This is distinct from the state MetaMask uses to manage plugins.
   *
   * @param pluginName - The name of the plugin whose state to get.
   */
  async getPluginState(pluginName: string): Promise<Json> {
    return this.state.pluginStates[pluginName];
  }

  /**
   * Completely clear the controller's state: delete all associated data,
   * handlers, event listeners, and permissions; tear down all plugin providers.
   */
  clearState() {
    const pluginNames = Object.keys(this.state.plugins);
    pluginNames.forEach((pluginName) => {
      this._closeAllConnections(pluginName);
    });
    this._terminateAllPlugins();
    this._removeAllPermissionsFor(pluginNames);
    this.update((state: any) => {
      state.inlinePluginIsRunning = false;
      state.plugins = {};
      state.pluginStates = {};
    });
  }

  /**
   * Removes the given plugin from state, and clears all associated handlers
   * and listeners.
   *
   * @param pluginName - The name of the plugin.
   */
  removePlugin(pluginName: string): void {
    this.removePlugins([pluginName]);
  }

  /**
   * Stops the given plugins, removes them from state, and clears all associated
   * permissions, handlers, and listeners.
   *
   * @param {Array<string>} pluginName - The name of the plugins.
   */
  removePlugins(pluginNames: string[]): void {
    if (!Array.isArray(pluginNames)) {
      throw new Error('Expected array of plugin names.');
    }

    this.update((state: any) => {
      pluginNames.forEach((pluginName) => {
        this._stopPlugin(pluginName, false);
        this._rpcHandlerMap.delete(pluginName);
        delete state.plugins[pluginName];
        delete state.pluginStates[pluginName];
      });
    });

    this._removeAllPermissionsFor(pluginNames);
  }

  /**
   * Gets the serialized permitted plugins of the given origin, if any.
   * @param origin - The origin whose permitted plugins to retrieve.
   */
  getPermittedPlugins(origin: string): InstallPluginsResult {
    return this._getPermissions(origin).reduce((permittedPlugins, perm) => {
      if (perm.parentCapability.startsWith(PLUGIN_PREFIX)) {
        const pluginName = perm.parentCapability.replace(
          PLUGIN_PREFIX_REGEX,
          '',
        );
        const plugin = this.getSerializable(pluginName);

        permittedPlugins[pluginName] = plugin || {
          error: serializeError(
            new Error('Plugin permitted but not installed.'),
          ),
        };
      }
      return permittedPlugins;
    }, {} as InstallPluginsResult);
  }

  /**
   * Installs the plugins requested by the given origin, returning the plugin
   * object if the origin is permitted to install it, and an authorization error
   * otherwise.
   *
   * @param origin - The origin that requested to install the plugins.
   * @param requestedPlugins - The plugins to install.
   * @returns An object of plugin names and plugin objects, or errors if a
   * plugin couldn't be installed.
   */
  async installPlugins(
    origin: string,
    requestedPlugins: RequestedPluginPermissions,
  ): Promise<InstallPluginsResult> {
    const result: InstallPluginsResult = {};

    // use a for-loop so that we can return an object and await the resolution
    // of each call to processRequestedPlugin
    await Promise.all(
      Object.keys(requestedPlugins).map(async (pluginName) => {
        const permissionName = PLUGIN_PREFIX + pluginName;

        if (this._hasPermission(origin, permissionName)) {
          // attempt to install and run the plugin, storing any errors that
          // occur during the process
          result[pluginName] = {
            ...(await this.processRequestedPlugin(pluginName)),
          };
        } else {
          // only allow the installation of permitted plugins
          result[pluginName] = {
            error: ethErrors.provider.unauthorized(
              `Not authorized to install plugin '${pluginName}'. Request the permission for the plugin before attempting to install it.`,
            ),
          };
        }
      }),
    );
    return result;
  }

  /**
   * Adds, authorizes, and runs the given plugin with a plugin provider.
   * Results from this method should be efficiently serializable.
   *
   * @param - pluginName - The name of the plugin.
   * @returns The resulting plugin object, or an error if something went wrong.
   */
  async processRequestedPlugin(
    pluginName: string,
  ): Promise<ProcessPluginReturnType> {
    // if the plugin is already installed and active, just return it
    const plugin = this.get(pluginName);
    if (plugin?.status !== PluginStatus.running) {
      return this.getSerializable(pluginName) as SerializablePlugin;
    }

    try {
      const { sourceCode } = await this.add({
        name: pluginName,
        manifestUrl: pluginName,
      });

      await this.authorize(pluginName);

      await this._startPlugin({
        pluginName,
        sourceCode,
      });

      return this.getSerializable(pluginName) as SerializablePlugin;
    } catch (err) {
      console.error(`Error when adding plugin.`, err);
      return { error: serializeError(err) };
    }
  }

  /**
   * Returns a promise representing the complete installation of the requested plugin.
   * If the plugin is already being installed, the previously pending promise will be returned.
   *
   * @param pluginName - The name of the plugin.
   * @param args - Object containing either the URL of the plugin's manifest,
   * or the plugin's manifest and source code.
   * @returns The resulting plugin object.
   */
  add(args: AddPluginArgs): Promise<Plugin> {
    const { name: pluginName } = args;
    if (!pluginName || typeof pluginName !== 'string') {
      throw new Error(`Invalid plugin name: ${pluginName}`);
    }

    if (
      !args ||
      (!('manifestUrl' in args) &&
        (!('manifest' in args) || !('sourceCode' in args)))
    ) {
      throw new Error(`Invalid add plugin args for plugin "${pluginName}".`);
    }

    if (!this._pluginsBeingAdded.has(pluginName)) {
      console.log(`Adding plugin: ${pluginName}`);
      this._pluginsBeingAdded.set(pluginName, this._add(args));
    }

    return this._pluginsBeingAdded.get(pluginName) as Promise<Plugin>;
  }

  private async _startPlugin(pluginData: PluginData) {
    const { pluginName } = pluginData;
    if (this.isRunning(pluginName)) {
      throw new Error(`Plugin "${pluginName}" is already started.`);
    }

    const result = await this._executePlugin(pluginData);
    this._transitionPluginState(pluginName, PluginStatusEvent.start);
    return result;
  }

  /**
   * Internal method. See the "add" method.
   *
   * @param pluginName - The name of the plugin.
   * @param args - The add plugin args.
   * @returns The resulting plugin object.
   */
  private async _add(args: AddPluginArgs): Promise<Plugin> {
    const { name: pluginName } = args;

    let manifest: PluginManifest, sourceCode: string;
    if ('manifestUrl' in args) {
      const _sourceUrl = args.manifestUrl || pluginName;
      [manifest, sourceCode] = await this._fetchPlugin(pluginName, _sourceUrl);
    } else {
      manifest = args.manifest;
      sourceCode = args.sourceCode;
    }

    if (typeof sourceCode !== 'string' || sourceCode.length === 0) {
      throw new Error(`Invalid source code for plugin "${pluginName}".`);
    }

    const initialPermissions = manifest?.web3Wallet?.initialPermissions;
    if (
      !initialPermissions ||
      typeof initialPermissions !== 'object' ||
      Array.isArray(initialPermissions)
    ) {
      throw new Error(
        `Invalid initial permissions for plugin "${pluginName}".`,
      );
    }

    let plugin: Plugin = {
      initialPermissions,
      name: pluginName,
      permissionName: PLUGIN_PREFIX + pluginName, // so we can easily correlate them
      sourceCode,
      version: manifest.version,
      enabled: true,
      status: pluginStatusStateMachineConfig.initial,
    };

    const pluginsState = this.state.plugins;

    // restore relevant plugin state if it exists
    if (pluginsState[pluginName]) {
      plugin = { ...pluginsState[pluginName], ...plugin };
    }

    // store the plugin back in state
    this.update((state: any) => {
      state.plugins[pluginName] = plugin;
    });

    return plugin;
  }

  /**
   * Fetches the manifest and source code of a plugin.
   *
   * @param name - The name of the plugin.
   * @param manifestUrl - The URL of the plugin's manifest file.
   * @returns An array of the plugin manifest object and the plugin source code.
   */
  private async _fetchPlugin(
    pluginName: string,
    manifestUrl: string,
  ): Promise<[PluginManifest, string]> {
    try {
      console.log(`Fetching plugin manifest from: ${manifestUrl}`);
      const pluginSource = await fetch(manifestUrl);
      const manifest = await pluginSource.json();

      console.log(`Destructuring plugin: `, manifest);
      const {
        web3Wallet: { bundle },
      } = manifest;

      console.log(`Fetching plugin source code from: ${bundle.url}`);
      const pluginBundle = await fetch(bundle.url);
      const sourceCode = await pluginBundle.text();

      return [manifest, sourceCode];
    } catch (err) {
      throw new Error(
        `Problem fetching plugin "${pluginName}": ${(err as Error).message}`,
      );
    }
  }

  /**
   * Initiates a request for the given plugin's initial permissions.
   * Must be called in order. See processRequestedPlugin.
   *
   * @param pluginName - The name of the plugin.
   * @returns The plugin's approvedPermissions.
   */
  async authorize(pluginName: string): Promise<string[]> {
    console.log(`Authorizing plugin: ${pluginName}`);
    const pluginsState = this.state.plugins;
    const plugin = pluginsState[pluginName];
    const { initialPermissions } = plugin;

    // Don't prompt if there are no permissions requested:
    if (Object.keys(initialPermissions).length === 0) {
      return [];
    }

    if (initialPermissions === null) {
      return [];
    }

    try {
      const approvedPermissions = await this._requestPermissions(
        pluginName,
        initialPermissions,
      );
      return approvedPermissions.map((perm) => perm.parentCapability);
    } finally {
      this._pluginsBeingAdded.delete(pluginName);
    }
  }

  /**
   * Test method.
   */
  runInlinePlugin(inlinePluginName: keyof typeof INLINE_PLUGINS = 'IDLE') {
    this._startPlugin({
      pluginName: 'inlinePlugin',
      sourceCode: INLINE_PLUGINS[inlinePluginName],
    });

    this.update((state: any) => {
      state.inlinePluginIsRunning = true;
    });
  }

  /**
   * Test method.
   */
  removeInlinePlugin() {
    this.update((state: any) => {
      state.inlinePluginIsRunning = false;
    });
    this.removePlugin('inlinePlugin');
  }

  destroy() {
    super.destroy();

    if (this._timeoutForLastRequestStatus) {
      clearTimeout(this._timeoutForLastRequestStatus);
    }

    this.messagingSystem.unsubscribe(
      'ServiceMessenger:unhandledError',
      this._onUnhandledPluginError,
    );

    this.messagingSystem.unsubscribe(
      'ServiceMessenger:unresponsive',
      this._onUnresponsivePlugin,
    );
  }

  /**
   * Gets the RPC message handler for the given plugin.
   *
   * @param pluginName - The name of the plugin whose message handler to get.
   */
  async getRpcMessageHandler(
    pluginName: string,
  ): Promise<
    (origin: string, request: Record<string, unknown>) => Promise<unknown>
  > {
    const existingHandler = this._rpcHandlerMap.get(pluginName);
    if (existingHandler) {
      return existingHandler;
    }

    const rpcHandler = async (
      origin: string,
      request: Record<string, unknown>,
    ) => {
      let handler = await this._getRpcMessageHandler(pluginName);

      if (this.state.plugins[pluginName].enabled === false) {
        throw new Error(`Plugin "${pluginName}" is disabled.`);
      }

      if (!handler && this.isRunning(pluginName) === false) {
        // cold start
        await this.startPlugin(pluginName);
        handler = await this._getRpcMessageHandler(pluginName);
      }

      if (!handler) {
        throw new Error(
          `Snap execution service returned no RPC handler for running snap "${pluginName}".`,
        );
      }

      this._recordPluginRpcRequest(pluginName);
      return handler(origin, request);
    };

    this._rpcHandlerMap.set(pluginName, rpcHandler);
    return rpcHandler;
  }

  private _recordPluginRpcRequest(pluginName: string) {
    this._lastRequestMap.set(pluginName, Date.now());
  }
}
