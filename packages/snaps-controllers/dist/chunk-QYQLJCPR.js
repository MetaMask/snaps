"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkYYPUPKQYjs = require('./chunk-YYPUPKQY.js');



var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/insights/SnapInsightsController.ts
var _basecontroller = require('@metamask/base-controller');




var _snapsrpcmethods = require('@metamask/snaps-rpc-methods');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var controllerName = "SnapInsightsController";
var _hasInsight, hasInsight_fn, _getSnapsWithPermission, getSnapsWithPermission_fn, _handleTransaction, handleTransaction_fn, _handleSignatureStateChange, handleSignatureStateChange_fn, _handleSignature, handleSignature_fn, _handleTransactionStatusUpdate, handleTransactionStatusUpdate_fn, _handleInsightCleanup, handleInsightCleanup_fn, _handleSnapRequest, handleSnapRequest_fn, _handleSnapResponse, handleSnapResponse_fn;
var SnapInsightsController = class extends _basecontroller.BaseController {
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
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _hasInsight);
    /**
     * Get a list of runnable Snaps that have a given permission.
     * Also includes the permission object itself.
     *
     * @param permissionName - The permission name.
     * @returns A list of objects containing Snap IDs and the permission object.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _getSnapsWithPermission);
    /**
     * Handle a newly added unapproved transaction.
     * This function fetches insights from all available Snaps
     * and populates the insights state blob with the responses.
     *
     * @param transaction - The transaction object.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _handleTransaction);
    /**
     * Handle the stateChange event emitted by the SignatureController.
     * This function will remove existing insights from the state when applicable, as well as
     * trigger insight fetching for newly added signatures.
     *
     * @param state - The SignatureController state blob.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _handleSignatureStateChange);
    /**
     * Handle a newly added unapproved signature.
     * This function fetches insights from all available Snaps
     * and populates the insights state blob with the responses.
     *
     * @param snaps - A list of Snaps to invoke.
     * @param signature - The signature object.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _handleSignature);
    /**
     * Handle the transactionStatusUpdated event emitted by the TransactionController.
     * This function will remove insights for the transaction in question
     * once the transaction status has changed from unapproved.
     *
     * @param args - An options bag.
     * @param args.transactionMeta - The transaction.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _handleTransactionStatusUpdate);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _handleInsightCleanup);
    /**
     * Handle sending a request to a given Snap with a given payload.
     *
     * @param args - An options bag.
     * @param args.snapId - The Snap ID.
     * @param args.handler - The handler to invoke.
     * @param args.params - The JSON-RPC params to send.
     * @returns The response from the Snap.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _handleSnapRequest);
    /**
     * Handle response from a given Snap by persisting the response or error in state.
     *
     * @param args - An options bag.
     * @param args.id - The transaction or signature ID.
     * @param args.snapId - The Snap ID.
     * @param args.response - An optional response object returned by the Snap.
     * @param args.error - An optional error returned by the Snap.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _handleSnapResponse);
    this.messagingSystem.subscribe(
      "TransactionController:unapprovedTransactionAdded",
      _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleTransaction, handleTransaction_fn).bind(this)
    );
    this.messagingSystem.subscribe(
      "TransactionController:transactionStatusUpdated",
      _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleTransactionStatusUpdate, handleTransactionStatusUpdate_fn).bind(this)
    );
    this.messagingSystem.subscribe(
      "SignatureController:stateChange",
      _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleSignatureStateChange, handleSignatureStateChange_fn).bind(this)
    );
  }
};
_hasInsight = new WeakSet();
hasInsight_fn = function(id) {
  return _utils.hasProperty.call(void 0, this.state.insights, id);
};
_getSnapsWithPermission = new WeakSet();
getSnapsWithPermission_fn = function(permissionName) {
  const allSnaps = this.messagingSystem.call("SnapController:getAll");
  const filteredSnaps = _chunkYYPUPKQYjs.getRunnableSnaps.call(void 0, allSnaps);
  return filteredSnaps.reduce((accumulator, snap) => {
    const permissions = this.messagingSystem.call(
      "PermissionController:getPermissions",
      snap.id
    );
    if (permissions && _utils.hasProperty.call(void 0, permissions, permissionName)) {
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
  const snaps = _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _getSnapsWithPermission, getSnapsWithPermission_fn).call(this, _snapsrpcmethods.SnapEndowments.TransactionInsight);
  snaps.forEach(({ snapId, permission }) => {
    const hasTransactionOriginCaveat = _snapsrpcmethods.getTransactionOriginCaveat.call(void 0, permission);
    const transactionOrigin = hasTransactionOriginCaveat && origin ? origin : null;
    this.update((state) => {
      var _a;
      (_a = state.insights)[id] ?? (_a[id] = {});
      state.insights[id][snapId] = { snapId, loading: true };
    });
    _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleSnapRequest, handleSnapRequest_fn).call(this, {
      snapId,
      handler: _snapsutils.HandlerType.OnTransaction,
      params: {
        transaction: txParams,
        chainId: caipChainId,
        transactionOrigin
      }
    }).then(
      (response) => _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleSnapResponse, handleSnapResponse_fn).call(this, {
        id,
        snapId,
        response
      })
    ).catch((error) => _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleSnapResponse, handleSnapResponse_fn).call(this, { id, snapId, error }));
  });
};
_handleSignatureStateChange = new WeakSet();
handleSignatureStateChange_fn = function(state) {
  for (const id of Object.keys(this.state.insights)) {
    if (!_utils.hasProperty.call(void 0, state.unapprovedTypedMessages, id) && !_utils.hasProperty.call(void 0, state.unapprovedPersonalMsgs, id)) {
      _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleInsightCleanup, handleInsightCleanup_fn).call(this, id);
    }
  }
  if (state.unapprovedPersonalMsgCount > 0 || state.unapprovedTypedMessagesCount > 0) {
    const snaps = _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _getSnapsWithPermission, getSnapsWithPermission_fn).call(this, _snapsrpcmethods.SnapEndowments.SignatureInsight);
    for (const personalSignature of Object.values(
      state.unapprovedPersonalMsgs
    )) {
      _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleSignature, handleSignature_fn).call(this, snaps, personalSignature);
    }
    for (const typedMessage of Object.values(state.unapprovedTypedMessages)) {
      _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleSignature, handleSignature_fn).call(this, snaps, typedMessage);
    }
  }
};
_handleSignature = new WeakSet();
handleSignature_fn = function(snaps, signature) {
  const { id, msgParams } = signature;
  if (_chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _hasInsight, hasInsight_fn).call(this, id)) {
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
    const hasSignatureOriginCaveat = _snapsrpcmethods.getSignatureOriginCaveat.call(void 0, permission);
    const signatureOrigin = origin && hasSignatureOriginCaveat ? origin : null;
    this.update((state) => {
      var _a;
      (_a = state.insights)[id] ?? (_a[id] = {});
      state.insights[id][snapId] = { snapId, loading: true };
    });
    _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleSnapRequest, handleSnapRequest_fn).call(this, {
      snapId,
      handler: _snapsutils.HandlerType.OnSignature,
      params: { signature: payload, signatureOrigin }
    }).then(
      (response) => _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleSnapResponse, handleSnapResponse_fn).call(this, {
        id,
        snapId,
        response
      })
    ).catch((error) => _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleSnapResponse, handleSnapResponse_fn).call(this, { id, snapId, error }));
  });
};
_handleTransactionStatusUpdate = new WeakSet();
handleTransactionStatusUpdate_fn = function({
  transactionMeta
}) {
  if (transactionMeta.status !== "unapproved") {
    _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _handleInsightCleanup, handleInsightCleanup_fn).call(this, transactionMeta.id);
  }
};
_handleInsightCleanup = new WeakSet();
handleInsightCleanup_fn = function(id) {
  if (!_chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _hasInsight, hasInsight_fn).call(this, id)) {
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



exports.SnapInsightsController = SnapInsightsController;
//# sourceMappingURL=chunk-QYQLJCPR.js.map