import { ObservableStore } from '@metamask/obs-store';
import EventEmitter from '@metamask/safe-event-emitter';
import { serializeError } from 'eth-rpc-errors';
import { IOcapLdCapability } from 'rpc-cap/dist/src/@types/ocap-ld';
import { IRequestedPermissions } from 'rpc-cap/dist/src/@types';

import { WorkerController, SetupWorkerConnection } from '../workers/WorkerController';
import { CommandResponse } from '../workers/CommandEngine';
import { INLINE_PLUGINS } from './inlinePlugins';

const PLUGIN_PREFIX = 'wallet_plugin_';

// eslint-disable-next-line no-shadow
enum PLUGIN_API_HOOKS {
  GET_STATE = 'getState',
  UPDATE_STATE = 'updateState',
  GET_APP_KEY = 'getAppKey',
}

const SERIALIZABLE_PLUGIN_PROPERTIES = {
  // we include excluded prop names for completeness
  initialPermissions: true,
  name: true,
  permissionName: true,
  isActive: false,
  sourceCode: false,
};

interface SerializablePlugin {
  initialPermissions: { [permission: string]: Record<string, unknown> };
  name: string;
  permissionName: string;
}

interface Plugin extends SerializablePlugin {
  isActive: boolean;
  sourceCode: string;
}

// The plugin is the callee
type PluginRpcHook = (origin: string, request: Record<string, unknown>) => Promise<CommandResponse>;

// The plugin is the caller
export interface PluginApiHooks {
  [PLUGIN_API_HOOKS.GET_STATE]: () => Promise<unknown>;
  [PLUGIN_API_HOOKS.UPDATE_STATE]: (newState: unknown) => Promise<void>;
  [PLUGIN_API_HOOKS.GET_APP_KEY]: (requestedAccount?: string) => Promise<string>;
}

export type GetPluginApiHookFunction = PluginController['getPluginApiHook'];

// Types that probably should be defined elsewhere in prod
type RemoveAllPermissionsFunction = (pluginIds: string[]) => void;
type GetPermissionsFunction = (pluginId: string) => IOcapLdCapability[];
type GetAppKeyFunction = (domain: string, requestedAccount?: string) => Promise<string>;
type CloseAllConnectionsFunction = (domain: string) => void;
type RequestPermissionsFunction = (domain: string, requestedPermissions: IRequestedPermissions) => IOcapLdCapability[];

interface StoredPlugins {
  [pluginId: string]: Plugin;
}

interface PluginControllerState {
  plugins: StoredPlugins;
  pluginStates: Record<string, unknown>;
}

interface PluginControllerMemState {
  inlinePluginIsRunning: boolean;
  plugins: { [pluginId: string]: SerializablePlugin };
  pluginStates: Record<string, unknown>;
}

interface PluginControllerArgs {
  initState: Partial<PluginControllerState>;
  removeAllPermissionsFor: RemoveAllPermissionsFunction;
  getPermissionsFor: GetPermissionsFunction;
  setupWorkerPluginProvider: SetupWorkerConnection;
  getAppKeyForDomain: GetAppKeyFunction;
  closeAllConnections: CloseAllConnectionsFunction;
  requestPermissions: RequestPermissionsFunction;
}

/*
 * A plugin is initialized in three phases:
 * - Add: Loads the plugin from a remote source and parses it.
 * - Authorize: Requests the plugin's required permissions from the user.
 * - Start: Initializes the plugin in its SES realm with the authorized permissions.
 */

export default class PluginController extends EventEmitter {

  // TODO:2021:Q1 use generic obs-store and remove casts from every call
  // related to the store or memStore
  public store: ObservableStore<PluginControllerState>;

  public memStore: ObservableStore<PluginControllerMemState>;

  private workerController: WorkerController;

  private _removeAllPermissionsFor: RemoveAllPermissionsFunction;

  private _getPermissionsFor: GetPermissionsFunction;

  private _pluginRpcHooks: Map<string, PluginRpcHook>;

  private _pluginApiHooks: Map<string, PluginApiHooks>;

  private _getAppKeyForDomain: GetAppKeyFunction;

  private _closeAllConnections: CloseAllConnectionsFunction;

  private _requestPermissions: RequestPermissionsFunction;

  private _pluginsBeingAdded: Map<string, Promise<Plugin>>;

