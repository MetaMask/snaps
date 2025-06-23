import type { AbstractExecutionService } from '@metamask/snaps-controllers';
import type {
  AccountSelectorState,
  AssetSelectorState,
  SnapId,
} from '@metamask/snaps-sdk';
import type {
  InstallSnapOptions,
  SimulationAccount,
  SimulationAsset,
  Snap,
} from '@metamask/snaps-simulation';
import { logInfo } from '@metamask/snaps-utils';
import { assert, createModuleLogger } from '@metamask/utils';
import type {
  CaipAccountId,
  CaipAssetType,
  CaipChainId,
} from '@metamask/utils';

import {
  rootLogger,
  getEnvironment,
  getPseudoRandomUuidGenerator,
  getScopesFromAssets,
} from './internals';

const log = createModuleLogger(rootLogger, 'helpers');

/**
 * Get the options for {@link installSnap}.
 *
 * @param snapId - The ID of the Snap, or the options.
 * @param options - The options, if any.
 * @returns The options.
 */
function getOptions<
  Service extends new (
    ...args: any[]
  ) => InstanceType<typeof AbstractExecutionService>,
>(
  snapId: SnapId | Partial<InstallSnapOptions<Service>> | undefined,
  options: Partial<InstallSnapOptions<Service>>,
): [SnapId | undefined, Partial<InstallSnapOptions<Service>>] {
  if (typeof snapId === 'object') {
    return [undefined, snapId];
  }

  return [snapId, options];
}

/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * describe('My Snap', () => {
 *   it('should do something', async () => {
 *     const { request } = await installSnap('local:my-snap');
 *     const response = await request({
 *       method: 'foo',
 *       params: ['bar'],
 *     });
 *     expect(response).toRespondWith('bar');
 *   });
 * });
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export async function installSnap(): Promise<Snap>;

/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * describe('My Snap', () => {
 *   it('should do something', async () => {
 *     const { request } = await installSnap('local:my-snap');
 *     const response = await request({
 *       method: 'foo',
 *       params: ['bar'],
 *     });
 *     expect(response).toRespondWith('bar');
 *   });
 * });
 * @param options - The options to use.
 * @param options.executionService - The execution service to use. Defaults to
 * {@link NodeThreadExecutionService}. You do not need to provide this unless
 * you are testing a custom execution service.
 * @param options.executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @param options.options - The simulation options.
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export async function installSnap<
  Service extends new (
    ...args: any[]
  ) => InstanceType<typeof AbstractExecutionService>,
>(options: Partial<InstallSnapOptions<Service>>): Promise<Snap>;

/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * describe('My Snap', () => {
 *   it('should do something', async () => {
 *     const { request } = await installSnap('local:my-snap');
 *     const response = await request({
 *       method: 'foo',
 *       params: ['bar'],
 *     });
 *     expect(response).toRespondWith('bar');
 *   });
 * });
 * @param snapId - The ID of the snap, including the prefix (`local:`). Defaults
 * to the URL of the built-in server, if it is running. This supports both
 * local snap IDs and NPM snap IDs.
 * @param options - The options to use.
 * @param options.executionService - The execution service to use. Defaults to
 * {@link NodeThreadExecutionService}. You do not need to provide this unless
 * you are testing a custom execution service.
 * @param options.executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @param options.options - The simulation options.
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export async function installSnap<
  Service extends new (
    ...args: any[]
  ) => InstanceType<typeof AbstractExecutionService>,
>(
  snapId: SnapId,
  options?: Partial<InstallSnapOptions<Service>>,
): Promise<Snap>;

/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * describe('My Snap', () => {
 *   it('should do something', async () => {
 *     const { request } = await installSnap('local:my-snap');
 *     const response = await request({
 *       method: 'foo',
 *       params: ['bar'],
 *     });
 *     expect(response).toRespondWith('bar');
 *   });
 * });
 * @param snapId - The ID of the snap, including the prefix (`local:`). Defaults
 * to the URL of the built-in server, if it is running. This supports both
 * local snap IDs and NPM snap IDs.
 * @param options - The options to use.
 * @param options.executionService - The execution service to use. Defaults to
 * {@link NodeThreadExecutionService}. You do not need to provide this unless
 * you are testing a custom execution service.
 * @param options.executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @param options.options - The simulation options.
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export async function installSnap<
  Service extends new (
    ...args: any[]
  ) => InstanceType<typeof AbstractExecutionService>,
