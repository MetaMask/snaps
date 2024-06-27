import { ControllerMessenger } from '@metamask/base-controller';
import type { GenericPermissionController } from '@metamask/permission-controller';
import { SubjectMetadataController } from '@metamask/permission-controller';
import type { StoredInterface } from '@metamask/snaps-controllers';
import { IframeExecutionService, SnapInterfaceController } from '@metamask/snaps-controllers';
import type { SnapManifest, SnapRpcHookArgs, VirtualFile } from '@metamask/snaps-utils';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { SnapStatus } from './slice';
/**
 * Register the misc controller actions.
 *
 * @param controllerMessenger - The controller messenger.
 */
export declare function registerActions(controllerMessenger: ControllerMessenger<any, any>): void;
/**
 * The initialization saga is run on when the snap ID is changed and initializes the snaps execution environment.
 * This saga also creates the JSON-RPC engine and middlewares used to process RPC requests from the executing snap.
 *
 * @param action - The action itself.
 * @param action.payload - The payload of the action, in this case the snap ID.
 * @yields Puts the execution environment after creation.
 */
export declare function initSaga({ payload }: PayloadAction<string>): Generator<import("redux-saga/effects").SelectEffect | import("redux-saga/effects").PutEffect<{
    payload: IframeExecutionService;
    type: "simulation/setExecutionService";
}> | import("redux-saga/effects").PutEffect<{
    payload: GenericPermissionController;
    type: "simulation/setPermissionController";
}> | import("redux-saga/effects").PutEffect<{
    payload: SubjectMetadataController;
    type: "simulation/setSubjectMetadataController";
}> | import("redux-saga/effects").PutEffect<{
    payload: SnapInterfaceController;
    type: "simulation/setSnapInterfaceController";
}>, void, string>;
/**
 * The reboot saga, which should run when the setSourceCode action is emitted.
 * This saga will terminate existing snaps and reboot the snap with the latest source code.
 *
 * @param action - The action itself.
 * @param action.payload - The payload of the action, in this case the source code.
 * @yields Select for selecting the execution service and call to call the execution service.
 */
export declare function rebootSaga({ payload }: PayloadAction<VirtualFile<string>>): Generator<import("redux-saga/effects").SelectEffect | import("redux-saga/effects").CallEffect<string[]> | import("redux-saga/effects").CallEffect<void> | import("redux-saga/effects").CallEffect<string> | import("redux-saga/effects").PutEffect<{
    payload: SnapStatus;
    type: "simulation/setStatus";
}> | import("redux-saga/effects").PutEffect<{
    payload: Error;
    type: "console/addError";
}>, void, never>;
/**
 * The request saga, which should run when the sendRequest action is emitted.
 * This saga will send an RPC request to the snap and capture the response.
 *
 * @param action - The action itself.
 * @param action.payload - The payload of the action, in this case the RPC request.
 * @yields Select for selecting the execution service, call to call the execution service and put for storing the response.
 */
export declare function requestSaga({ payload }: PayloadAction<SnapRpcHookArgs>): Generator<import("redux-saga/effects").SelectEffect | import("redux-saga/effects").PutEffect<{
    type: string;
    payload: SnapRpcHookArgs;
}> | import("redux-saga/effects").CallEffect<unknown> | import("redux-saga/effects").PutEffect<{
    payload: import("./slice").SnapInterface;
    type: "simulation/setSnapInterface";
}> | import("redux-saga/effects").PutEffect<{
    type: string;
    payload: {
        result: unknown;
    };
}> | import("redux-saga/effects").PutEffect<{
    type: string;
    payload: {
        error: import("@metamask/snaps-sdk").JsonRpcError;
    };
}>, void, string & IframeExecutionService & StoredInterface>;
/**
 * The permissions saga, which should run when the setManifest action is emitted.
 * This saga will automatically grant the active snap all permissions defined in the snap manifest.
 *
 * @param action - The action itself.
 * @param action.payload - The payload of the action, in this case a snap manifest.
 * @yields Selects the permission controller
 */
export declare function permissionsSaga({ payload, }: PayloadAction<VirtualFile<SnapManifest>>): SagaIterator;
/**
 * The root simulation saga which runs all sagas in this file.
 *
 * @yields All sagas for the simulation feature.
 */
export declare function simulationSaga(): Generator<import("redux-saga/effects").AllEffect<import("redux-saga/effects").ForkEffect<never>>, void, unknown>;
