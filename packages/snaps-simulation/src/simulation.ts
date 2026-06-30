import { createEngineStream } from '@metamask/json-rpc-middleware-stream';
import type { CryptographicFunctions } from '@metamask/key-tree';
import { mnemonicToSeed } from '@metamask/key-tree';
import type {
  ActionConstraint,
  EventConstraint,
  MockAnyNamespace,
  NamespacedName,
} from '@metamask/messenger';
import { MOCK_ANY_NAMESPACE, Messenger } from '@metamask/messenger';
import {
  PermissionDoesNotExistError,
  type Caveat,
  type RequestedPermissions,
} from '@metamask/permission-controller';
import type { ExecutionService } from '@metamask/snaps-controllers';
import {
  detectSnapLocation,
  fetchSnap,
  NodeThreadExecutionService,
  setupMultiplex,
} from '@metamask/snaps-controllers/node';
import { DIALOG_APPROVAL_TYPES } from '@metamask/snaps-rpc-methods';
import type {
  TrackEventParams,
  SnapId,
  TraceRequest,
  EndTraceRequest,
  TraceContext,
} from '@metamask/snaps-sdk';
import type { Snap, VirtualFile } from '@metamask/snaps-utils';
import { logError } from '@metamask/snaps-utils';
import { assertExhaustive, hasProperty } from '@metamask/utils';
import type { CaipAssetType, Hex, Json } from '@metamask/utils';
import type { Duplex } from 'readable-stream';
import { pipeline } from 'readable-stream';
import type { SagaIterator } from 'redux-saga';
import { select } from 'redux-saga/effects';

import type { RootControllerMessenger } from './controllers';
import { getControllers, registerSnap } from './controllers';
import { getSnapFile } from './files';
import type { SnapHelpers } from './helpers';
import { getHelpers } from './helpers';
import { resolveWithSaga } from './interface';
import { asyncResolve, getEndowments } from './methods';
import {
  getGetMnemonicImplementation,
  getGetSnapImplementation,
  getTrackEventImplementation,
  getTrackErrorImplementation,
  getEndTraceImplementation,
  getStartTraceImplementation,
  getSetCurrentChainImplementation,
  getClearSnapStateMethodImplementation,
  getGetSnapStateMethodImplementation,
  getUpdateSnapStateMethodImplementation,
  getRequestUserApprovalImplementation,
  getShowInAppNotificationImplementation,
  getShowNativeNotificationImplementation,
} from './methods/hooks';
import { createJsonRpcEngine } from './middleware';
import type {
  SimulationAccount,
  SimulationOptions,
  SimulationUserOptions,
} from './options';
import { getOptions } from './options';
import type {
  ApplicationState,
  Interface,
  RunSagaFunction,
  Store,
} from './store';
import { createStore, getCurrentInterface } from './store';
import { addSnapMetadataToAccount } from './utils/account';

/**
 * Options for the execution service, without the options that are shared
 * between all execution services.
 *
 * @template Service - The type of the execution service, i.e., the class that
 * creates the execution service.
 */
export type ExecutionServiceOptions<
  Service extends new (...args: any[]) => any,
> = Omit<
  ConstructorParameters<Service>[0],
  keyof ConstructorParameters<typeof ExecutionService>[0]
>;

/**
 * The options for running a Snap in a simulated environment.
 *
 * @property executionService - The execution service to use.
 * @property executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @property options - The simulation options.
 * @template Service - The type of the execution service.
 */
export type InstallSnapOptions<
  Service extends new (...args: any[]) => InstanceType<typeof ExecutionService>,
> =
  ExecutionServiceOptions<Service> extends Record<string, never>
    ? {
        executionService: Service;
        executionServiceOptions?: ExecutionServiceOptions<Service>;
        options?: SimulationUserOptions;
      }
    : {
        executionService: Service;
        executionServiceOptions: ExecutionServiceOptions<Service>;
        options?: SimulationUserOptions;
      };

export type InstalledSnap = {
  snapId: SnapId;
  store: Store;
  executionService: InstanceType<typeof ExecutionService>;
  controllerMessenger: Messenger<
    NamespacedName,
    ActionConstraint,
    EventConstraint
  >;
  runSaga: RunSagaFunction;
};

