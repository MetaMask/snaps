import type {
  ControllerGetStateAction,
  ControllerStateChangeEvent,
} from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { Messenger } from '@metamask/messenger';
import type {
  SnapsRegistryDatabase,
  SignatureStruct,
} from '@metamask/snaps-registry';
import { verify } from '@metamask/snaps-registry';
import { getTargetVersion } from '@metamask/snaps-utils';
import type { Infer } from '@metamask/superstruct';
import type { Hex, SemVerRange, SemVerVersion } from '@metamask/utils';
import {
  assert,
  assertIsSemVerRange,
  Duration,
  inMilliseconds,
  satisfiesVersionRange,
} from '@metamask/utils';

import type { SnapRegistryControllerMethodActions } from './SnapRegistryController-method-action-types';
import type {
  SnapRegistryInfo,
  SnapRegistryMetadata,
  SnapRegistryRequest,
  SnapRegistryResult,
} from './types';
import { SnapRegistryStatus } from './types';

const SNAP_REGISTRY_URL =
  'https://acl.execution.metamask.io/latest/registry.json';

const SNAP_REGISTRY_SIGNATURE_URL =
  'https://acl.execution.metamask.io/latest/signature.json';

const DEFAULT_PUBLIC_KEY =
  '0x025b65308f0f0fb8bc7f7ff87bfc296e0330eee5d3c1d1ee4a048b2fd6a86fa0a6';

type JsonSnapsRegistryUrl = {
  registry: string;
  signature: string;
};

export type ClientConfig = {
  type: 'extension' | 'mobile';
  version: SemVerVersion;
};

export type SnapRegistryControllerArgs = {
  messenger: SnapRegistryControllerMessenger;
  state?: SnapRegistryControllerState;
  fetchFunction?: typeof fetch;
  url?: JsonSnapsRegistryUrl;
  recentFetchThreshold?: number;
  refetchOnAllowlistMiss?: boolean;
  publicKey?: Hex;
  clientConfig: ClientConfig;
};

export type SnapRegistryControllerGetStateAction = ControllerGetStateAction<
  typeof controllerName,
  SnapRegistryControllerState
>;

export type SnapRegistryControllerActions =
  | SnapRegistryControllerGetStateAction
  | SnapRegistryControllerMethodActions;

export type SnapRegistryControllerStateChangeEvent = ControllerStateChangeEvent<
  typeof controllerName,
  SnapRegistryControllerState
>;

export type SnapRegistryControllerEvents =
  SnapRegistryControllerStateChangeEvent;

export type SnapRegistryControllerMessenger = Messenger<
  typeof controllerName,
  SnapRegistryControllerActions,
  SnapRegistryControllerEvents
>;

export type SnapRegistryControllerState = {
  database: SnapsRegistryDatabase | null;
  signature: string | null;
  lastUpdated: number | null;
  databaseUnavailable: boolean;
};

const controllerName = 'SnapRegistryController';

const MESSENGER_EXPOSED_METHODS = [
  'get',
  'getMetadata',
  'resolveVersion',
  'requestUpdate',
] as const;

const defaultState = {
  database: null,
  signature: null,
  lastUpdated: null,
  databaseUnavailable: false,
};

export class SnapRegistryController extends BaseController<
  typeof controllerName,
  SnapRegistryControllerState,
  SnapRegistryControllerMessenger
