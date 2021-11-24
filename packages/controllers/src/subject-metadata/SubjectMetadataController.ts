import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import type { Patch } from 'immer';
import { Json } from 'json-rpc-engine';

import type {
  GenericPermissionController,
  PermissionSubjectMetadata,
  HasPermissions,
} from '../permissions';

const controllerName = 'SubjectMetadataController';

type SubjectOrigin = string;

export type SubjectMetadata = PermissionSubjectMetadata & {
  [key: string]: Json;
  name: string;
  // TODO:TS4.4 make optional
  extensionId: string | null;
  host: string | null;
  iconUrl: string | null;
};

type SubjectMetadataToAdd = PermissionSubjectMetadata & {
  name: string;
  extensionId?: string | null;
  host?: string | null;
  iconUrl?: string | null;
} & Record<string, Json>;

export type SubjectMetadataControllerState = {
  subjectMetadata: Record<SubjectOrigin, SubjectMetadata>;
};

const stateMetadata = {
  subjectMetadata: { persist: true, anonymous: false },
};

const defaultState: SubjectMetadataControllerState = {
  subjectMetadata: {},
};

export type GetSubjectMetadataState = {
  type: `${typeof controllerName}:getState`;
  handler: () => SubjectMetadataControllerState;
};

export type ClearSubjectMetadataState = {
  type: `${typeof controllerName}:clearState`;
  handler: () => void;
};

export type TrimSubjectMetadataState = {
  type: `${typeof controllerName}:trimMetadataState`;
  handler: () => void;
};

export type SubjectMetadataControllerActions =
  | GetSubjectMetadataState
  | ClearSubjectMetadataState
  | TrimSubjectMetadataState;

export type SubjectMetadataStateChange = {
  type: `${typeof controllerName}:stateChange`;
  payload: [SubjectMetadataControllerState, Patch[]];
};

export type SubjectMetadataControllerEvents = SubjectMetadataStateChange;

type AllowedActions = HasPermissions;

export type SubjectMetadataControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  SubjectMetadataControllerActions | AllowedActions,
  SubjectMetadataControllerEvents,
  AllowedActions['type'],
  never
>;

type SubjectMetadataControllerOptions = {
  messenger: SubjectMetadataControllerMessenger;
  subjectCacheLimit: number;
  state?: Partial<SubjectMetadataControllerState>;
};

/**
 * A controller for storing metadata associated with permission subjects. More
 * or less, a cache.
 */
export class SubjectMetadataController extends BaseController<
  typeof controllerName,
  SubjectMetadataControllerState,
  SubjectMetadataControllerMessenger
> {
  private _subjectCacheLimit: number;

  get subjectCacheLimit(): number {
    return this._subjectCacheLimit;
  }

  private subjectsEncounteredSinceStartup: Set<string>;

  private subjectHasPermissions: GenericPermissionController['hasPermissions'];

  constructor({
    messenger,
    subjectCacheLimit,
    state = {},
  }: SubjectMetadataControllerOptions) {
    if (!Number.isInteger(subjectCacheLimit) || subjectCacheLimit < 1) {
      throw new Error(
        `subjectCacheLimit must be a positive integer. Received: "${subjectCacheLimit}"`,
      );
    }

    const hasPermissions = (origin: string) => {
      return messenger.call('PermissionController:hasPermissions', origin);
    };

    if (state.subjectMetadata) {
      SubjectMetadataController.trimMetadataState(
        state as SubjectMetadataControllerState,
        hasPermissions,
      );
    }

    super({
      name: controllerName,
      metadata: stateMetadata,
      messenger,
      state: { ...defaultState, ...state },
    });

    this.subjectHasPermissions = hasPermissions;
    this._subjectCacheLimit = subjectCacheLimit;
    this.subjectsEncounteredSinceStartup = new Set();
    this.registerMessageHandlers();
  }

  /**
   * Constructor helper for registering message handlers for the actions of this
   * controller.
   */
  private registerMessageHandlers(): void {
    this.messagingSystem.registerActionHandler(
      `${controllerName}:clearState`,
      () => this.clearState(),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:trimMetadataState`,
      () => this.trimMetadataState(),
    );
  }

  /**
   * Clears the state of this controller.
   */
  clearState(): void {
    this.update((_draftState) => {
      return { ...defaultState };
    });
  }

  /**
   * Stores domain metadata for the given origin (subject). Deletes metadata for
   * subjects without permissions in a FIFO manner once more than
   * {@link SubjectMetadataController.subjectCacheLimit} distinct origins have
   * been added since boot.
   *
   * In order to prevent a degraded user experience,
   * metadata is never deleted for subjects with permissions, since metadata
   * cannot yet be requested on demand.
   *
   * @param metadata - The subject metadata to store.
   */
  addSubjectMetadata(metadata: SubjectMetadataToAdd): void {
    const { origin } = metadata;
    const newMetadata: SubjectMetadata = {
      ...metadata,
      extensionId: metadata.extensionId || null,
      host: metadata.host || null,
      iconUrl: metadata.iconUrl || null,
    };

    let originToForget: string | null = null;
    // We only delete the oldest encountered subject from the cache, again to
    // ensure that the user's experience isn't degraded by missing icons etc.
    if (this.subjectsEncounteredSinceStartup.size >= this.subjectCacheLimit) {
      const cachedOrigin = this.subjectsEncounteredSinceStartup
        .values()
        .next().value;

      this.subjectsEncounteredSinceStartup.delete(cachedOrigin);
      if (!this.subjectHasPermissions(cachedOrigin)) {
        originToForget = cachedOrigin;
      }
    }

    this.subjectsEncounteredSinceStartup.add(origin);

    if (
      !newMetadata.extensionId &&
      !newMetadata.host &&
      /[a-z]+:\/\/\w.+/iu.test(origin)
    ) {
      try {
        newMetadata.host = new URL(origin).host;
      } catch (_) {
        // Do nothing. Some "origins" are not valid URLs.
      }
    }

    this.update((draftState) => {
      // Typecast: ts(2589)
      draftState.subjectMetadata[origin] = newMetadata as any;
      if (typeof originToForget === 'string') {
        delete draftState.subjectMetadata[originToForget];
      }
    });
  }

  /**
   * Deletes all subjects without permissions from the controller's state.
   */
  trimMetadataState(): void {
    this.update((draftState) => {
      SubjectMetadataController.trimMetadataState(
        // Typecast: ts(2589)
        draftState as any,
        this.subjectHasPermissions,
      );
    });
  }

  /**
   * Deletes all subjects without permissions from the given state object. This
   * method is static because we want to call it in the constructor, before the
   * controller's state is initialized.
   *
   * @param draftState - The `immer` draft state.
   * @param hasPermissions - A function that returns a boolean indicating
   * whether a particular subject (identified by its origin) has any
   * permissions.
   */
  private static trimMetadataState(
    draftState: SubjectMetadataControllerState,
    hasPermissions: SubjectMetadataController['subjectHasPermissions'],
  ): void {
    const { subjectMetadata } = draftState;

    Object.keys(subjectMetadata).forEach((origin) => {
      if (!hasPermissions(origin)) {
        delete subjectMetadata[origin];
      }
    });
  }
}