export type RestrictedMiddlewareHooks = {
  /**
   * A hook that returns the user's secret recovery phrase.
   *
   * @returns The user's secret recovery phrase.
   */
  getMnemonic: () => Promise<Uint8Array>;

  /**
   * A hook that returns whether the client is locked or not.
   *
   * @returns A boolean flag signaling whether the client is locked.
   */
  getIsLocked: () => boolean;

  /**
   * Get the cryptographic functions to use for the client. This may return an
   * empty object to fall back to the default cryptographic functions.
   *
   * @returns The cryptographic functions to use for the client.
   */
  getClientCryptography: () => CryptographicFunctions;

  /**
   * A hook that returns metadata about a given Snap.
   *
   * @param snapId - The ID of a Snap.
   * @returns The metadata for the given Snap.
   */
  getSnap: (snapId: string) => Snap;

  /**
   * A hook that sets the current chain ID.
   *
   * @param chainId - The chain ID.
   */
  setCurrentChain: (chainId: Hex) => null;

  /**
   * A hook that gets the current simulation state.
   *
   * @returns The simulation state.
   */
  getSimulationState: () => ApplicationState;
};

export type PermittedMiddlewareHooks = {
  /**
   * A hook that returns a promise that resolves once the extension is unlocked.
   *
   * @param shouldShowUnlockRequest - Whether to show the unlock request.
   * @returns A promise that resolves once the extension is unlocked.
   */
  getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;

  /**
   * A hook that returns whether the client is active or not.
   *
   * @returns A boolean flag signaling whether the client is opened.
   */
  getIsActive: () => boolean;

  /**
   * A hook that returns the client version.
   *
   * @returns A string that corresponds to the client version.
   */
  getVersion: () => string;

  /**
   * A hook that tracks an error.
   *
   * @param error - The error object containing error details and properties.
   */
  trackError(error: Error): void;

  /**
   * A hook that tracks an event.
   *
   * @param event - The event object containing event details and properties.
   */
  trackEvent(event: TrackEventParams['event']): void;

  /**
   * A hook that starts a performance trace.
   *
   * @param request - The trace request object containing trace details.
   */
  startTrace(request: TraceRequest): TraceContext;

  /**
   * A hook that ends a performance trace.
   *
   * @param request - The trace request object containing trace details.
   * @returns The trace data.
   */
  endTrace(request: EndTraceRequest): void;

  /**
   * A hook that returns the allowed keyring methods.
   *
   * @returns The keyring methods.
   */
  getAllowedKeyringMethods(): string[];

  /**
   * A hook that returns a specialized messenger for the Snap.
   *
   * @returns The messenger.
   */
  getMessenger(actions: string[], events: string[]): Messenger<string>;
};

export type MultichainMiddlewareHooks = {
  /**
   * A hook that returns the simulated accounts.
   *
   * @returns The simulated accounts.
   */
  getAccounts: () => SimulationAccount[];

  /**
   * A hook that retrieves a caveat for a given permission.
   *
   * @param permission - The permission name.
   * @param caveatType - The caveat type.
   * @returns The caveat, if it exists.
   */
  getCaveat: (
    permission: string,
    caveatType: string,
  ) => Caveat<string, Json> | undefined;

  /**
   * A hook that grants permissions to the origin.
   *
   * @param permissions - The permissions.
   */
  grantPermissions: (permissions: RequestedPermissions) => void;

  /**
   * A hook that revokes a permission for the origin.
   *
   * @param permission - The permission name.
   */
  revokePermission: (permission: string) => void;
};

/**
 * Install a Snap in a simulated environment. This will fetch the Snap files,
 * create a Redux store, set up the controllers and JSON-RPC stack, register the
 * Snap, and run the Snap code in the execution service.
 *
 * @param snapId - The ID of the Snap to install.
 * @param options - The options to use when installing the Snap.
 * @param options.executionService - The execution service to use.
 * @param options.executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @param options.options - The simulation options.
 * @returns The installed Snap object.
 * @template Service - The type of the execution service.
 */
export async function installSnap<
  Service extends new (...args: any[]) => InstanceType<typeof ExecutionService>,
