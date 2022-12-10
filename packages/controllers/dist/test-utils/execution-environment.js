"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionEnvironmentStub = exports.getNodeEES = exports.getNodeEESMessenger = exports.MOCK_BLOCK_NUMBER = void 0;
const json_rpc_engine_1 = require("json-rpc-engine");
const json_rpc_middleware_stream_1 = require("json-rpc-middleware-stream");
const pump_1 = __importDefault(require("pump"));
const services_1 = require("../services");
exports.MOCK_BLOCK_NUMBER = '0xa70e75';
const getNodeEESMessenger = (messenger) => messenger.getRestricted({
    name: 'ExecutionService',
    allowedEvents: [
        'ExecutionService:unhandledError',
        'ExecutionService:outboundRequest',
        'ExecutionService:outboundResponse',
    ],
    allowedActions: [
        'ExecutionService:executeSnap',
        'ExecutionService:handleRpcRequest',
        'ExecutionService:terminateAllSnaps',
        'ExecutionService:terminateSnap',
    ],
});
exports.getNodeEESMessenger = getNodeEESMessenger;
const getNodeEES = (messenger) => new services_1.NodeThreadExecutionService({
    messenger,
    setupSnapProvider: jest.fn().mockImplementation((_snapId, rpcStream) => {
        const mux = (0, services_1.setupMultiplex)(rpcStream, 'foo');
        const stream = mux.createStream('metamask-provider');
        const engine = new json_rpc_engine_1.JsonRpcEngine();
        engine.push((req, res, next, end) => {
            if (req.method === 'metamask_getProviderState') {
                res.result = { isUnlocked: false, accounts: [] };
                return end();
            }
            else if (req.method === 'eth_blockNumber') {
                res.result = exports.MOCK_BLOCK_NUMBER;
                return end();
            }
            return next();
        });
        const providerStream = (0, json_rpc_middleware_stream_1.createEngineStream)({ engine });
        (0, pump_1.default)(stream, providerStream, stream);
    }),
});
exports.getNodeEES = getNodeEES;
class ExecutionEnvironmentStub {
    constructor(messenger) {
        messenger.registerActionHandler(`ExecutionService:handleRpcRequest`, (snapId, options) => this.handleRpcRequest(snapId, options));
        messenger.registerActionHandler('ExecutionService:executeSnap', (snapData) => this.executeSnap(snapData));
        messenger.registerActionHandler('ExecutionService:terminateSnap', (snapId) => this.terminateSnap(snapId));
        messenger.registerActionHandler('ExecutionService:terminateAllSnaps', () => this.terminateAllSnaps());
    }
    async handleRpcRequest(snapId, options) {
        const handler = await this.getRpcRequestHandler(snapId);
        return handler(options);
    }
    async terminateAllSnaps() {
        // empty stub
    }
    async getRpcRequestHandler(_snapId) {
        return ({ request }) => {
            return new Promise((resolve) => {
                const results = `${request.method}${request.id}`;
                resolve(results);
            });
        };
    }
    async executeSnap(_snapData) {
        return 'some-unique-id';
    }
    async terminateSnap(_snapId) {
        // empty stub
    }
}
exports.ExecutionEnvironmentStub = ExecutionEnvironmentStub;
//# sourceMappingURL=execution-environment.js.map