> {
  readonly #url: JsonSnapsRegistryUrl;

  readonly #publicKey: Hex;

  readonly #clientConfig: ClientConfig;

  readonly #fetchFunction: typeof fetch;

  readonly #recentFetchThreshold: number;

  readonly #refetchOnAllowlistMiss: boolean;

  #currentUpdate: Promise<boolean> | null;

  constructor({
    messenger,
    state,
    url = {
      registry: SNAP_REGISTRY_URL,
      signature: SNAP_REGISTRY_SIGNATURE_URL,
    },
    publicKey = DEFAULT_PUBLIC_KEY,
    clientConfig,
    fetchFunction = globalThis.fetch.bind(undefined),
    recentFetchThreshold = inMilliseconds(5, Duration.Minute),
    refetchOnAllowlistMiss = true,
  }: SnapRegistryControllerArgs) {
    super({
      messenger,
      metadata: {
        database: {
          includeInStateLogs: true,
          persist: true,
          includeInDebugSnapshot: false,
          usedInUi: true,
        },
        signature: {
          includeInStateLogs: true,
          persist: true,
          includeInDebugSnapshot: true,
          usedInUi: false,
        },
        lastUpdated: {
          includeInStateLogs: true,
          persist: true,
          includeInDebugSnapshot: true,
          usedInUi: false,
        },
        databaseUnavailable: {
          includeInStateLogs: true,
          persist: true,
          includeInDebugSnapshot: true,
          usedInUi: false,
        },
      },
      name: controllerName,
      state: {
        ...defaultState,
        ...state,
      },
    });
    this.#url = url;
    this.#publicKey = publicKey;
    this.#clientConfig = clientConfig;
    this.#fetchFunction = fetchFunction;
    this.#recentFetchThreshold = recentFetchThreshold;
    this.#refetchOnAllowlistMiss = refetchOnAllowlistMiss;
    this.#currentUpdate = null;

    this.messenger.registerMethodActionHandlers(
      this,
      MESSENGER_EXPOSED_METHODS,
    );
  }

  #wasRecentlyFetched() {
    return (
      this.state.lastUpdated &&
      Date.now() - this.state.lastUpdated < this.#recentFetchThreshold
    );
  }

  /**
   * Triggers an update of the registry database.
   *
   * If an existing update is in progress this function will await that update.
   *
   * @returns True if an update was performed, otherwise false.
   */
  async requestUpdate(): Promise<boolean> {
    // If an update is ongoing, wait for that.
    if (this.#currentUpdate) {
      return await this.#currentUpdate;
    }
    // If no update exists, create promise and store globally.
    if (this.#currentUpdate === null) {
      this.#currentUpdate = this.#update();
    }
    const result = await this.#currentUpdate;
    this.#currentUpdate = null;
    return result;
  }

  /**
   * Updates the registry database if the registry hasn't been updated recently.
   *
   * NOTE: SHOULD NOT be called directly, instead `triggerUpdate` should be used.
   *
   * @returns True if an update was performed, otherwise false.
   */
  async #update(): Promise<boolean> {
    // No-op if we recently fetched the registry.
    if (this.#wasRecentlyFetched()) {
      return false;
    }

    try {
      const [database, signature] = await Promise.all([
        this.#safeFetch(this.#url.registry),
        this.#safeFetch(this.#url.signature),
      ]);

      const signatureJson = JSON.parse(signature);

      // If the signature matches the existing state, we can skip verification and don't need to update the database.
      if (signatureJson.signature === this.state.signature) {
        this.update((state) => {
          state.lastUpdated = Date.now();
          state.databaseUnavailable = false;
        });
        return false;
      }

      await this.#verifySignature(database, signatureJson);

      this.update((state) => {
        state.database = JSON.parse(database);
        state.lastUpdated = Date.now();
        state.databaseUnavailable = false;
        state.signature = signatureJson.signature;
      });

      return true;
    } catch {
      // Ignore
      this.update((state) => {
        state.databaseUnavailable = true;
      });
      return false;
    }
  }

  async #getDatabase(): Promise<SnapsRegistryDatabase | null> {
    if (this.state.database === null) {
      await this.requestUpdate();
    }

    return this.state.database;
  }

  async #getSingle(
    snapId: string,
    snapInfo: SnapRegistryInfo,
    refetch = false,
  ): Promise<SnapRegistryResult> {
    const database = await this.#getDatabase();

    const blockedEntry = database?.blockedSnaps.find((blocked) => {
      if ('id' in blocked) {
        return (
          blocked.id === snapId &&
          satisfiesVersionRange(snapInfo.version, blocked.versionRange)
        );
      }

      return blocked.checksum === snapInfo.checksum;
    });

    if (blockedEntry) {
      return {
        status: SnapRegistryStatus.Blocked,
        reason: blockedEntry.reason,
      };
    }

    const verified = database?.verifiedSnaps[snapId];
    const version = verified?.versions?.[snapInfo.version];
    const clientRange = version?.clientVersions?.[this.#clientConfig.type];
    const isCompatible =
      !clientRange ||
      satisfiesVersionRange(this.#clientConfig.version, clientRange);
    if (version && version.checksum === snapInfo.checksum && isCompatible) {
      return { status: SnapRegistryStatus.Verified };
    }
    // For now, if we have an allowlist miss, we can refetch once and try again.
    if (this.#refetchOnAllowlistMiss && !refetch) {
      await this.requestUpdate();
      return this.#getSingle(snapId, snapInfo, true);
    }
    return {
      status: this.state.databaseUnavailable
        ? SnapRegistryStatus.Unavailable
        : SnapRegistryStatus.Unverified,
    };
  }

  async get(
    snaps: SnapRegistryRequest,
  ): Promise<Record<string, SnapRegistryResult>> {
    return Object.entries(snaps).reduce<
      Promise<Record<string, SnapRegistryResult>>
    >(async (previousPromise, [snapId, snapInfo]) => {
      const result = await this.#getSingle(snapId, snapInfo);
      const acc = await previousPromise;
      acc[snapId] = result;
      return acc;
    }, Promise.resolve({}));
  }

  /**
   * Find an allowlisted version within a specified version range. Otherwise return the version range itself.
   *
   * @param snapId - The ID of the snap we are trying to resolve a version for.
   * @param versionRange - The version range.
   * @param refetch - An optional flag used to determine if we are refetching the registry.
   * @returns An allowlisted version within the specified version range if available otherwise returns the input version range.
   */
  async resolveVersion(
    snapId: string,
    versionRange: SemVerRange,
    refetch = false,
  ): Promise<SemVerRange> {
    const database = await this.#getDatabase();
    const versions = database?.verifiedSnaps[snapId]?.versions ?? null;

    if (!versions && this.#refetchOnAllowlistMiss && !refetch) {
      await this.requestUpdate();
      return this.resolveVersion(snapId, versionRange, true);
    }

    // If we cannot narrow down the version range we return the unaltered version range.
    if (!versions) {
      return versionRange;
    }

    const compatibleVersions = Object.entries(versions).reduce<SemVerVersion[]>(
      (accumulator, [version, metadata]) => {
        const clientRange = metadata.clientVersions?.[this.#clientConfig.type];
        if (
          !clientRange ||
          satisfiesVersionRange(this.#clientConfig.version, clientRange)
        ) {
          accumulator.push(version as SemVerVersion);
        }

        return accumulator;
      },
      [],
    );

    const targetVersion = getTargetVersion(compatibleVersions, versionRange);

    if (!targetVersion && this.#refetchOnAllowlistMiss && !refetch) {
      await this.requestUpdate();
      return this.resolveVersion(snapId, versionRange, true);
    }

    // If we cannot narrow down the version range we return the unaltered version range.
    if (!targetVersion) {
      return versionRange;
    }

    // A semver version is technically also a valid semver range.
    assertIsSemVerRange(targetVersion);
    return targetVersion;
  }

  /**
   * Get metadata for the given snap ID, if available, without updating registry.
   *
   * @param snapId - The ID of the snap to get metadata for.
   * @returns The metadata for the given snap ID, or `null` if the snap is not
   * verified.
   */
  getMetadata(snapId: string): SnapRegistryMetadata | null {
    return this.state?.database?.verifiedSnaps[snapId]?.metadata ?? null;
  }

  /**
   * Verify the signature of the registry.
   *
   * @param database - The registry database.
   * @param signature - The signature of the registry.
   * @throws If the signature is invalid.
   */
  async #verifySignature(
    database: string,
    signature: Infer<typeof SignatureStruct>,
  ) {
    assert(this.#publicKey, 'No public key provided.');

    const valid = await verify({
      registry: database,
      signature,
      publicKey: this.#publicKey,
    });

    assert(valid, 'Invalid registry signature.');
  }

  /**
   * Fetch the given URL, throwing if the response is not OK.
   *
   * @param url - The URL to fetch.
   * @returns The response body.
   * @private
   */
  async #safeFetch(url: string) {
    const response = await this.#fetchFunction(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}.`);
    }

    return await response.text();
  }
}