>(
  snapId: SnapId,
  {
    executionService,
    executionServiceOptions,
    options: rawOptions = {},
  }: Partial<InstallSnapOptions<Service>> = {},
): Promise<InstalledSnap & SnapHelpers> {
  const options = getOptions(rawOptions);

  // Fetch Snap files.
  const location = detectSnapLocation(snapId, {
    allowLocal: true,
  });

  const snapFiles = await fetchSnap(snapId, location);

  // Create Redux store.
  const { store, runSaga } = createStore(options);

  const controllerMessenger = new Messenger<MockAnyNamespace, any, any>({
    namespace: MOCK_ANY_NAMESPACE,
  });

  registerActions(
    controllerMessenger,
    runSaga,
    options,
    snapId,
    snapFiles.auxiliaryFiles,
  );

  // Set up controllers and JSON-RPC stack.
  const restrictedHooks = getRestrictedHooks(options, store, runSaga);

  const permittedHooks = getPermittedHooks(
    snapId,
    controllerMessenger,
    runSaga,
  );

  const multichainHooks = getMultichainHooks(
    snapId,
    options,
    controllerMessenger,
  );

  const { subjectMetadataController, permissionController } = getControllers({
    controllerMessenger,
    hooks: restrictedHooks,
    runSaga,
    options,
  });

  const engine = createJsonRpcEngine({
    snapId,
    messenger: controllerMessenger,
    store,
    restrictedHooks,
    permittedHooks,
    multichainHooks,
    isMultichain: false,
  });

  const multichainEngine = createJsonRpcEngine({
    snapId,
    messenger: controllerMessenger,
    store,
    restrictedHooks,
    permittedHooks,
    multichainHooks,
    isMultichain: true,
  });

  // Create execution service.
  const ActualService = executionService ?? NodeThreadExecutionService;
  const service = new ActualService({
    ...executionServiceOptions,
    messenger: new Messenger({
      namespace: 'ExecutionService',
      parent: controllerMessenger,
    }),
    setupSnapProvider: (_snapId: string, rpcStream: Duplex) => {
      const mux = setupMultiplex(rpcStream, 'snapStream');
      const stream = mux.createStream('metamask-provider');
      const providerStream = createEngineStream({ engine });

      // Error function is difficult to test, so we ignore it.
      /* istanbul ignore next 2 */
      pipeline(stream, providerStream, stream, (error) => {
        if (error && !error.message?.match('Premature close')) {
          logError(`Provider stream failure.`, error);
        }
      });

      const multichainStream = mux.createStream('metamask-multichain-provider');
      const multichainProviderStream = createEngineStream({
        engine: multichainEngine,
      });

      /* istanbul ignore next 2 */
      pipeline(
        multichainStream,
        multichainProviderStream,
        multichainStream,
        (error) => {
          if (error && !error.message?.match('Premature close')) {
            logError(`Provider stream failure.`, error);
          }
        },
      );
    },
  });

  // Register the Snap. This sets up the Snap's permissions and subject
  // metadata.
  await registerSnap(snapId, snapFiles.manifest.result, {
    permissionController,
    subjectMetadataController,
  });

  // Run the Snap code in the execution service.
  await service.executeSnap({
    snapId,
    sourceCode: snapFiles.sourceCode.toString('utf8'),
    endowments: await getEndowments(permissionController, snapId),
  });

  const helpers = getHelpers({
    snapId,
    store,
    controllerMessenger,
    runSaga,
    executionService: service,
    options,
  });

  return {
    snapId,
    store,
    executionService: service,
    controllerMessenger,
    runSaga,
    ...helpers,
  };
}

/**
 * Get the hooks for the simulation.
 *
 * @param options - The simulation options.
 * @param store - The Redux store.
 * @param runSaga - The run saga function.
 * @returns The hooks for the simulation.
 */
export function getRestrictedHooks(
  options: SimulationOptions,
  store: Store,
  runSaga: RunSagaFunction,
): RestrictedMiddlewareHooks {
  return {
    getMnemonic: getGetMnemonicImplementation(options.secretRecoveryPhrase),
    getIsLocked: () => false,
    getClientCryptography: () => ({}),
    getSnap: getGetSnapImplementation(true),
    setCurrentChain: getSetCurrentChainImplementation(runSaga),
    getSimulationState: store.getState.bind(store),
  };
}

/**
 * Get the permitted hooks for the simulation.
 *
 * @param snapId - The Snap ID.
 * @param controllerMessenger - The controller messenger.
 * @param runSaga - The run saga function.
 * @returns The permitted hooks for the simulation.
 */
