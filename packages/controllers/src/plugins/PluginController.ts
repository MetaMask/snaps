/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { ethErrors, serializeError } from 'eth-rpc-errors';
import { IOcapLdCapability } from 'rpc-cap/dist/src/@types/ocap-ld';
import { nanoid } from 'nanoid';
import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import { Json, JsonRpcRequest } from 'json-rpc-engine';
import { PluginData } from '@mm-snap/types';
import { PluginWorkerMetadata } from '../workers/WorkerController';
import { INLINE_PLUGINS } from './inlinePlugins';

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

export interface SerializablePlugin {
  initialPermissions: RequestedPluginPermissions;
  name: string;
  permissionName: string;
  version: string;
}

export interface Plugin extends SerializablePlugin {
  isRunning: boolean;
  sourceCode: string;
}

// The plugin is the callee
export type PluginRpcHook = (
  origin: string,
  request: Record<string, unknown>,
) => Promise<unknown>;

export type ProcessPluginReturnType =
  | SerializablePlugin
  | { error: ReturnType<typeof serializeError> };
export interface InstallPluginsResult {
  [pluginName: string]: ProcessPluginReturnType;
}

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
type TerminateWorkerOf = (pluginName: string) => void;
type Command = (
  workerId: string,
  message: JsonRpcRequest<unknown>,
) => Promise<unknown>;
type TerminateAll = () => void;
type CreatePluginWorker = (metadate: PluginWorkerMetadata) => Promise<string>;
type StartPlugin = (
  workerId: string,
  pluginData: PluginData,
) => Promise<unknown>;

type StoredPlugins = Record<string, Plugin>;

export type PluginControllerState = {
  inlinePluginIsRunning: boolean;
  plugins: StoredPlugins;
  pluginStates: {
    [id: string]: Json;
  };
};

export interface PluginControllerMemState {
  inlinePluginIsRunning: boolean;
  plugins: Record<string, SerializablePlugin>;
  pluginStates: {
    [id: string]: Json;
  };
}

interface PluginControllerArgs {
  messenger: RestrictedControllerMessenger<string, any, any, string, string>;
  state: PluginControllerState;
  removeAllPermissionsFor: RemoveAllPermissionsFunction;
  closeAllConnections: CloseAllConnectionsFunction;
  requestPermissions: RequestPermissionsFunction;
  getPermissions: GetPermissionsFunction;
  hasPermission: HasPermissionFunction;
  terminateWorkerOf: TerminateWorkerOf;
  command: Command;
  terminateAll: TerminateAll;
  createPluginWorker: CreatePluginWorker;
  startPlugin: StartPlugin;
}

interface AddPluginBase {
  name: string;
}

interface AddPluginByFetchingArgs extends AddPluginBase {
  manifestUrl: string;
}

// The parts of a plugin package.json file that we care about
interface PluginManifest {
  version: string;
  web3Wallet: { initialPermissions: RequestedPluginPermissions };
}

interface AddPluginDirectlyArgs extends AddPluginBase {
  manifest: PluginManifest;
  sourceCode: string;
}

type AddPluginArgs = AddPluginByFetchingArgs | AddPluginDirectlyArgs;

const defaultState: PluginControllerState = {
  inlinePluginIsRunning: false,
  plugins: {},
  pluginStates: {},
};

const name = 'PluginController';

/*
 * A plugin is initialized in three phases:
 * - Add: Loads the plugin from a remote source and parses it.
 * - Authorize: Requests the plugin's required permissions from the user.
 * - Start: Initializes the plugin in its SES realm with the authorized permissions.
 */

export class PluginController extends BaseController<
  string,
  PluginControllerState
