import { SnapId } from '@metamask/snap-types';
import {
  DEFAULT_REQUESTED_SNAP_VERSION,
  getSnapPermissionName,
  NpmSnapFileNames,
  satisfiesVersionRange,
  SnapIdPrefixes,
  SnapManifest,
  ValidatedSnapId,
  validateSnapJsonFile,
} from '@metamask/snap-utils';
import { Json } from '@metamask/utils';
import { StateMachine } from '@xstate/fsm';
import { InitEvent } from '@xstate/fsm/lib/types';
import { assert } from '../utils';
import type { SetSnapArgs, SnapError } from './SnapController';

export type RequestedSnapPermissions = {
  [permission: string]: Record<string, Json>;
};

export type BlockedSnapInfo = { infoUrl?: string; reason?: string };

/**
 * A Snap as it exists in {@link SnapController} state.
 */
export type Snap = {
  /**
   * The ID of the Snap.
   */
  id: SnapId;

  /**
   * The initial permissions of the Snap, which will be requested when it is
   * installed.
   */
  initialPermissions: RequestedSnapPermissions;

  /**
   * The Snap's manifest file.
   */
  manifest: SnapManifest;

  /**
   * Information detailing why the snap is blocked.
   */
  blockInformation?: BlockedSnapInfo;

  /**
   * The name of the permission used to invoke the Snap.
   */
  permissionName: string;

  /**
   * The source code of the Snap.
   */
  sourceCode: string;

  /**
   * The current status of the Snap, e.g. whether it's running, disabled or stopped.
   */
  status: Status;

  /**
   * The version of the Snap.
   */
  version: string;

  /**
   * The version history of the Snap.
   * Can be used to derive when the Snap was installed, when it was updated to a certain version and who requested the change.
   */
  versionHistory: VersionHistory[];
};

export type VersionHistory = {
  origin: string;
  version: string;
  // Unix timestamp
  date: number;
};

/////////////////////////
// #region Snap status //
/////////////////////////

// TODO(ritave): Add error list to bubble, add runtime data, add messaging system
export type StatusContext = { snap?: Snap };

export type StatusEvents =
  | {
      type:
        | 'INSTALLED'
        | 'START'
        | 'STARTED'
        | 'STOP'
        | 'DISABLE'
        | 'ENABLE'
        | 'UNBLOCK';
    }
  | {
      type: 'INSTALL' | 'UPDATE';
      origin: string;
      snapId: SnapId;
      versionRange: string;
    }
  | { type: 'CRASH'; error: SnapError }
  | {
      type: 'BLOCK';
      reason: BlockedSnapInfo;
    };

export type StatusStates =
  | { value: 'uninstalled'; context: {} }
  | { value: 'installing'; context: { snap?: Snap } }
  | {
      value:
        | 'updating'
        | 'stopped'
        | 'starting'
        | 'running'
        | 'stopping'
        | 'disabled'
        | 'blocked';
      context: { snap: Snap };
    };

export type Status = StatusStates['value'];

export function isRunning(snap: Snap) {
  return snap.status === 'running' || snap.status === 'starting';
}

export function isInstalling(snap: Snap) {
  return snap.status === 'installing' || snap.status === 'updating';
}

export function isEnabled(snap: Snap) {
  return snap.status !== 'disabled' && snap.status !== 'blocked';
}

export function isBlocked(snap: Snap) {
  return snap.status === 'blocked';
}

export function isStarting(snap: Snap) {
  return snap.status === 'starting';
}

export function isStopping(snap: Snap) {
  return snap.status === 'stopping';
}

export function validateSnapId(
  snapId: unknown,
): asserts snapId is ValidatedSnapId {
  if (!snapId || typeof snapId !== 'string') {
    throw new Error(`Invalid snap id: Not a string. Received "${snapId}"`);
  }

  for (const prefix of Object.values(SnapIdPrefixes)) {
    if (snapId.startsWith(prefix) && snapId.replace(prefix, '').length > 0) {
      return;
    }
  }

  throw new Error(`Invalid snap id. Received: "${snapId}"`);
}

function transformBlock(
  { snap }: StatusContext,
  event: StatusEvents | InitEvent,
) {
  assert(event.type === 'BLOCK' && snap !== undefined);
  snap.blockInformation = event.reason;
}

function transformUnblock({ snap }: StatusContext) {
  assert(snap !== undefined);
  delete snap.blockInformation;
}

function transformStatus(value: StatusStates['value']) {
  return (ctx: StatusContext) => {
    assert(ctx.snap !== undefined);
    ctx.snap = {
      ...ctx.snap,
      status: value,
    };
  };
}