export function getPermittedHooks(
  snapId: string,
  controllerMessenger: RootControllerMessenger,
  runSaga: RunSagaFunction,
): PermittedMiddlewareHooks {
  return {
    getUnlockPromise: asyncResolve(),
    getIsActive: () => true,
    getVersion: () => '13.6.0-flask.0',

    getAllowedKeyringMethods: () => [],

    trackError: getTrackErrorImplementation(runSaga),
    trackEvent: getTrackEventImplementation(runSaga),
    startTrace: getStartTraceImplementation(runSaga),
    endTrace: getEndTraceImplementation(runSaga),

    getMessenger: (actions, events) => {
      const messenger = new Messenger({
        namespace: `${snapId}-messenger`,
        parent: controllerMessenger,
      });

      controllerMessenger.delegate({
        actions: actions as never[],
        events: events as never[],
        messenger,
      });

      return messenger;
    },
  };
}

/**
 * Get the hooks for the multichain middleware simulation.
 *
 * @param snapId - The Snap ID.
 * @param options - The simulation options.
 * @param controllerMessenger - The controller messenger.
 * @returns The hooks for the middleware.
 */
export function getMultichainHooks(
  snapId: SnapId,
  options: SimulationOptions,
  controllerMessenger: RootControllerMessenger,
): MultichainMiddlewareHooks {
  return {
    getAccounts: () => options.accounts,
    getCaveat: (permission: string, caveatType: string) => {
      try {
        return controllerMessenger.call(
          'PermissionController:getCaveat',
          snapId,
          permission,
          caveatType,
        );
      } catch (error) {
        if (error instanceof PermissionDoesNotExistError) {
          return undefined;
        }
        /* istanbul ignore next */
        throw error;
      }
    },
    grantPermissions: (approvedPermissions: RequestedPermissions) => {
      controllerMessenger.call('PermissionController:grantPermissions', {
        subject: { origin: snapId },
        approvedPermissions,
      });
    },
    revokePermission: (permission: string) => {
      try {
        controllerMessenger.call('PermissionController:revokePermissions', {
          [snapId]: [permission],
        });
      } catch (error) {
        if (error instanceof PermissionDoesNotExistError) {
          return;
        }
        /* istanbul ignore next */
        throw error;
      }
    },
  };
}

/**
 * Get the mock mnemonic for a given source ID.
 *
 * @param options - The simulation options.
 * @returns The mnemonic.
 */
/**
 * Register mocked action handlers.
 *
 * @param controllerMessenger - The controller messenger.
 * @param runSaga - The run saga function.
 * @param options - The simulation options.
 * @param snapId - The ID of the Snap.
 * @param auxiliaryFiles - Auxiliary files from the fetched Snap.
 */
