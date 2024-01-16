import type {
  ActionConstraint,
  EventConstraint,
} from '@metamask/base-controller';
import { ControllerMessenger } from '@metamask/base-controller';
import { createEngineStream } from '@metamask/json-rpc-middleware-stream';
import { mnemonicPhraseToBytes } from '@metamask/key-tree';
import type { AbstractExecutionService } from '@metamask/snaps-controllers';
import {
  fetchSnap,
  detectSnapLocation,
  NodeThreadExecutionService,
  setupMultiplex,
} from '@metamask/snaps-controllers';
import { getEncryptionKey } from '@metamask/snaps-rpc-methods';
import type { AuxiliaryFileEncoding, SnapId } from '@metamask/snaps-sdk';
import type { FetchedSnapFiles } from '@metamask/snaps-utils';
import { logError } from '@metamask/snaps-utils';
import type { Duplex } from 'readable-stream';
import { pipeline } from 'readable-stream';

import { getControllers, registerSnap } from './controllers';
import { getSnapFile } from './files';
import { getEndowments } from './methods';
import { createJsonRpcEngine } from './middleware';
import type { SimulationOptions, SimulationUserOptions } from './options';
import { getOptions } from './options';
import type { RunSagaFunction, Store } from './store';
import { createStore } from './store';

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
  keyof ConstructorParameters<typeof AbstractExecutionService<unknown>>[0]
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
  Service extends new (...args: any[]) => InstanceType<
    typeof AbstractExecutionService<unknown>
  >,
> = ExecutionServiceOptions<Service> extends Record<string, never>
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
  snapId: string;
  store: Store;
  executionService: InstanceType<typeof AbstractExecutionService>;
  controllerMessenger: ControllerMessenger<ActionConstraint, EventConstraint>;
  runSaga: RunSagaFunction;
};

export type MiddlewareHooks = {
  /**
   * A hook that returns the user's secret recovery phrase.
   *
   * @returns The user's secret recovery phrase.
   */
  getMnemonic: () => Promise<Uint8Array>;

  /**
   * A hook that returns the Snap's auxiliary file for the given path.
   *
   * @param path - The path of the auxiliary file to get.
   * @param encoding - The encoding to use when returning the file.
   * @returns The Snap's auxiliary file for the given path.
   */
  getSnapFile: (
    path: string,
    encoding: AuxiliaryFileEncoding,
  ) => Promise<string | null>;
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
 * @template Service - The type of the execution service.
 */
export async function handleInstallSnap<
  Service extends new (...args: any[]) => InstanceType<
    typeof AbstractExecutionService
  >,
>(
  snapId: string,
  {
    executionService,
    executionServiceOptions,
    options: rawOptions = {},
  }: Partial<InstallSnapOptions<Service>> = {},
): Promise<InstalledSnap> {
  const options = getOptions(rawOptions);

  // Fetch Snap files.
  const location = detectSnapLocation(snapId, {
    allowLocal: true,
  });

  const snapFiles = await fetchSnap(snapId as SnapId, location);

  // Create Redux store.
  const password = await getEncryptionKey({
    mnemonicPhrase: mnemonicPhraseToBytes(options.secretRecoveryPhrase),
    snapId,
  });

  const { store, runSaga } = createStore(password, options);

  // Set up controllers and JSON-RPC stack.
  const hooks = getHooks(options, snapFiles);

  const controllerMessenger = new ControllerMessenger();
  const { subjectMetadataController, permissionController } = getControllers({
    controllerMessenger,
    hooks,
    runSaga,
    options,
  });

  const engine = createJsonRpcEngine({
    store,
    hooks,
    permissionMiddleware: permissionController.createPermissionMiddleware({
      origin: snapId,
    }),
  });

  // Create execution service.
  const ExecutionService = executionService ?? NodeThreadExecutionService;
  const service = new ExecutionService({
    ...executionServiceOptions,
    messenger: controllerMessenger.getRestricted({
      name: 'ExecutionService',
    }),
    setupSnapProvider: (_snapId: string, rpcStream: Duplex) => {
      const mux = setupMultiplex(rpcStream, 'snapStream');
      const stream = mux.createStream('metamask-provider');
      const providerStream = createEngineStream({ engine });

      // Error function is difficult to test, so we ignore it.
      /* istanbul ignore next 2 */
      pipeline(stream, providerStream, stream, (error: unknown) => {
        if (error) {
          logError(`Provider stream failure.`, error);
        }
      });
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

  return {
    snapId,
    store,
    executionService: service,
    controllerMessenger,
    runSaga,
  };
}

/**
 * Get the hooks for the simulation.
 *
 * @param options - The simulation options.
 * @param snapFiles - The Snap files.
 * @returns The hooks for the simulation.
 */
export function getHooks(
  options: SimulationOptions,
  snapFiles: FetchedSnapFiles,
): MiddlewareHooks {
  return {
    getMnemonic: async () =>
      Promise.resolve(mnemonicPhraseToBytes(options.secretRecoveryPhrase)),
    getSnapFile: async (path: string, encoding: AuxiliaryFileEncoding) =>
      await getSnapFile(snapFiles.auxiliaryFiles, path, encoding),
  };
}