export function transformSetSnap(ctx: StatusContext, data: SetSnapArgs) {
  const {
    id: snapId,
    origin,
    manifest,
    sourceCode,
    versionRange = DEFAULT_REQUESTED_SNAP_VERSION,
  } = data;

  validateSnapJsonFile(NpmSnapFileNames.Manifest, manifest);
  const { version } = manifest;

  if (!satisfiesVersionRange(version, versionRange)) {
    throw new Error(
      `Version mismatch. Manifest for "${snapId}" specifies version "${version}" which doesn't satisfy requested version range "${versionRange}"`,
    );
  }

  if (typeof sourceCode !== 'string' || sourceCode.length === 0) {
    throw new Error(`Invalid source code for snap "${snapId}".`);
  }

  const initialPermissions = manifest?.initialPermissions;
  if (
    !initialPermissions ||
    typeof initialPermissions !== 'object' ||
    Array.isArray(initialPermissions)
  ) {
    throw new Error(`Invalid initial permissions for snap "${snapId}".`);
  }

  const existingSnap = ctx.snap;

  const previousVersionHistory = existingSnap?.versionHistory ?? [];
  const versionHistory = [
    ...previousVersionHistory,
    {
      version,
      date: Date.now(),
      origin,
    },
  ];

  const snap: Snap = {
    status: 'installing',

    // Restore relevant snap state if it exists
    ...existingSnap,

    // So we can easily correlate the snap with its permission
    permissionName: getSnapPermissionName(snapId),

    id: snapId,
    initialPermissions,
    manifest,
    sourceCode,
    version,
    versionHistory,
  };
  // If the snap was blocked, it isn't any longer
  delete snap.blockInformation;

  ctx.snap = snap;
  return snap;
}

// TODO(ritave): Move to xstate package and use nested states for installing / updating / stopping / starting?
export const statusConfig: StateMachine.Config<
  StatusContext,
  StatusEvents,
  StatusStates
> = {
  initial: 'uninstalled',
  states: {
    uninstalled: {
      on: {
        INSTALL: 'installing',
      },
    },
    installing: {
      entry: ['effectInstallSnap'],
      exit: ['effectSnapInstalled'],
      on: {
        INSTALLED: {
          target: 'starting',
        },
      },
    },
    updating: {
      entry: [transformStatus('updating'), 'updateState', 'effectUpdateSnap'],
      exit: ['effectSnapInstalled', 'effectSnapUpdated'],
      on: {
        INSTALLED: {
          target: 'starting',
        },
      },
    },
    starting: {
      entry: [transformStatus('starting'), 'updateState', 'effectStartSnap'],
      on: {
        STARTED: {
          target: 'running',
        },
        STOP: {
          target: 'stopping',
        },
        DISABLE: {
          target: 'stopping',
        },
        BLOCK: {
          target: 'stopping',
        },
        CRASH: {
          target: 'stopping',
        },
        UPDATE: {
          target: 'stopping',
        },
        INSTALL: {
          target: 'stopping',
        },
      },
    },
    running: {
      entry: [transformStatus('running'), 'updateState'],
      on: {
        STOP: {
          target: 'stopping',
        },
        DISABLE: {
          target: 'stopping',
        },
        BLOCK: {
          target: 'stopping',
        },
        CRASH: {
          target: 'stopping',
        },
        UPDATE: {
          target: 'stopping',
        },
        INSTALL: {
          target: 'stopping',
        },
      },
    },
    stopping: {
      entry: [transformStatus('stopping'), 'updateState', 'effectStopSnap'],
      on: {
        STOP: {
          target: 'stopped',
        },
        CRASH: {
          target: 'stopped',
          actions: ['effectOnCrash'],
        },
        DISABLE: {
          target: 'disabled',
        },
        BLOCK: {
          target: 'blocked',
        },
        UPDATE: {
          target: 'updating',
        },
        INSTALL: {
          target: 'installing',
        },
      },
    },
    stopped: {
      entry: [transformStatus('stopped'), 'updateState'],
      on: {
        START: {
          target: 'running',
        },
        DISABLE: {
          target: 'disabled',
        },
        BLOCK: {
          target: 'blocked',
        },
        UPDATE: {
          target: 'updating',
        },
        INSTALL: {
          target: 'installing',
        },
      },
    },
    disabled: {
      entry: [transformStatus('disabled'), 'updateState', 'effectDisableSnap'],
      on: {
        ENABLE: {
          target: 'stopped',
          actions: ['effectEnableSnap'],
        },
        BLOCK: {
          target: 'blocked',
        },
        UPDATE: {
          target: 'updating',
        },
        INSTALL: {
          target: 'installing',
        },
      },
    },
    blocked: {
      entry: [
        transformStatus('blocked'),
        transformBlock,
        'updateState',
        'effectBlockSnap',
      ],
      exit: [transformUnblock, 'updateState', 'effectUnblockSnap'],
      on: {
        UNBLOCK: {
          target: 'disabled',
        },
        UPDATE: {
          target: 'updating',
        },
        INSTALL: {
          target: 'installing',
        },
      },
    },
  },
};

// #endregion

type TruncatedSnapFields =
  | 'id'
  | 'initialPermissions'
  | 'permissionName'
  | 'version';

const TRUNCATED_SNAP_PROPERTIES = new Set<TruncatedSnapFields>([
  'initialPermissions',
  'id',
  'permissionName',
  'version',
]);

/**
 * A {@link Snap} object with the fields that are relevant to an external
 * caller.
 */
export type TruncatedSnap = Pick<Snap, TruncatedSnapFields>;

export function truncateSnap(snap: Snap): TruncatedSnap {
  return Object.keys(snap).reduce((serialized, key) => {
    if (TRUNCATED_SNAP_PROPERTIES.has(key as any)) {
      serialized[key as keyof TruncatedSnap] = snap[
        key as keyof TruncatedSnap
      ] as any;
    }

    return serialized;
  }, {} as Partial<TruncatedSnap>) as TruncatedSnap;
}
