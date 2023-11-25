import type {
  ActionConstraint,
  EventConstraint,
} from '@metamask/base-controller';
import { ControllerMessenger } from '@metamask/base-controller';
import { createEngineStream } from '@metamask/json-rpc-middleware-stream';
import { mnemonicPhraseToBytes } from '@metamask/key-tree';
import type {
  AbstractExecutionService,
  SnapLocation,
} from '@metamask/snaps-controllers';
import {
  detectSnapLocation,
  NodeThreadExecutionService,
  setupMultiplex,
} from '@metamask/snaps-controllers';
import type { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import type {
  LocalizationFile,
  NpmSnapPackageJson,
  SnapFiles,
  SnapManifest,
  VirtualFile,
} from '@metamask/snaps-utils';
import { logError, validateNpmSnap } from '@metamask/snaps-utils';
import type { Duplex } from 'readable-stream';
import { pipeline } from 'readable-stream';
import { create } from 'superstruct';

import { getControllers, registerSnap } from './controllers';
import { getSnapFile } from './files';
import { getEndowments } from './methods';
import { createJsonRpcEngine } from './middleware';
import type { SimulationOptions, SimulationUserOptions } from './options';
import { SimulationOptionsStruct } from './options';
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
 * Get the options for the simulation.
 *
 * @param options - The user options. Any options not specified will be filled
 * in with default values.
 * @returns The simulation options.
 */
export function getOptions(options: SimulationUserOptions): SimulationOptions {
  return create(
    options,
    SimulationOptionsStruct,
  ) as Required<SimulationUserOptions>;
}

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
  const snapFiles = await fetchSnap(snapId);

  // Create Redux store.
  const { store, runSaga } = createStore(options);

  // Set up controllers and JSON-RPC stack.
  const hooks = {
    getMnemonic: async () =>
      Promise.resolve(mnemonicPhraseToBytes(options.secretRecoveryPhrase)),
    getSnapFile: async (path: string, encoding: AuxiliaryFileEncoding) =>
      getSnapFile(snapFiles.auxiliaryFiles, path, encoding),
  };

  const controllerMessenger = new ControllerMessenger();
  const { subjectMetadataController, permissionController } = getControllers({
    controllerMessenger,
    hooks,
    runSaga,
    options,
  });

  const engine = createJsonRpcEngine({
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
 * Fetch the Snap files for the given Snap ID.
 *
 * @param snapId - The ID of the Snap to fetch.
 * @returns The Snap files.
 * @throws If the Snap files are invalid.
 */
export async function fetchSnap(snapId: string): Promise<SnapFiles> {
  const location = detectSnapLocation(snapId, {
    allowLocal: true,
    allowHttp: true,
  });

  const manifest = await location.manifest();
  const svgIcon =
    manifest.result.source.location.npm.iconPath === undefined
      ? undefined
      : await location.fetch(manifest.result.source.location.npm.iconPath);

  const files: SnapFiles = {
    manifest,
    packageJson: await location.fetchJson<NpmSnapPackageJson>('package.json'),
    sourceCode: await location.fetch(
      manifest.result.source.location.npm.filePath,
    ),
    svgIcon,

    auxiliaryFiles: await fetchAuxiliaryFiles(location, manifest.result),
    localizationFiles: await fetchLocalizationFiles(location, manifest.result),
  };

  await validateNpmSnap(files);
  return files;
}

/**
 * Fetch the auxiliary files for the Snap.
 *
 * @param location - The Snap location.
 * @param manifest - The parsed manifest.
 * @returns The auxiliary files.
 */
async function fetchAuxiliaryFiles(
  location: SnapLocation,
  manifest: SnapManifest,
): Promise<VirtualFile[]> {
  return manifest.source.files
    ? await Promise.all(
        manifest.source.files.map(async (filePath) => location.fetch(filePath)),
      )
    : [];
}

/**
 * Fetch the localization files for the Snap.
 *
 * @param location - The Snap location.
 * @param manifest - The parsed manifest.
 * @returns The localization files.
 */
async function fetchLocalizationFiles(
  location: SnapLocation,
  manifest: SnapManifest,
): Promise<VirtualFile<LocalizationFile>[]> {
  return manifest.source.locales
    ? await Promise.all(
        manifest.source.locales.map(async (filePath) =>
          location.fetchJson<LocalizationFile>(filePath),
        ),
      )
    : [];
}
