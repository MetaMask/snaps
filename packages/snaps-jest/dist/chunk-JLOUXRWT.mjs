import {
  getPermissionSpecifications
} from "./chunk-V4KBR7UP.mjs";
import {
  UNRESTRICTED_METHODS
} from "./chunk-57SGDM5B.mjs";

// src/internals/simulation/controllers.ts
import {
  PermissionController,
  SubjectMetadataController,
  SubjectType
} from "@metamask/permission-controller";
import { SnapInterfaceController } from "@metamask/snaps-controllers";
import {
  caveatSpecifications as snapsCaveatsSpecifications,
  endowmentCaveatSpecifications as snapsEndowmentCaveatSpecifications,
  processSnapPermissions
} from "@metamask/snaps-rpc-methods";
import { getSafeJson } from "@metamask/utils";
function getControllers(options) {
  const { controllerMessenger } = options;
  const subjectMetadataController = new SubjectMetadataController({
    messenger: controllerMessenger.getRestricted({
      name: "SubjectMetadataController",
      allowedActions: [],
      allowedEvents: []
    }),
    subjectCacheLimit: 100
  });
  const interfaceController = new SnapInterfaceController({
    messenger: controllerMessenger.getRestricted({
      name: "SnapInterfaceController",
      allowedActions: [
        "PhishingController:maybeUpdateState",
        "PhishingController:testOrigin"
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
  const permissionSpecifications = getPermissionSpecifications(options);
  return new PermissionController({
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
      ...snapsCaveatsSpecifications,
      ...snapsEndowmentCaveatSpecifications
    },
    permissionSpecifications,
    unrestrictedMethods: UNRESTRICTED_METHODS
  });
}
async function registerSnap(snapId, manifest, {
  permissionController,
  subjectMetadataController
}) {
  subjectMetadataController.addSubjectMetadata({
    origin: snapId,
    subjectType: SubjectType.Snap
  });
  const approvedPermissions = processSnapPermissions(
    getSafeJson(manifest.initialPermissions)
  );
  permissionController.grantPermissions({
    approvedPermissions,
    subject: { origin: snapId },
    preserveExistingPermissions: false
  });
}

export {
  getControllers,
  registerSnap
};
//# sourceMappingURL=chunk-JLOUXRWT.mjs.map