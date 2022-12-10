import { ControllerMessenger } from '@metamask/controllers';
import { SnapRpcHookArgs } from '@metamask/snap-utils';
import { ExecutionService, ExecutionServiceActions, ExecutionServiceEvents, NodeThreadExecutionService, SnapExecutionData } from '../services';
export declare const MOCK_BLOCK_NUMBER = "0xa70e75";
export declare const getNodeEESMessenger: (messenger: ControllerMessenger<ExecutionServiceActions, ExecutionServiceEvents>) => import("@metamask/controllers").RestrictedControllerMessenger<"ExecutionService", import("../services").HandleRpcRequestAction | import("../services").ExecuteSnapAction | import("../services").TerminateSnapAction | import("../services").TerminateAllSnapsAction, import("../services").ErrorMessageEvent | import("../services").OutboundRequest | import("../services").OutboundResponse, "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse">;
export declare const getNodeEES: (messenger: import("@metamask/controllers").RestrictedControllerMessenger<"ExecutionService", import("../services").HandleRpcRequestAction | import("../services").ExecuteSnapAction | import("../services").TerminateSnapAction | import("../services").TerminateAllSnapsAction, import("../services").ErrorMessageEvent | import("../services").OutboundRequest | import("../services").OutboundResponse, "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse">) => NodeThreadExecutionService;
export declare class ExecutionEnvironmentStub implements ExecutionService {
    constructor(messenger: ReturnType<typeof getNodeEESMessenger>);
    handleRpcRequest(snapId: string, options: SnapRpcHookArgs): Promise<unknown>;
    terminateAllSnaps(): Promise<void>;
    getRpcRequestHandler(_snapId: string): Promise<({ request }: SnapRpcHookArgs) => Promise<unknown>>;
    executeSnap(_snapData: SnapExecutionData): Promise<string>;
    terminateSnap(_snapId: string): Promise<void>;
}
