"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkBMGHZPDFjs = require('./chunk-BMGHZPDF.js');


var _chunkXAOCS6ZDjs = require('./chunk-XAOCS6ZD.js');

// src/internals/simulation/controllers.ts




var _permissioncontroller = require('@metamask/permission-controller');
var _snapscontrollers = require('@metamask/snaps-controllers');




var _snapsrpcmethods = require('@metamask/snaps-rpc-methods');
var _utils = require('@metamask/utils');
function getControllers(options) {
  const { controllerMessenger } = options;
  const subjectMetadataController = new (0, _permissioncontroller.SubjectMetadataController)({
    messenger: controllerMessenger.getRestricted({
      name: "SubjectMetadataController",
      allowedActions: [],
      allowedEvents: []
    }),
    subjectCacheLimit: 100
  });
  const interfaceController = new (0, _snapscontrollers.SnapInterfaceController)({
    messenger: controllerMessenger.getRestricted({
      name: "SnapInterfaceController",
      allowedActions: [
        "PhishingController:maybeUpdateState",
        "PhishingController:testOrigin",
        "ApprovalController:hasRequest",
        "ApprovalController:acceptRequest"
      ],
      allowedEvents: []
    })
  });
  const permissionController = getPermissionController(options);
  return {
    permissionController,
    subjectMetadataController,
    interfaceController
  };
}
function getPermissionController(options) {
  const { controllerMessenger } = options;
  const permissionSpecifications = _chunkBMGHZPDFjs.getPermissionSpecifications.call(void 0, options);
  return new (0, _permissioncontroller.PermissionController)({
    messenger: controllerMessenger.getRestricted({
      name: "PermissionController",
      allowedActions: [
        `ApprovalController:addRequest`,
        `ApprovalController:hasRequest`,
        `ApprovalController:acceptRequest`,
        `ApprovalController:rejectRequest`,
        `SnapController:getPermitted`,
        `SnapController:install`,
        `SubjectMetadataController:getSubjectMetadata`
      ],
      allowedEvents: []
    }),
    caveatSpecifications: {
      ..._snapsrpcmethods.caveatSpecifications,
      ..._snapsrpcmethods.endowmentCaveatSpecifications
    },
    permissionSpecifications,
    unrestrictedMethods: _chunkXAOCS6ZDjs.UNRESTRICTED_METHODS
  });
}
async function registerSnap(snapId, manifest, {
  permissionController,
  subjectMetadataController
}) {
  subjectMetadataController.addSubjectMetadata({
    origin: snapId,
    subjectType: _permissioncontroller.SubjectType.Snap
  });
  const approvedPermissions = _snapsrpcmethods.processSnapPermissions.call(void 0, 
    _utils.getSafeJson.call(void 0, manifest.initialPermissions)
  );
  permissionController.grantPermissions({
    approvedPermissions,
    subject: { origin: snapId },
    preserveExistingPermissions: false
  });
}




exports.getControllers = getControllers; exports.registerSnap = registerSnap;
//# sourceMappingURL=chunk-BCZYDPJA.js.map