  constructor({
    initState,
    setupWorkerPluginProvider,
    removeAllPermissionsFor,
    getPermissionsFor,
    getAppKeyForDomain,
    closeAllConnections,
    requestPermissions,
  }: PluginControllerArgs) {

    super();
    const _initState: PluginControllerState = {
      plugins: {},
      pluginStates: {},
      ...initState,
    };
    this.store = new ObservableStore({
      plugins: {},
      pluginStates: {},
    });
    this.memStore = new ObservableStore({
      inlinePluginIsRunning: false,
      plugins: {},
      pluginStates: {},
    });
    this.updateState(_initState);

    this.workerController = new WorkerController({
      setupWorkerConnection: setupWorkerPluginProvider,
    });

    this._removeAllPermissionsFor = removeAllPermissionsFor;
    this._getPermissionsFor = getPermissionsFor;
    this._getAppKeyForDomain = getAppKeyForDomain;
    this._closeAllConnections = closeAllConnections;
    this._requestPermissions = requestPermissions;

    this._pluginRpcHooks = new Map();
    this._pluginApiHooks = new Map();
    this._pluginsBeingAdded = new Map();
  }

  updateState(newState: Partial<PluginControllerState>) {
    this.store.updateState(newState);
    this.memStore.updateState(this._filterMemStoreState(newState));
  }

  _filterMemStoreState(newState: Partial<PluginControllerState>): Partial<PluginControllerMemState> {
    const memState: Partial<PluginControllerMemState> = {
      ...newState,
      plugins: {},
    };

    // remove sourceCode from memState plugin objects
    if (newState.plugins) {
      Object.keys(newState.plugins).forEach((name) => {
        const plugin = { ...(newState as PluginControllerState).plugins[name] };
        delete (plugin as Partial<Plugin>).sourceCode;
        (memState as PluginControllerMemState).plugins[name] = plugin;
      });
    }

    return memState;
  }

  /**
   * Runs existing (installed) plugins.
   */
  runExistingPlugins(): void {

    const { plugins } = this.store.getState();

    if (Object.keys(plugins).length > 0) {
      console.log('running existing plugins', plugins);
    } else {
      console.log('no existing plugins to run');
      return;
    }

    Object.values(plugins).forEach(({ name: pluginName, sourceCode }) => {

      console.log(`running: ${pluginName}`);

      try {
        this._startPluginInWorker(pluginName, sourceCode);
      } catch (err) {

        console.warn(`failed to start '${pluginName}', deleting it`);
        // Clean up failed plugins:
        this.removePlugin(pluginName);
      }
    });
  }

  /**
   * Gets the plugin with the given name if it exists, including all data.
   * This should not be used if the plugin is to be serializable, as e.g.
   * the plugin sourceCode may be quite large.
   *
   * @param pluginName - The name of the plugin to get.
   */
  get(pluginName: string) {
    return this.store.getState().plugins[pluginName];
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
      ? Object.keys(plugin).reduce((acc, key) => {
        if (SERIALIZABLE_PLUGIN_PROPERTIES[key as keyof Plugin]) {
          acc[key] = plugin[key as keyof SerializablePlugin];
        }

        return acc;
      }, {} as any) as SerializablePlugin
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
    newPluginState: unknown,
  ): Promise<void> {
    const state = this.store.getState();

    const newPluginStates = { ...state.pluginStates, [pluginName]: newPluginState };

    this.updateState({
      pluginStates: newPluginStates,
    });
  }

  /**
   * Gets the own state of the plugin with the given name.
   * This is distinct from the state MetaMask uses to manage plugins.
   *
   * @param pluginName - The name of the plugin whose state to get.
   */
  async getPluginState(pluginName: string): Promise<unknown> {
    return this.store.getState().pluginStates[pluginName];
  }