export function registerActions(
  controllerMessenger: RootControllerMessenger,
  runSaga: RunSagaFunction,
  options: SimulationOptions,
  snapId: SnapId,
  auxiliaryFiles: VirtualFile[],
) {
  controllerMessenger.registerActionHandler(
    'PhishingController:testOrigin',
    () => ({ result: false, type: 'all' }),
  );

  controllerMessenger.registerActionHandler(
    'AccountsController:getAccountByAddress',
    // @ts-expect-error - This is a partial account with only the necessary
    // data used by the interface controller.
    (address) => {
      const matchingAccount = options.accounts.find(
        (account) => address === account.address,
      );

      if (!matchingAccount) {
        return undefined;
      }

      return addSnapMetadataToAccount(matchingAccount, snapId);
    },
  );

  controllerMessenger.registerActionHandler(
    'AccountsController:getSelectedMultichainAccount',
    // @ts-expect-error - This is a partial account with only the necessary
    // data used by the interface controller.
    () => {
      const selectedAccount = options.accounts.find(
        (account) => account.selected,
      );

      if (!selectedAccount) {
        return undefined;
      }

      return addSnapMetadataToAccount(selectedAccount, snapId);
    },
  );

  controllerMessenger.registerActionHandler(
    'AccountsController:listMultichainAccounts',

    () =>
      // @ts-expect-error - These are partial accounts with only the necessary
      // data used by the interface controller.
      options.accounts.map((account) =>
        addSnapMetadataToAccount(account, snapId),
      ),
  );

  controllerMessenger.registerActionHandler(
    'MultichainAssetsController:getState',
    () => ({
      // @ts-expect-error - These are partial assets with only the
      // necessary data used by the interface controller.
      assetsMetadata: options.assets,
      accountsAssets: options.accounts.reduce<Record<string, CaipAssetType[]>>(
        (acc, account) => {
          acc[account.id] = account.assets ?? [];
          return acc;
        },
        {},
      ),
    }),
  );

  controllerMessenger.registerActionHandler(
    'ApprovalController:hasRequest',
    (opts) => {
      /**
       * Get the current interface from the store.
       *
       * @yields Selects the current interface from the store.
       * @returns The current interface.
       */
      function* getCurrentInterfaceSaga(): SagaIterator {
        const currentInterface: Interface = yield select(getCurrentInterface);
        return currentInterface;
      }

      const currentInterface: Interface | undefined = runSaga(
        getCurrentInterfaceSaga,
      ).result();
      return (
        currentInterface?.type === DIALOG_APPROVAL_TYPES.default &&
        currentInterface?.id === opts?.id
      );
    },
  );

  controllerMessenger.registerActionHandler(
    'ApprovalController:acceptRequest',
    async (_id: string, value: unknown) => {
      await runSaga(resolveWithSaga, value).toPromise();

      return { value };
    },
  );

  controllerMessenger.registerActionHandler(
    'ApprovalController:addRequest',
    // @ts-expect-error Types of property 'requestData' are incompatible.
    getRequestUserApprovalImplementation(runSaga),
  );

  controllerMessenger.registerActionHandler(
    'SnapController:getSnap',
    getGetSnapImplementation(true),
  );

  controllerMessenger.registerActionHandler(
    'SnapController:getSnapState',
    getGetSnapStateMethodImplementation(runSaga),
  );

  controllerMessenger.registerActionHandler(
    'SnapController:updateSnapState',
    getUpdateSnapStateMethodImplementation(runSaga),
  );

  controllerMessenger.registerActionHandler(
    'SnapController:clearSnapState',
    getClearSnapStateMethodImplementation(runSaga),
  );

  controllerMessenger.registerActionHandler(
    'SnapController:getSnapFile',
    async (_snapId, path, encoding) =>
      getSnapFile(auxiliaryFiles, path, encoding),
  );

  const showNativeNotification =
    getShowNativeNotificationImplementation(runSaga);
  const showInAppNotification = getShowInAppNotificationImplementation(runSaga);

  controllerMessenger.registerActionHandler(
    // @ts-expect-error - `RateLimitController` is not part of the simulation messenger types.
    'RateLimitController:call',
    async (
      _origin: string,
      type: 'showNativeNotification' | 'showInAppNotification',
      ...args: unknown[]
    ) => {
      switch (type) {
        case 'showNativeNotification':
          return await showNativeNotification(args[0] as string, {
            type: 'native',
            message: args[1] as string,
          });
        case 'showInAppNotification':
          return await showInAppNotification(
            args[0] as string,
            args[1] as Parameters<typeof showInAppNotification>[1],
          );
        /* istanbul ignore next */
        default:
          return assertExhaustive(type);
      }
    },
  );

  const getMnemonic = getGetMnemonicImplementation(
    options.secretRecoveryPhrase,
  );

  controllerMessenger.registerActionHandler(
    // @ts-expect-error - `KeyringController` is not part of the simulation messenger types.
    'KeyringController:getState',
    () => ({
      isUnlocked: true,
      keyrings: [
        {
          type: 'HD Key Tree',
          metadata: {
            id: 'default',
            name: 'Default Secret Recovery Phrase',
          },
        },
        {
          type: 'HD Key Tree',
          metadata: {
            id: 'alternative',
            name: 'Alternative Secret Recovery Phrase',
          },
        },
      ],
    }),
  );

  controllerMessenger.registerActionHandler(
    // @ts-expect-error - `KeyringController` is not part of the simulation messenger types.
    'KeyringController:withKeyringV2Unsafe',
    async (
      selector: { type: string; index?: number } | { id: string },
      operation: (args: {
        keyring: { type: string; mnemonic: Uint8Array; seed: Uint8Array };
      }) => Promise<unknown>,
    ) => {
      const source = hasProperty(selector, 'id')
        ? (selector.id as string)
        : undefined;

      const mnemonic = await getMnemonic(source);
      const seed = await mnemonicToSeed(mnemonic);

      return await operation({
        keyring: {
          type: 'hd',
          mnemonic,
          seed,
        },
      });
    },
  );
}
