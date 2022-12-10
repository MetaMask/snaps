"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRestrictedCronjobControllerMessenger = exports.getRootCronjobControllerMessenger = exports.getPersistedSnapsState = exports.getSnapControllerWithEES = exports.getSnapController = exports.getSnapControllerWithEESOptions = exports.getSnapControllerOptions = exports.getSnapControllerMessenger = exports.getControllerMessenger = void 0;
const controllers_1 = require("@metamask/controllers");
const test_utils_1 = require("@metamask/snap-utils/test-utils");
const snaps_1 = require("../snaps");
const execution_environment_1 = require("./execution-environment");
const getControllerMessenger = () => new controllers_1.ControllerMessenger();
exports.getControllerMessenger = getControllerMessenger;
const getSnapControllerMessenger = (messenger = (0, exports.getControllerMessenger)(), mocked = true) => {
    const m = messenger.getRestricted({
        name: 'SnapController',
        allowedEvents: [
            'ExecutionService:unhandledError',
            'ExecutionService:outboundRequest',
            'ExecutionService:outboundResponse',
            'SnapController:snapAdded',
            'SnapController:snapBlocked',
            'SnapController:snapInstalled',
            'SnapController:snapUnblocked',
            'SnapController:snapUpdated',
            'SnapController:snapRemoved',
            'SnapController:stateChange',
        ],
        allowedActions: [
            'ApprovalController:addRequest',
            'ExecutionService:executeSnap',
            'ExecutionService:terminateAllSnaps',
            'ExecutionService:terminateSnap',
            'ExecutionService:handleRpcRequest',
            'PermissionController:getEndowments',
            'PermissionController:hasPermission',
            'PermissionController:hasPermissions',
            'PermissionController:getPermissions',
            'PermissionController:grantPermissions',
            'PermissionController:revokeAllPermissions',
            'SnapController:get',
            'SnapController:handleRequest',
            'SnapController:getSnapState',
            'SnapController:has',
            'SnapController:updateSnapState',
            'SnapController:clearSnapState',
            'SnapController:updateBlockedSnaps',
            'SnapController:enable',
            'SnapController:disable',
            'SnapController:remove',
            'SnapController:getAll',
            'SnapController:getPermitted',
            'SnapController:install',
            'SnapController:removeSnapError',
            'SnapController:incrementActiveReferences',
            'SnapController:decrementActiveReferences',
        ],
    });
    if (mocked) {
        jest.spyOn(m, 'call').mockImplementation((method, ...args) => {
            // Return false for long-running by default, and true for everything else.
            if (method === 'PermissionController:hasPermission' &&
                args[1] === snaps_1.SnapEndowments.LongRunning) {
                return false;
            }
            else if (method === 'ApprovalController:addRequest') {
                return args[0].requestData;
            }
            return true;
        });
    }
    return m;
};
exports.getSnapControllerMessenger = getSnapControllerMessenger;
const getSnapControllerOptions = (opts) => {
    const options = Object.assign({ environmentEndowmentPermissions: [], closeAllConnections: jest.fn(), getAppKey: jest
            .fn()
            .mockImplementation((snapId, appKeyType) => `${appKeyType}:${snapId}`), messenger: (0, exports.getSnapControllerMessenger)(), featureFlags: { dappsCanUpdateSnaps: true }, checkBlockList: jest
            .fn()
            .mockImplementation(async (snaps) => {
            return Object.keys(snaps).reduce((acc, snapId) => (Object.assign(Object.assign({}, acc), { [snapId]: { blocked: false } })), {});
        }), state: undefined }, opts);
    options.state = Object.assign({ snaps: {}, snapErrors: {}, snapStates: {} }, options.state);
    return options;
};
exports.getSnapControllerOptions = getSnapControllerOptions;
const getSnapControllerWithEESOptions = (opts = {}) => {
    const { rootMessenger = (0, exports.getControllerMessenger)() } = opts;
    const snapControllerMessenger = (0, exports.getSnapControllerMessenger)(rootMessenger, false);
    const originalCall = snapControllerMessenger.call.bind(snapControllerMessenger);
    jest
        .spyOn(snapControllerMessenger, 'call')
        .mockImplementation((method, ...args) => {
        // Mock long running permission, call actual implementation for everything else
        if (method === 'PermissionController:hasPermission' &&
            args[1] === snaps_1.SnapEndowments.LongRunning) {
            return false;
        }
        return originalCall(method, ...args);
    });
    return Object.assign(Object.assign({ environmentEndowmentPermissions: [], closeAllConnections: jest.fn(), getAppKey: jest
            .fn()
            .mockImplementation((snapId, appKeyType) => `${appKeyType}:${snapId}`), messenger: snapControllerMessenger }, opts), { rootMessenger });
};
exports.getSnapControllerWithEESOptions = getSnapControllerWithEESOptions;
const getSnapController = (options = (0, exports.getSnapControllerOptions)()) => {
    return new snaps_1.SnapController(options);
};
exports.getSnapController = getSnapController;
const getSnapControllerWithEES = (options = (0, exports.getSnapControllerWithEESOptions)(), service) => {
    const _service = service !== null && service !== void 0 ? service : (0, execution_environment_1.getNodeEES)((0, execution_environment_1.getNodeEESMessenger)(options.rootMessenger));
    const controller = new snaps_1.SnapController(options);
    return [controller, _service];
};
exports.getSnapControllerWithEES = getSnapControllerWithEES;
const getPersistedSnapsState = (...snaps) => {
    return (snaps.length > 0 ? snaps : [(0, test_utils_1.getPersistedSnapObject)()]).reduce((snapsState, snapObject) => {
        snapsState[snapObject.id] = snapObject;
        return snapsState;
    }, {});
};
exports.getPersistedSnapsState = getPersistedSnapsState;
// Mock controller messenger for Cronjob Controller
const getRootCronjobControllerMessenger = () => new controllers_1.ControllerMessenger();
exports.getRootCronjobControllerMessenger = getRootCronjobControllerMessenger;
const getRestrictedCronjobControllerMessenger = (messenger = (0, exports.getRootCronjobControllerMessenger)(), mocked = true) => {
    const m = messenger.getRestricted({
        name: 'CronjobController',
        allowedEvents: [
            'ExecutionService:unhandledError',
            'ExecutionService:outboundRequest',
            'ExecutionService:outboundResponse',
            'SnapController:snapAdded',
            'SnapController:snapBlocked',
            'SnapController:snapInstalled',
            'SnapController:snapUnblocked',
            'SnapController:snapUpdated',
            'SnapController:snapRemoved',
        ],
        allowedActions: [
            'ApprovalController:addRequest',
            'ExecutionService:executeSnap',
            'ExecutionService:terminateAllSnaps',
            'ExecutionService:terminateSnap',
            'ExecutionService:handleRpcRequest',
            'PermissionController:getEndowments',
            'PermissionController:hasPermission',
            'PermissionController:hasPermissions',
            'PermissionController:getPermissions',
            'SnapController:handleRequest',
        ],
    });
    if (mocked) {
        jest.spyOn(m, 'call').mockImplementation((method, ...args) => {
            // Return false for long-running by default, and true for everything else.
            if (method === 'PermissionController:hasPermission' &&
                args[1] === snaps_1.SnapEndowments.LongRunning) {
                return false;
            }
            return true;
        });
    }
    return m;
};
exports.getRestrictedCronjobControllerMessenger = getRestrictedCronjobControllerMessenger;
//# sourceMappingURL=controller.js.map