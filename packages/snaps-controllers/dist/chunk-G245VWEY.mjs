import {
  getRunnableSnaps
} from "./chunk-P7Y6MIZW.mjs";
import {
  __privateAdd,
  __privateMethod
} from "./chunk-YRZVIDCF.mjs";

// src/insights/SnapInsightsController.ts
import { BaseController } from "@metamask/base-controller";
import {
  getSignatureOriginCaveat,
  getTransactionOriginCaveat,
  SnapEndowments
} from "@metamask/snaps-rpc-methods";
import { HandlerType } from "@metamask/snaps-utils";
import { hasProperty } from "@metamask/utils";
var controllerName = "SnapInsightsController";
var _hasInsight, hasInsight_fn, _getSnapsWithPermission, getSnapsWithPermission_fn, _handleTransaction, handleTransaction_fn, _handleSignatureStateChange, handleSignatureStateChange_fn, _handleSignature, handleSignature_fn, _handleTransactionStatusUpdate, handleTransactionStatusUpdate_fn, _handleInsightCleanup, handleInsightCleanup_fn, _handleSnapRequest, handleSnapRequest_fn, _handleSnapResponse, handleSnapResponse_fn;
var SnapInsightsController = class extends BaseController {
  constructor({ messenger, state }) {
    super({
      messenger,
      metadata: {
        insights: { persist: false, anonymous: false }
      },
      name: controllerName,
      state: { insights: {}, ...state }
    });
    /**
     * Check if an insight already exists for a given ID.
     *
     * @param id - The ID.
     * @returns True if the insight already exists, otherwise false.
     */
    __privateAdd(this, _hasInsight);
    /**
     * Get a list of runnable Snaps that have a given permission.
     * Also includes the permission object itself.
     *
     * @param permissionName - The permission name.
     * @returns A list of objects containing Snap IDs and the permission object.
     */
    __privateAdd(this, _getSnapsWithPermission);
    /**
     * Handle a newly added unapproved transaction.
     * This function fetches insights from all available Snaps
     * and populates the insights state blob with the responses.
     *
     * @param transaction - The transaction object.
     */
    __privateAdd(this, _handleTransaction);
    /**
     * Handle the stateChange event emitted by the SignatureController.
     * This function will remove existing insights from the state when applicable, as well as
     * trigger insight fetching for newly added signatures.
     *
     * @param state - The SignatureController state blob.
     */
    __privateAdd(this, _handleSignatureStateChange);
    /**
     * Handle a newly added unapproved signature.
     * This function fetches insights from all available Snaps
     * and populates the insights state blob with the responses.
     *
     * @param snaps - A list of Snaps to invoke.
     * @param signature - The signature object.
     */
    __privateAdd(this, _handleSignature);
    /**
     * Handle the transactionStatusUpdated event emitted by the TransactionController.
     * This function will remove insights for the transaction in question
     * once the transaction status has changed from unapproved.
     *
     * @param args - An options bag.
     * @param args.transactionMeta - The transaction.
     */
    __privateAdd(this, _handleTransactionStatusUpdate);
    __privateAdd(this, _handleInsightCleanup);
    /**
     * Handle sending a request to a given Snap with a given payload.
     *
     * @param args - An options bag.
     * @param args.snapId - The Snap ID.
     * @param args.handler - The handler to invoke.
     * @param args.params - The JSON-RPC params to send.
     * @returns The response from the Snap.
     */
    __privateAdd(this, _handleSnapRequest);
    /**
     * Handle response from a given Snap by persisting the response or error in state.
     *
     * @param args - An options bag.
     * @param args.id - The transaction or signature ID.
     * @param args.snapId - The Snap ID.
     * @param args.response - An optional response object returned by the Snap.
     * @param args.error - An optional error returned by the Snap.
     */
    __privateAdd(this, _handleSnapResponse);
    this.messagingSystem.subscribe(
      "TransactionController:unapprovedTransactionAdded",
      __privateMethod(this, _handleTransaction, handleTransaction_fn).bind(this)
    );
    this.messagingSystem.subscribe(
      "TransactionController:transactionStatusUpdated",
      __privateMethod(this, _handleTransactionStatusUpdate, handleTransactionStatusUpdate_fn).bind(this)
    );
    this.messagingSystem.subscribe(
      "SignatureController:stateChange",
      __privateMethod(this, _handleSignatureStateChange, handleSignatureStateChange_fn).bind(this)
    );
  }
};
_hasInsight = new WeakSet();
hasInsight_fn = function(id) {
  return hasProperty(this.state.insights, id);
};
_getSnapsWithPermission = new WeakSet();
getSnapsWithPermission_fn = function(permissionName) {
  const allSnaps = this.messagingSystem.call("SnapController:getAll");
  const filteredSnaps = getRunnableSnaps(allSnaps);
  return filteredSnaps.reduce((accumulator, snap) => {
    const permissions = this.messagingSystem.call(
      "PermissionController:getPermissions",
      snap.id
    );
    if (permissions && hasProperty(permissions, permissionName)) {
      accumulator.push({
        snapId: snap.id,
        permission: permissions[permissionName]
      });
    }
    return accumulator;
  }, []);
};
_handleTransaction = new WeakSet();
handleTransaction_fn = function(transaction) {
  const { id, txParams, chainId, origin } = transaction;
  const caipChainId = `eip155:${parseInt(chainId, 16)}`;
  const snaps = __privateMethod(this, _getSnapsWithPermission, getSnapsWithPermission_fn).call(this, SnapEndowments.TransactionInsight);
  snaps.forEach(({ snapId, permission }) => {
    const hasTransactionOriginCaveat = getTransactionOriginCaveat(permission);
    const transactionOrigin = hasTransactionOriginCaveat && origin ? origin : null;
    this.update((state) => {
      var _a;
      (_a = state.insights)[id] ?? (_a[id] = {});
      state.insights[id][snapId] = { snapId, loading: true };
    });
    __privateMethod(this, _handleSnapRequest, handleSnapRequest_fn).call(this, {
      snapId,
      handler: HandlerType.OnTransaction,
      params: {
        transaction: txParams,
        chainId: caipChainId,
        transactionOrigin
      }
    }).then(
      (response) => __privateMethod(this, _handleSnapResponse, handleSnapResponse_fn).call(this, {
        id,
        snapId,
        response
      })
    ).catch((error) => __privateMethod(this, _handleSnapResponse, handleSnapResponse_fn).call(this, { id, snapId, error }));
  });
};
_handleSignatureStateChange = new WeakSet();
handleSignatureStateChange_fn = function(state) {
  for (const id of Object.keys(this.state.insights)) {
    if (!hasProperty(state.unapprovedTypedMessages, id) && !hasProperty(state.unapprovedPersonalMsgs, id)) {
      __privateMethod(this, _handleInsightCleanup, handleInsightCleanup_fn).call(this, id);
    }
  }
  if (state.unapprovedPersonalMsgCount > 0 || state.unapprovedTypedMessagesCount > 0) {
    const snaps = __privateMethod(this, _getSnapsWithPermission, getSnapsWithPermission_fn).call(this, SnapEndowments.SignatureInsight);
    for (const personalSignature of Object.values(
      state.unapprovedPersonalMsgs
    )) {
      __privateMethod(this, _handleSignature, handleSignature_fn).call(this, snaps, personalSignature);
    }
    for (const typedMessage of Object.values(state.unapprovedTypedMessages)) {
      __privateMethod(this, _handleSignature, handleSignature_fn).call(this, snaps, typedMessage);
    }
  }
};
_handleSignature = new WeakSet();
handleSignature_fn = function(snaps, signature) {
  const { id, msgParams } = signature;
  if (__privateMethod(this, _hasInsight, hasInsight_fn).call(this, id)) {
    return;
  }
  const { from, data, signatureMethod, origin } = msgParams;
  const shouldParse = signatureMethod === "eth_signTypedData_v3" || signatureMethod === "eth_signTypedData_v4";
  const payload = {
    from,
    data: shouldParse ? JSON.parse(data) : data,
    signatureMethod
  };
  snaps.forEach(({ snapId, permission }) => {
    const hasSignatureOriginCaveat = getSignatureOriginCaveat(permission);
    const signatureOrigin = origin && hasSignatureOriginCaveat ? origin : null;
    this.update((state) => {
      var _a;
      (_a = state.insights)[id] ?? (_a[id] = {});
      state.insights[id][snapId] = { snapId, loading: true };
    });
    __privateMethod(this, _handleSnapRequest, handleSnapRequest_fn).call(this, {
      snapId,
      handler: HandlerType.OnSignature,
      params: { signature: payload, signatureOrigin }
    }).then(
      (response) => __privateMethod(this, _handleSnapResponse, handleSnapResponse_fn).call(this, {
        id,
        snapId,
        response
      })
    ).catch((error) => __privateMethod(this, _handleSnapResponse, handleSnapResponse_fn).call(this, { id, snapId, error }));
  });
};
_handleTransactionStatusUpdate = new WeakSet();
handleTransactionStatusUpdate_fn = function({
  transactionMeta
}) {
  if (transactionMeta.status !== "unapproved") {
    __privateMethod(this, _handleInsightCleanup, handleInsightCleanup_fn).call(this, transactionMeta.id);
  }
};
_handleInsightCleanup = new WeakSet();
handleInsightCleanup_fn = function(id) {
  if (!__privateMethod(this, _hasInsight, hasInsight_fn).call(this, id)) {
    return;
  }
  Object.values(this.state.insights[id]).filter((insight) => insight.interfaceId).forEach((insight) => {
    this.messagingSystem.call(
      "SnapInterfaceController:deleteInterface",
      insight.interfaceId
    );
  });
  this.update((state) => {
    delete state.insights[id];
  });
};
_handleSnapRequest = new WeakSet();
handleSnapRequest_fn = async function({
  snapId,
  handler,
  params
}) {
  return this.messagingSystem.call("SnapController:handleRequest", {
    snapId,
    origin: "",
    handler,
    request: {
      method: "",
      params
    }
  });
};
_handleSnapResponse = new WeakSet();
handleSnapResponse_fn = function({
  id,
  snapId,
  response,
  error
}) {
  this.update((state) => {
    state.insights[id][snapId].loading = false;
    state.insights[id][snapId].interfaceId = response?.id;
    state.insights[id][snapId].error = error?.message;
  });
};

export {
  SnapInsightsController
};
//# sourceMappingURL=chunk-G245VWEY.mjs.map