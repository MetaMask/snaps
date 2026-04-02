/**
 * This file is auto generated.
 * Do not edit manually.
 */

import type { ExecutionService } from './ExecutionService';

/**
 * Terminates the Snap with the specified ID and deletes all its associated
 * data. Any subsequent messages targeting the Snap will fail with an error.
 * Throws an error if termination fails unexpectedly.
 *
 * @param snapId - The id of the Snap to be terminated.
 */
export type ExecutionServiceTerminateSnapAction = {
  type: `ExecutionService:terminateSnap`;
  handler: ExecutionService['terminateSnap'];
};

export type ExecutionServiceTerminateAllSnapsAction = {
  type: `ExecutionService:terminateAllSnaps`;
  handler: ExecutionService['terminateAllSnaps'];
};

/**
 * Initializes and executes a Snap, setting up the communication channels to the Snap etc.
 *
 * @param snapData - Data needed for Snap execution.
 * @param snapData.snapId - The ID of the Snap to execute.
 * @param snapData.sourceCode - The source code of the Snap to execute.
 * @param snapData.endowments - The endowments available to the executing Snap.
 * @returns A string `OK` if execution succeeded.
 * @throws If the execution service returns an error or execution times out.
 */
export type ExecutionServiceExecuteSnapAction = {
  type: `ExecutionService:executeSnap`;
  handler: ExecutionService['executeSnap'];
};

/**
 * Handle RPC request.
 *
 * @param snapId - The ID of the recipient Snap.
 * @param options - Bag of options to pass to the RPC handler.
 * @returns Promise that can handle the request.
 */
export type ExecutionServiceHandleRpcRequestAction = {
  type: `ExecutionService:handleRpcRequest`;
  handler: ExecutionService['handleRpcRequest'];
};

/**
 * Union of all ExecutionService action types.
 */
export type ExecutionServiceMethodActions =
  | ExecutionServiceTerminateSnapAction
  | ExecutionServiceTerminateAllSnapsAction
  | ExecutionServiceExecuteSnapAction
  | ExecutionServiceHandleRpcRequestAction;
