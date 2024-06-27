import type { ControllerMessenger } from '@metamask/base-controller';
import type { CaveatSpecificationConstraint, PermissionSpecificationConstraint, PermissionControllerActions, SubjectMetadataControllerActions } from '@metamask/permission-controller';
import { PermissionController, SubjectMetadataController } from '@metamask/permission-controller';
import { SnapInterfaceController } from '@metamask/snaps-controllers';
import type { ExecutionServiceActions, SnapInterfaceControllerActions, SnapInterfaceControllerAllowedActions } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import type { SnapManifest } from '@metamask/snaps-utils';
import type { SimulationOptions } from './options';
import type { MiddlewareHooks } from './simulation';
import type { RunSagaFunction } from './store';
export declare type RootControllerAllowedActions = SnapInterfaceControllerActions | SnapInterfaceControllerAllowedActions | PermissionControllerActions | ExecutionServiceActions | SubjectMetadataControllerActions;
export declare type RootControllerMessenger = ControllerMessenger<RootControllerAllowedActions, any>;
export declare type GetControllersOptions = {
    controllerMessenger: ControllerMessenger<any, any>;
    hooks: MiddlewareHooks;
    runSaga: RunSagaFunction;
    options: SimulationOptions;
};
export declare type Controllers = {
    permissionController: PermissionController<PermissionSpecificationConstraint, CaveatSpecificationConstraint>;
    subjectMetadataController: SubjectMetadataController;
    interfaceController: SnapInterfaceController;
};
/**
 * Get the controllers for the Snap.
 *
 * @param options - The options.
 * @returns The controllers for the Snap.
 */
export declare function getControllers(options: GetControllersOptions): Controllers;
/**
 * Register the Snap. This sets up the Snap's permissions and subject metadata.
 *
 * @param snapId - The ID of the Snap to install.
 * @param manifest - The parsed manifest.
 * @param controllers - The controllers for the Snap.
 * @param controllers.permissionController - The permission controller.
 * @param controllers.subjectMetadataController - The subject metadata controller.
 */
export declare function registerSnap(snapId: SnapId, manifest: SnapManifest, { permissionController, subjectMetadataController, }: Omit<Controllers, 'interfaceController'>): Promise<void>;
