import type { RunSagaFunction } from '../../store';
declare type RequestUserApprovalParams = {
    type: string;
    requestData: {
        id: string;
    };
};
/**
 * Get the implementation of the `requestUserApproval` hook.
 *
 * @param runSaga - The function to run a saga outside the usual Redux flow.
 * @returns The implementation of the `requestUserApproval` hook.
 */
export declare function getRequestUserApprovalImplementation(runSaga: RunSagaFunction): (args_0: RequestUserApprovalParams) => Promise<any>;
export {};
