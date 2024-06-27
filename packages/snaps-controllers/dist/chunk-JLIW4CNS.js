"use strict";Object.defineProperty(exports, "__esModule", {value: true});



var _chunkH7TB7I6Zjs = require('./chunk-H7TB7I6Z.js');



var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/interface/SnapInterfaceController.ts
var _basecontroller = require('@metamask/base-controller');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var _nanoid = require('nanoid');
var MAX_UI_CONTENT_SIZE = 1e7;
var controllerName = "SnapInterfaceController";
var _registerMessageHandlers, registerMessageHandlers_fn, _validateArgs, validateArgs_fn, _validateApproval, validateApproval_fn, _triggerPhishingListUpdate, triggerPhishingListUpdate_fn, _checkPhishingList, checkPhishingList_fn, _hasApprovalRequest, hasApprovalRequest_fn, _acceptApprovalRequest, acceptApprovalRequest_fn, _validateContent, validateContent_fn;
var SnapInterfaceController = class extends _basecontroller.BaseController {
  constructor({ messenger, state }) {
    super({
      messenger,
      metadata: {
        interfaces: { persist: false, anonymous: false }
      },
      name: controllerName,
      state: { interfaces: {}, ...state }
    });
    /**
     * Constructor helper for registering this controller's messaging system
     * actions.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _registerMessageHandlers);
    /**
     * Utility function to validate the args passed to the other methods.
     *
     * @param snapId - The snap id.
     * @param id - The interface id.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _validateArgs);
    /**
     * Utility function to validate that the approval request exists.
     *
     * @param id - The interface id.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _validateApproval);
    /**
     * Trigger a Phishing list update if needed.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _triggerPhishingListUpdate);
    /**
     * Check an origin against the phishing list.
     *
     * @param origin - The origin to check.
     * @returns True if the origin is on the phishing list, otherwise false.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _checkPhishingList);
    /**
     * Check if an approval request exists for a given interface by looking up
     * if the ApprovalController has a request with the given interface ID.
     *
     * @param id - The interface id.
     * @returns True if an approval request exists, otherwise false.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _hasApprovalRequest);
    /**
     * Accept an approval request for a given interface.
     *
     * @param id - The interface id.
     * @param value - The value to resolve the promise with.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _acceptApprovalRequest);
    /**
     * Utility function to validate the components of an interface.
     * Throws if something is invalid.
     *
     * @param element - The JSX element to verify.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _validateContent);
    _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _registerMessageHandlers, registerMessageHandlers_fn).call(this);
  }
  /**
   * Create an interface in the controller state with the associated data.
   *
   * @param snapId - The snap id that created the interface.
   * @param content - The interface content.
   * @param context - An optional interface context object.
   * @returns The newly interface id.
   */
  async createInterface(snapId, content, context) {
    const element = _chunkH7TB7I6Zjs.getJsxInterface.call(void 0, content);
    await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _validateContent, validateContent_fn).call(this, element);
    _chunkH7TB7I6Zjs.validateInterfaceContext.call(void 0, context);
    const id = _nanoid.nanoid.call(void 0, );
    const componentState = _chunkH7TB7I6Zjs.constructState.call(void 0, {}, element);
    this.update((draftState) => {
      draftState.interfaces[id] = {
        snapId,
        content: element,
        state: componentState,
        context: context ?? null
      };
    });
    return id;
  }
  /**
   * Get the data of a given interface id.
   *
   * @param snapId - The snap id requesting the interface data.
   * @param id - The interface id.
   * @returns The interface state.
   */
  getInterface(snapId, id) {
    _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _validateArgs, validateArgs_fn).call(this, snapId, id);
    return this.state.interfaces[id];
  }
  /**
   * Update the interface with the given content.
   *
   * @param snapId - The snap id requesting the update.
   * @param id - The interface id.
   * @param content - The new content.
   */
  async updateInterface(snapId, id, content) {
    _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _validateArgs, validateArgs_fn).call(this, snapId, id);
    const element = _chunkH7TB7I6Zjs.getJsxInterface.call(void 0, content);
    await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _validateContent, validateContent_fn).call(this, element);
    const oldState = this.state.interfaces[id].state;
    const newState = _chunkH7TB7I6Zjs.constructState.call(void 0, oldState, element);
    this.update((draftState) => {
      draftState.interfaces[id].state = newState;
      draftState.interfaces[id].content = element;
    });
  }
  /**
   * Delete an interface from state.
   *
   * @param id - The interface id.
   */
  deleteInterface(id) {
    this.update((draftState) => {
      delete draftState.interfaces[id];
    });
  }
  /**
   * Update the interface state.
   *
   * @param id - The interface id.
   * @param state - The new state.
   */
  updateInterfaceState(id, state) {
    this.update((draftState) => {
      draftState.interfaces[id].state = state;
    });
  }
  /**
   * Resolve the promise of a given interface approval request.
   * The approval needs to have the same ID as the interface.
   *
   * @param snapId - The snap id.
   * @param id - The interface id.
   * @param value - The value to resolve the promise with.
   */
  async resolveInterface(snapId, id, value) {
    _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _validateArgs, validateArgs_fn).call(this, snapId, id);
    _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _validateApproval, validateApproval_fn).call(this, id);
    await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _acceptApprovalRequest, acceptApprovalRequest_fn).call(this, id, value);
    this.deleteInterface(id);
  }
};
_registerMessageHandlers = new WeakSet();
registerMessageHandlers_fn = function() {
  this.messagingSystem.registerActionHandler(
    `${controllerName}:createInterface`,
    this.createInterface.bind(this)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:getInterface`,
    this.getInterface.bind(this)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:updateInterface`,
    this.updateInterface.bind(this)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:deleteInterface`,
    this.deleteInterface.bind(this)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:updateInterfaceState`,
    this.updateInterfaceState.bind(this)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:resolveInterface`,
    this.resolveInterface.bind(this)
  );
};
_validateArgs = new WeakSet();
validateArgs_fn = function(snapId, id) {
  const existingInterface = this.state.interfaces[id];
  _utils.assert.call(void 0, 
    existingInterface !== void 0,
    `Interface with id '${id}' not found.`
  );
  _utils.assert.call(void 0, 
    existingInterface.snapId === snapId,
    `Interface not created by ${snapId}.`
  );
};
_validateApproval = new WeakSet();
validateApproval_fn = function(id) {
  _utils.assert.call(void 0, 
    _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _hasApprovalRequest, hasApprovalRequest_fn).call(this, id),
    `Approval request with id '${id}' not found.`
  );
};
_triggerPhishingListUpdate = new WeakSet();
triggerPhishingListUpdate_fn = async function() {
  await this.messagingSystem.call("PhishingController:maybeUpdateState");
};
_checkPhishingList = new WeakSet();
checkPhishingList_fn = function(origin) {
  return this.messagingSystem.call("PhishingController:testOrigin", origin).result;
};
_hasApprovalRequest = new WeakSet();
hasApprovalRequest_fn = function(id) {
  return this.messagingSystem.call("ApprovalController:hasRequest", {
    id
  });
};
_acceptApprovalRequest = new WeakSet();
acceptApprovalRequest_fn = async function(id, value) {
  await this.messagingSystem.call(
    "ApprovalController:acceptRequest",
    id,
    value
  );
};
_validateContent = new WeakSet();
validateContent_fn = async function(element) {
  const size = _snapsutils.getJsonSizeUnsafe.call(void 0, element);
  _utils.assert.call(void 0, 
    size <= MAX_UI_CONTENT_SIZE,
    `A Snap UI may not be larger than ${MAX_UI_CONTENT_SIZE / 1e6} MB.`
  );
  await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _triggerPhishingListUpdate, triggerPhishingListUpdate_fn).call(this);
  _snapsutils.validateJsxLinks.call(void 0, element, _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _checkPhishingList, checkPhishingList_fn).bind(this));
};



exports.SnapInterfaceController = SnapInterfaceController;
//# sourceMappingURL=chunk-JLIW4CNS.js.map