> {
  private _removeAllPermissionsFor: RemoveAllPermissionsFunction;

  private _pluginRpcHooks: Map<string, PluginRpcHook>;

  private _closeAllConnections: CloseAllConnectionsFunction;

  private _requestPermissions: RequestPermissionsFunction;

  private _getPermissions: GetPermissionsFunction;

  private _hasPermission: HasPermissionFunction;

  private _terminateWorkerOf: TerminateWorkerOf;

  private _command: Command;

  private _terminateAll: TerminateAll;

  private _createPluginWorker: CreatePluginWorker;

  private _startPlugin: StartPlugin;

  private _pluginsBeingAdded: Map<string, Promise<Plugin>>;

  constructor({
    removeAllPermissionsFor,
    closeAllConnections,
    requestPermissions,
    getPermissions,
    terminateWorkerOf,
    terminateAll,
    hasPermission,
    createPluginWorker,
    startPlugin,
    command,
    messenger,
    state,
  }: PluginControllerArgs) {
    super({
      messenger,
      metadata: {
        inlinePluginIsRunning: {
          persist: false,
          anonymous: false,
        },
        pluginStates: {
          persist: true,
          anonymous: false,
        },
        plugins: {
          persist: true,
          anonymous: false,
        },
      },
      name,
      state: { ...defaultState, ...state },
    });

    this.update((_state: any) => {
      _state.inlinePluginIsRunning = state.inlinePluginIsRunning;
      _state.plugins = state.plugins;
      _state.pluginStates = state.pluginStates;
    });

    this._removeAllPermissionsFor = removeAllPermissionsFor;
    this._closeAllConnections = closeAllConnections;
    this._requestPermissions = requestPermissions;
    this._getPermissions = getPermissions;
    this._hasPermission = hasPermission;

    this._terminateWorkerOf = terminateWorkerOf;
    this._terminateAll = terminateAll;
    this._createPluginWorker = createPluginWorker;
    this._startPlugin = startPlugin;
    this._command = command;

    this._pluginRpcHooks = new Map();
    this._pluginsBeingAdded = new Map();
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
          await this._startPluginInWorker(pluginName, sourceCode);
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
    if (plugin.isRunning) {
      throw new Error(`Plugin "${pluginName}" already running.`);
    }

    try {
      await this._startPluginInWorker(pluginName, plugin.sourceCode);
    } catch (err) {
      console.error(`Failed to start "${pluginName}".`, err);
    }
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
    if (!plugin.isRunning) {
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
    this._removePluginHooks(pluginName);
    this._closeAllConnections(pluginName);
    this._terminateWorkerOf(pluginName);
    if (setNotRunning) {
      this._setPluginToNotRunning(pluginName);
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

    return plugin.isRunning;
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
      state[pluginName] = newPluginState;
    });
  }

  /**
   * Gets the own state of the plugin with the given name.
   * This is distinct from the state MetaMask uses to manage plugins.
   *
   * @param pluginName - The name of the plugin whose state to get.
   */
  async getPluginState(pluginName: string): Promise<unknown> {
    return this.state.pluginStates[pluginName];
  }

  /**
   * Completely clear the controller's state: delete all associated data,
   * handlers, event listeners, and permissions; tear down all plugin providers.
   */
  clearState() {
    this._pluginRpcHooks.clear();
    const pluginNames = Object.keys(this.state.plugins);
    pluginNames.forEach((pluginName) => {
      this._closeAllConnections(pluginName);
    });
    this._terminateAll();
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

    const newPlugins = { ...this.state.plugins };
    const newPluginStates = { ...this.state.pluginStates };

    pluginNames.forEach((pluginName) => {
      this._stopPlugin(pluginName, false);
      delete newPlugins[pluginName];
      delete newPluginStates[pluginName];
    });
    this._removeAllPermissionsFor(pluginNames);

    this.update((state: any) => {
      state.plugins = newPlugins;
      state.pluginStates = newPluginStates;
    });
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
    if (plugin?.isRunning) {
      return this.getSerializable(pluginName) as SerializablePlugin;
    }

    try {
      const { sourceCode } = await this.add({
        name: pluginName,
        manifestUrl: pluginName,
      });

      await this.authorize(pluginName);

      await this._startPluginInWorker(pluginName, sourceCode);

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
      isRunning: false,
      name: pluginName,
      permissionName: PLUGIN_PREFIX + pluginName, // so we can easily correlate them
      sourceCode,
      version: manifest.version,
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
        `Problem fetching plugin "${pluginName}": ${err.message}`,
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
    this._startPluginInWorker('inlinePlugin', INLINE_PLUGINS[inlinePluginName]);
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

  private async _startPluginInWorker(pluginName: string, sourceCode: string) {
    const workerId = await this._createPluginWorker({
      hostname: pluginName,
    });
    this._createPluginHooks(pluginName, workerId);
    await this._startPlugin(workerId, {
      pluginName,
      sourceCode,
    });
    this._setPluginToRunning(pluginName);
  }

  /**
   * Gets the RPC message handler for the given plugin.
   *
   * @param pluginName - The name of the plugin whose message handler to get.
   */
  getRpcMessageHandler(pluginName: string): PluginRpcHook | undefined {
    return this._pluginRpcHooks.get(pluginName);
  }

  private _createPluginHooks(pluginName: string, workerId: string) {
    const rpcHook = async (
      origin: string,
      request: Record<string, unknown>,
    ) => {
      return await this._command(workerId, {
        id: nanoid(),
        jsonrpc: '2.0',
        method: 'pluginRpc',
        params: {
          origin,
          request,
          target: pluginName,
        },
      });
    };

    this._pluginRpcHooks.set(pluginName, rpcHook);
  }

  private _removePluginHooks(pluginName: string) {
    this._pluginRpcHooks.delete(pluginName);
  }

  private _setPluginToRunning(pluginName: string): void {
    this._updatePlugin(pluginName, 'isRunning', true);
  }

  private _setPluginToNotRunning(pluginName: string): void {
    this._updatePlugin(pluginName, 'isRunning', false);
  }

  private _updatePlugin(
    pluginName: string,
    property: keyof Plugin,
    value: unknown,
  ) {
    const { plugins } = this.state;
    const plugin = plugins[pluginName];
    const newPlugin = { ...plugin, [property]: value };
    const newPlugins = { ...plugins, [pluginName]: newPlugin };
    this.update((state: any) => {
      state.plugins = newPlugins;
    });
  }
}
