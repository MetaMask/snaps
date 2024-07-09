import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import {
  TransactionControllerUnapprovedTransactionAddedEvent,
  TransactionMeta,
} from '@metamask/transaction-controller';
import {
  SignatureController,
  SignatureStateChange,
} from '@metamask/signature-controller';
import { GetAllSnaps, getRunnableSnaps, HandleSnapRequest } from '../snaps';
import { Json, SnapId } from '@metamask/snaps-sdk';
import { HandlerType } from '@metamask/snaps-utils';
import { hasProperty } from '@metamask/utils';
import {
  getSignatureOriginCaveat,
  getTransactionOriginCaveat,
  SnapEndowments,
} from '@metamask/snaps-rpc-methods';
import {
  Caveat,
  GetPermissions,
  ValidPermission,
} from '@metamask/permission-controller';

const controllerName = 'SnapInsightController';

export type SnapInsightControllerAllowedActions =
  | HandleSnapRequest
  | GetAllSnaps
  | GetPermissions;

export type SnapInsightControllerActions = never;

export type SnapInsightControllerAllowedEvents =
  | TransactionControllerUnapprovedTransactionAddedEvent
  | SignatureStateChange;

export type SnapInsightControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  SnapInsightControllerActions | SnapInsightControllerAllowedActions,
  SnapInsightControllerAllowedEvents,
  SnapInsightControllerAllowedActions['type'],
  SnapInsightControllerAllowedEvents['type']
>;

export type SnapInsight = {
  snapId: SnapId;
  interfaceId?: string;
  error?: string;
};

export type SnapInsights = {
  loading: boolean;
  results: SnapInsight[];
};

export type SnapInsightControllerState = {
  insights: Record<string, SnapInsights>;
};

export type SnapInsightControllerArgs = {
  messenger: SnapInsightControllerMessenger;
  state?: SnapInsightControllerState;
};

// The controller doesn't currently export this, so we grab it this way.
type SignatureControllerState = SignatureController['state'];
type StateSignature = SignatureControllerState['unapprovedTypedMessages']['0'];
type SignatureParams = StateSignature['msgParams'] & {
  data: string | Record<string, Json>;
  signatureMethod: string;
};

type SnapWithPermission = {
  snapId: SnapId;
  permission: ValidPermission<string, Caveat<string, Json>>;
};

/**
 * Controller for monitoring for new transactions and signatures to provide insight for.
 */
export class SnapInsightController extends BaseController<
  typeof controllerName,
  SnapInsightControllerState,
  SnapInsightControllerMessenger
> {
  constructor({ messenger, state }: SnapInsightControllerArgs) {
    super({
      messenger,
      metadata: {
        insights: { persist: false, anonymous: false },
      },
      name: controllerName,
      state: { insights: {}, ...state },
    });

    this.messagingSystem.subscribe(
      'TransactionController:unapprovedTransactionAdded',
      this.#handleTransaction.bind(this),
    );

    this.messagingSystem.subscribe(
      'SignatureController:stateChange',
      this.#handleSignatureStateChange.bind(this),
    );
  }

  #hasInsight(id: string) {
    return hasProperty(this.state.insights, id);
  }

  #getSnapsWithPermission(permissionName: string) {
    const allSnaps = this.messagingSystem.call('SnapController:getAll');
    const filteredSnaps = getRunnableSnaps(allSnaps);

    return filteredSnaps.reduce<SnapWithPermission[]>((accumulator, snap) => {
      const permissions = this.messagingSystem.call(
        'PermissionController:getPermissions',
        snap.id,
      );
      if (permissions && hasProperty(permissions, permissionName)) {
        accumulator.push({
          snapId: snap.id,
          permission: permissions[permissionName],
        });
      }

      return accumulator;
    }, []);
  }

  #handleTransaction(transaction: TransactionMeta) {
    const { id, txParams, chainId, origin } = transaction;

    const snaps = this.#getSnapsWithPermission(
      SnapEndowments.TransactionInsight,
    );

    const promises = snaps.map(({ snapId, permission }) => {
      const hasTransactionOriginCaveat = getTransactionOriginCaveat(permission);
      const transactionOrigin =
        hasTransactionOriginCaveat && origin ? origin : null;

      return this.#handleSnapRequest({
        snapId,
        handler: HandlerType.OnTransaction,
        params: { transaction: txParams, chainId, transactionOrigin },
      });
    });

    this.update((state) => {
      state.insights[id] = { loading: true, results: [] };
    });

    Promise.allSettled(promises).then((settled) => {
      const results = settled.map((promise, idx) => {
        const snapId = snaps[idx].snapId;
        if (promise.status === 'rejected') {
          return {
            error: promise.reason,
            snapId,
          };
        }
        return {
          snapId,
          response: promise.value,
        };
      });
      this.update((state) => {
        state.insights[id].loading = false;
        state.insights[id].results = results;
      });
    });
  }

  #handleSignatureStateChange(state: SignatureControllerState) {
    const snaps = this.#getSnapsWithPermission(SnapEndowments.SignatureInsight);

    // This isn't very efficient, but SignatureController doesn't expose a better event for us to use yet.
    for (const personalSignature of Object.values(
      state.unapprovedPersonalMsgs,
    )) {
      this.#handleSignature(snaps, personalSignature);
    }

    for (const typedMessage of Object.values(state.unapprovedTypedMessages)) {
      this.#handleSignature(snaps, typedMessage);
    }
  }

  #handleSignature(snaps: SnapWithPermission[], signature: StateSignature) {
    const { id, msgParams } = signature;

    if (this.#hasInsight(id)) {
      return;
    }

    const { from, data, signatureMethod, origin } =
      msgParams as SignatureParams;

    /**
     * Both eth_signTypedData_v3 and eth_signTypedData_v4 methods
     * need to be parsed because their data is stringified. All other
     * signature methods do not, so they are ignored.
     */
    const shouldParse =
      signatureMethod === 'eth_signTypedData_v3' ||
      signatureMethod === 'eth_signTypedData_v4';

    const payload = {
      from,
      data: shouldParse ? JSON.parse(data as string) : data,
      signatureMethod,
    };

    const promises = snaps.map(({ snapId, permission }) => {
      const hasSignatureOriginCaveat = getSignatureOriginCaveat(permission);
      const signatureOrigin = hasSignatureOriginCaveat ? origin : null;

      return this.#handleSnapRequest({
        snapId,
        handler: HandlerType.OnTransaction,
        params: { signature: payload, signatureOrigin },
      });
    });

    this.update((state) => {
      state.insights[id] = { loading: true, results: [] };
    });

    Promise.allSettled(promises).then((settled) => {
      const results = settled.map((promise, idx) => {
        const snapId = snaps[idx].snapId;
        if (promise.status === 'rejected') {
          return {
            error: promise.reason,
            snapId,
          };
        }
        return {
          snapId,
          response: promise.value,
        };
      });
      this.update((state) => {
        state.insights[id].loading = false;
        state.insights[id].results = results;
      });
    });
  }

  #handleSnapRequest({
    snapId,
    handler,
    params,
  }: {
    snapId: SnapId;
    handler: HandlerType.OnTransaction | HandlerType.OnSignature;
    params: Record<string, Json>;
  }) {
    return this.messagingSystem.call('SnapController:handleRequest', {
      snapId: snapId,
      origin: '',
      handler,
      request: {
        method: '',
        params,
      },
    });
  }
}
