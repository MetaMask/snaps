import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type {
  Caveat,
  GetPermissions,
  ValidPermission,
} from '@metamask/permission-controller';
import type {
  SignatureController,
  SignatureStateChange,
} from '@metamask/signature-controller';
import {
  getSignatureOriginCaveat,
  getTransactionOriginCaveat,
  SnapEndowments,
} from '@metamask/snaps-rpc-methods';
import type { Json, SnapId } from '@metamask/snaps-sdk';
import { HandlerType } from '@metamask/snaps-utils';
import type {
  TransactionControllerUnapprovedTransactionAddedEvent,
  TransactionMeta,
} from '@metamask/transaction-controller';
import { hasProperty } from '@metamask/utils';

import type { GetAllSnaps, HandleSnapRequest } from '../snaps';
import { getRunnableSnaps } from '../snaps';

const controllerName = 'SnapInsightsController';

export type SnapInsightsControllerAllowedActions =
  | HandleSnapRequest
  | GetAllSnaps
  | GetPermissions;

export type SnapInsightsControllerActions = never;

export type SnapInsightsControllerAllowedEvents =
  | TransactionControllerUnapprovedTransactionAddedEvent
  | SignatureStateChange;

export type SnapInsightsControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  SnapInsightsControllerActions | SnapInsightsControllerAllowedActions,
  SnapInsightsControllerAllowedEvents,
  SnapInsightsControllerAllowedActions['type'],
  SnapInsightsControllerAllowedEvents['type']
>;

export type SnapInsight = {
  snapId: SnapId;
  interfaceId?: string | null;
  error?: string;
  loading: boolean;
};

export type SnapInsightsControllerState = {
  insights: Record<string, Record<SnapId, SnapInsight>>;
};

export type SnapInsightsControllerArgs = {
  messenger: SnapInsightsControllerMessenger;
  state?: SnapInsightsControllerState;
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
export class SnapInsightsController extends BaseController<
  typeof controllerName,
  SnapInsightsControllerState,
  SnapInsightsControllerMessenger
> {
  constructor({ messenger, state }: SnapInsightsControllerArgs) {
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

    snaps.forEach(({ snapId, permission }) => {
      const hasTransactionOriginCaveat = getTransactionOriginCaveat(permission);
      const transactionOrigin =
        hasTransactionOriginCaveat && origin ? origin : null;

      this.update((state) => {
        if (!state.insights[id]) {
          state.insights[id] = {};
        }
        state.insights[id][snapId] = { snapId, loading: true };
      });

      this.#handleSnapRequest({
        snapId,
        handler: HandlerType.OnTransaction,
        params: { transaction: txParams, chainId, transactionOrigin },
      })
        .then((response) =>
          this.#handleSnapResponse({
            id,
            snapId,
            response: response as Record<string, Json>,
          }),
        )
        .catch((error) => this.#handleSnapResponse({ id, snapId, error }));
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

    snaps.forEach(({ snapId, permission }) => {
      const hasSignatureOriginCaveat = getSignatureOriginCaveat(permission);
      const signatureOrigin = hasSignatureOriginCaveat ? origin : null;

      this.update((state) => {
        if (!state.insights[id]) {
          state.insights[id] = {};
        }
        state.insights[id][snapId] = { snapId, loading: true };
      });

      this.#handleSnapRequest({
        snapId,
        handler: HandlerType.OnSignature,
        params: { signature: payload, signatureOrigin },
      })
        .then((response) =>
          this.#handleSnapResponse({
            id,
            snapId,
            response: response as Record<string, Json>,
          }),
        )
        .catch((error) => this.#handleSnapResponse({ id, snapId, error }));
    });
  }

  async #handleSnapRequest({
    snapId,
    handler,
    params,
  }: {
    snapId: SnapId;
    handler: HandlerType.OnTransaction | HandlerType.OnSignature;
    params: Record<string, Json>;
  }) {
    return this.messagingSystem.call('SnapController:handleRequest', {
      snapId,
      origin: '',
      handler,
      request: {
        method: '',
        params,
      },
    });
  }

  #handleSnapResponse({
    id,
    snapId,
    response,
    error,
  }: {
    id: string;
    snapId: SnapId;
    response?: Record<string, Json>;
    error?: Error;
  }) {
    this.update((state) => {
      state.insights[id][snapId].loading = false;
      state.insights[id][snapId].interfaceId = response?.id as string;
      state.insights[id][snapId].error = error?.message;
    });
  }
}