  /**
   * Completely clear the controller's state: delete all associated data,
   * handlers, event listeners, and permissions; tear down all plugin providers.
   */
  clearState() {
    // this._removeAllMetaMaskEventListeners()
    // this.rpcMessageHandlers.clear()
    // this.accountMessageHandlers.clear()
    this._pluginRpcHooks.clear();
    this._pluginApiHooks.clear();
    const pluginNames = Object.keys((this.store.getState()).plugins);
    this.updateState({
      plugins: {},
      pluginStates: {},
    });
    pluginNames.forEach((name) => {
      this._closeAllConnections(name);
    });
    this.workerController.terminateAll();
    this._removeAllPermissionsFor(pluginNames);
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
   * Removes the given plugins from state, and clears all associated handlers
   * and listeners.
   *
   * @param {Array<string>} pluginName - The name of the plugins.
   */
  removePlugins(pluginNames: string[]): void {

    if (!Array.isArray(pluginNames)) {
      throw new Error('Expected Array of plugin names.');
    }

    const state = this.store.getState();
    const newPlugins = { ...state.plugins };
    const newPluginStates = { ...state.pluginStates };

    pluginNames.forEach((name) => {
      // this._removeMetaMaskEventListeners(name)
      // this.rpcMessageHandlers.delete(name)
      // this.accountMessageHandlers.delete(name)
      this._removePluginHooks(name);
      this._closeAllConnections(name);
      this.workerController.terminateWorkerOf(name);
      delete newPlugins[name];
      delete newPluginStates[name];
    });
    this._removeAllPermissionsFor(pluginNames);

    this.updateState({
      plugins: newPlugins,
      pluginStates: newPluginStates,
    });
  }

  /**
   * Adds, authorizes, and runs the given plugin with a plugin provider.
   * Results from this method should be efficiently serializable.
   *
   * @param - pluginName - The name of the plugin.
   */
  async processRequestedPlugin(pluginName: string): Promise<
  SerializablePlugin |
  { error: ReturnType<typeof serializeError> }
  > {

    // if the plugin is already installed and active, just return it
    const plugin = this.get(pluginName);
    if (plugin?.isActive) {
      return this.getSerializable(pluginName) as SerializablePlugin;
    }

    try {
      const { sourceCode } = await this.add(pluginName);

      await this.authorize(pluginName);

      await this._startPluginInWorker(pluginName, sourceCode);

      return this.getSerializable(pluginName) as SerializablePlugin;

    } catch (err) {
      console.warn(`Error when adding plugin:`, err);
      return { error: serializeError(err) };
    }
  }

  /**
   * Returns a promise representing the complete installation of the requested plugin.
   * If the plugin is already being installed, the previously pending promise will be returned.
   *
   * @param pluginName - The name of the plugin.
   * @param sourceUrl - The URL of the source code.
   */
  add(pluginName: string, sourceUrl?: string): Promise<Plugin> {
    console.log(`Adding ${sourceUrl || pluginName}`);

    // Deduplicate multiple add requests:
    if (!this._pluginsBeingAdded.has(pluginName)) {
      this._pluginsBeingAdded.set(pluginName, this._add(pluginName));
    }

    return this._pluginsBeingAdded.get(pluginName) as Promise<Plugin>;
  }

  /**
   * Internal method. See the add method.
   *
   * @param pluginName - The name of the plugin.
   * @param [sourceUrl] - The URL of the source code.
   */
  async _add(pluginName: string, sourceUrl?: string): Promise<Plugin> {

    const _sourceUrl = sourceUrl || pluginName;

    if (!pluginName || typeof pluginName !== 'string') {
      throw new Error(`Invalid plugin name: ${pluginName}`);
    }

    let plugin: Plugin;
    try {
      console.log(`Fetching ${_sourceUrl}`);
      const pluginSource = await fetch(_sourceUrl);
      const pluginJson = await pluginSource.json();

      console.log(`Destructuring`, pluginJson);
      const { web3Wallet: { bundle, initialPermissions } } = pluginJson;

      console.log(`Fetching bundle ${bundle.url}`);
      const pluginBundle = await fetch(bundle.url);
      const sourceCode = await pluginBundle.text();

      console.log(`Constructing plugin`);
      plugin = {
        // manifest: {}, // relevant manifest metadata
        name: pluginName,
        initialPermissions,
        permissionName: PLUGIN_PREFIX + pluginName, // so we can easily correlate them
        sourceCode,
        isActive: false,
      };
    } catch (err) {
      throw new Error(`Problem loading plugin ${pluginName}: ${err.message}`);
    }

    const pluginsState = this.store.getState().plugins;

    // restore relevant plugin state if it exists
    if (pluginsState[pluginName]) {
      plugin = { ...pluginsState[pluginName], ...plugin };
    }

    // store the plugin back in state
    this.updateState({
      plugins: {
        ...pluginsState,
        [pluginName]: plugin,
      },
    });

    return plugin;
  }

  /**
   * Initiates a request for the given plugin's initial permissions.
   * Must be called in order. See processRequestedPlugin.
   *
   * @param pluginName - The name of the plugin.
   * @returns - Resolves to the plugin's approvedPermissions, or rejects on error.
   */
  async authorize(pluginName: string): Promise<string[]> {
    console.log(`authorizing ${pluginName}`);
    const pluginsState = this.store.getState().plugins;
    const plugin = pluginsState[pluginName];
    const { initialPermissions } = plugin;

    // Don't prompt if there are no permissions requested:
    if (Object.keys(initialPermissions).length === 0) {
      return [];
    }

    try {
      const approvedPermissions = await this._requestPermissions(
        pluginName, initialPermissions,
      );
      return approvedPermissions.map((perm) => perm.parentCapability);
    } finally {
      this._pluginsBeingAdded.delete(pluginName);
    }
  }

  // _registerAccountMessageHandler (pluginName, handler) {
  //   this.accountMessageHandlers.set(pluginName, handler)
  // }

  runInlineWorkerPlugin(inlinePluginName: keyof typeof INLINE_PLUGINS = 'IDLE') {
    this._startPluginInWorker(
      'inlinePlugin',
      INLINE_PLUGINS[inlinePluginName],
    );
    this.memStore.updateState({
      inlinePluginIsRunning: true,
    });
  }

  removeInlineWorkerPlugin() {
    this.memStore.updateState({
      inlinePluginIsRunning: false,
    });
    this.removePlugin('inlinePlugin');
  }

  private async _startPluginInWorker(pluginName: string, sourceCode: string) {
    const workerId = await this.workerController.createPluginWorker(
      { hostname: pluginName },
    );
    this._createPluginHooks(pluginName, workerId);
    await this.workerController.startPlugin(workerId, {
      pluginName,
      sourceCode,
    });
    this._setPluginToActive(pluginName);
  }

  getRpcMessageHandler(pluginName: string): PluginRpcHook | undefined {
    return this._pluginRpcHooks.get(pluginName);
  }

  getPluginApiHook <T extends keyof PluginApiHooks>(
    pluginName: string,
    hookName: T,
  ): PluginApiHooks[T] | undefined {
    return this._pluginApiHooks.get(pluginName)?.[hookName];
  }

  private _createPluginHooks(pluginName: string, workerId: string) {
    const rpcHook = async (origin: string, request: Record<string, unknown>) => {
      return await this.workerController.command(workerId, {
        command: 'pluginRpc',
        data: {
          origin,
          request,
          target: pluginName,
        },
      });
    };

    const getStateHook = async () => await this.getPluginState(pluginName);
    const updateStateHook = async (newState: unknown) => {
      await this.updatePluginState(pluginName, newState);
    };
    const getAppKeyHook = async (requestedAccount?: string) => await this._getAppKeyForDomain(pluginName, requestedAccount);

    this._pluginRpcHooks.set(pluginName, rpcHook);
    this._pluginApiHooks.set(pluginName, {
      [PLUGIN_API_HOOKS.GET_STATE]: getStateHook,
      [PLUGIN_API_HOOKS.UPDATE_STATE]: updateStateHook,
      [PLUGIN_API_HOOKS.GET_APP_KEY]: getAppKeyHook,
    });
  }

  _removePluginHooks(pluginName: string) {
    this._pluginRpcHooks.delete(pluginName);
    this._pluginApiHooks.delete(pluginName);
  }

  _setPluginToActive(pluginName: string): void {
    this._updatePlugin(pluginName, 'isActive', true);
  }

  _setPluginToInActive(pluginName: string): void {
    this._updatePlugin(pluginName, 'isActive', false);
  }

  _updatePlugin(pluginName: string, property: keyof Plugin, value: unknown) {
    const { plugins } = this.store.getState();
    const plugin = plugins[pluginName];
    const newPlugin = { ...plugin, [property]: value };
    const newPlugins = { ...plugins, [pluginName]: newPlugin };
    this.updateState({
      plugins: newPlugins,
    });
  }
}

// const createGetDomainMetadataFunction = (pluginName) => {
//   return async () => {
//     return { name: pluginName }
//   }
// }