>(
  snapId?: SnapId | Partial<InstallSnapOptions<Service>>,
  options: Partial<InstallSnapOptions<Service>> = {},
): Promise<Snap> {
  const resolvedOptions = getOptions(snapId, options);

  // TODO: Either fix this lint violation or explain why it's necessary to
  //  ignore.
  /* eslint-disable @typescript-eslint/unbound-method */
  const {
    request,
    onTransaction,
    sendTransaction,
    onSignature,
    onCronjob,
    runCronjob,
    onBackgroundEvent,
    onHomePage,
    onSettingsPage,
    onKeyringRequest,
    onInstall,
    onUpdate,
    onStart,
    onNameLookup,
    onProtocolRequest,
    onClientRequest,
    mockJsonRpc,
    close,
  } = await getEnvironment().installSnap(...resolvedOptions);
  /* eslint-enable @typescript-eslint/unbound-method */

  return {
    request,
    onTransaction,
    sendTransaction,
    onSignature,
    onCronjob,
    runCronjob,
    onBackgroundEvent,
    onHomePage,
    onSettingsPage,
    onKeyringRequest,
    onInstall,
    onUpdate,
    onStart,
    onNameLookup,
    onProtocolRequest,
    onClientRequest,
    mockJsonRpc,
    close: async () => {
      log('Closing execution service.');
      logInfo(
        'Calling `snap.close()` is deprecated, and will be removed in a future release. Snaps are now automatically closed when the test ends.',
      );

      await close();
    },
  };
}

/**
 * Get the state of an AccountSelector based on a {@link SimulationAccount}.
 *
 * @param account - The {@link SimulationAccount} to get the state from.
 * @returns The state of the AccountSelector.
 */
export function getStateFromAccount(
  account: SimulationAccount,
): AccountSelectorState {
  const { address, scopes } = account;
  return {
    addresses: scopes.map((scope) => `${scope}:${address}`) as CaipAccountId[],
    accountId: account.id,
  };
}

/**
 * Get the state of an AssetSelector based on a {@link SimulationAsset}.
 *
 * @param id - The Asset id as a CAIP-19 asset type.
 * @param assets - The {@link SimulationAsset} to get the state from.
 * @returns The state of the AssetSelector.
 */
export function getStateFromAsset(
  id: CaipAssetType,
  assets: Record<CaipAssetType, SimulationAsset>,
): AssetSelectorState {
  const asset = assets[id];

  assert(asset, `Asset with ID "${id}" not found in simulation assets.`);

  const { symbol, name } = asset;

  return {
    asset: id,
    symbol,
    name,
  };
}

/**
 * Generate a pseudo-random UUID.
 *
 * @returns A pseudo-random UUID string.
 */
const getPseudoRandomUuid = getPseudoRandomUuidGenerator();

/**
 * The base options for the {@link getMockAccount} function.
 */
export type BaseMockAccountOptions = {
  /**
   * The address of the account.
   */
  address: string;

  /**
   * The ID of the account. If not provided, a pseudo-random UUID will be
   * generated.
   */
  id?: string;

  /**
   * Whether the account is selected by default.
   */
  selected?: boolean;
};

/**
 * Options for creating a mock account with assets or scopes. If `scopes` are
 * not provided, they will be derived from the `assets`.
 *
 * @see BaseMockAccountOptions
 */
export type MockAccountOptionsWithAssets = BaseMockAccountOptions & {
  /**
   * The assets associated with the account. These should be in CAIP format.
   */
  assets: CaipAssetType[];

  /**
   * The scopes associated with the account. If not provided, they will be
   * derived from the `assets`.
   */
  scopes?: CaipChainId[];
};

/**
 * Options for creating a mock account with scopes, and optionally assets.
 *
 * @see BaseMockAccountOptions
 */
export type MockAccountOptionsWithScopes = BaseMockAccountOptions & {
  /**
   * The scopes associated with the account. These should be in CAIP format.
   */
  scopes: CaipChainId[];

  /**
   * The assets associated with the account. If not provided, it will default
   * to an empty array.
   */
  assets?: CaipAssetType[];
};

export type GetMockAccountOptions =
  | MockAccountOptionsWithAssets
  | MockAccountOptionsWithScopes;

/**
 * Get a mock account object for testing purposes.
 *
 * @param options - The options for creating the mock account.
 * @param options.address - The address of the account.
 * @param options.scopes - The scopes associated with the account, in CAIP
 * format. If not provided, they will be derived from the `assets`.
 * @param options.assets - The assets associated with the account, in CAIP
 * format. If not provided, it will default to an empty array.
 * @param options.selected - Whether the account is selected by default.
 * @param options.id - The ID of the account. If not provided, a pseudo-random
 * UUID will be generated.
 * @returns A mock account object with the specified properties.
 */
export function getMockAccount({
  address,
  assets = [],
  selected = false,
  id = getPseudoRandomUuid(),
  scopes = getScopesFromAssets(assets),
}: GetMockAccountOptions): SimulationAccount {
  return {
    address,
    id,
    scopes,
    selected,
    assets,
  };
}
