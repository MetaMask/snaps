import { ExecutionServiceMessenger, SnapId } from "@metamask/snap-types";
import { JsonRpcRequest } from "@metamask/utils";
import { JsonRpcResponse } from "json-rpc-engine";
import { Duplex } from "readable-stream";

export const createOutboundRequestMiddleware = (messenger: ExecutionServiceMessenger, snapId: SnapId) => {
    const idMap = {} as any;
    const stream = new Duplex({
        objectMode: true,
        read: readNoop,
        write: processMessage,
    });

    return stream;

    function readNoop() {
        return false;
    }

    function processMessage(chunk: { name: string, data: JsonRpcRequest<unknown> | JsonRpcResponse<unknown> }, _encoding: unknown, cb: (error?: Error | null) => void) {
        if (chunk.name === 'metamask-provider' && chunk.data.id) {
            const data = chunk.data;
            if (!(chunk.data.id in idMap)) {
                idMap[chunk.data.id] = { data };
                //messenger.call('SnapController:OnOutboundRequestStart' as never, snapId as never);
            } else {
                //messenger.call('SnapController:OnOutboundRequestEnd' as never, snapId as never);
            }
        }
        console.log(snapId, "OUTBOUND", chunk);
        cb();
    }
}