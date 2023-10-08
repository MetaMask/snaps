"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createEndowments", {
    enumerable: true,
    get: function() {
        return createEndowments;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _globalObject = require("../globalObject");
const _commonEndowmentFactory = /*#__PURE__*/ _interop_require_default(require("./commonEndowmentFactory"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * Retrieve consolidated endowment factories for common endowments.
 */ const registeredEndowments = (0, _commonEndowmentFactory.default)();
/**
 * A map of endowment names to their factory functions. Some endowments share
 * the same factory function, but we only call each factory once for each snap.
 * See {@link createEndowments} for details.
 */ const endowmentFactories = registeredEndowments.reduce((factories, builder)=>{
    builder.names.forEach((name)=>{
        factories.set(name, builder.factory);
    });
    return factories;
}, new Map());
function createEndowments(snap, ethereum, snapId, endowments = []) {
    const attenuatedEndowments = {};
    // TODO: All endowments should be hardened to prevent covert communication
    // channels. Hardening the returned objects breaks tests elsewhere in the
    // monorepo, so further research is needed.
    const result = endowments.reduce(({ allEndowments, teardowns }, endowmentName)=>{
        // First, check if the endowment has a factory, and default to that.
        if (endowmentFactories.has(endowmentName)) {
            if (!(0, _utils.hasProperty)(attenuatedEndowments, endowmentName)) {
                // Call the endowment factory for the current endowment. If the factory
                // creates multiple endowments, they will all be assigned to the
                // `attenuatedEndowments` object, but will only be passed on to the snap
                // if explicitly listed among its endowment.
                // This may not have an actual use case, but, safety first.
                // We just confirmed that endowmentFactories has the specified key.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const { teardownFunction, ...endowment } = endowmentFactories.get(endowmentName)({
                    snapId
                });
                Object.assign(attenuatedEndowments, endowment);
                if (teardownFunction) {
                    teardowns.push(teardownFunction);
                }
            }
            allEndowments[endowmentName] = attenuatedEndowments[endowmentName];
        } else if (endowmentName === 'ethereum') {
            // Special case for adding the EIP-1193 provider.
            allEndowments[endowmentName] = ethereum;
        } else if (endowmentName in _globalObject.rootRealmGlobal) {
            (0, _snapsutils.logWarning)(`Access to unhardened global ${endowmentName}.`);
            // If the endowment doesn't have a factory, just use whatever is on the
            // global object.
            const globalValue = _globalObject.rootRealmGlobal[endowmentName];
            allEndowments[endowmentName] = globalValue;
        } else {
            // If we get to this point, we've been passed an endowment that doesn't
            // exist in our current environment.
            throw new Error(`Unknown endowment: "${endowmentName}".`);
        }
        return {
            allEndowments,
            teardowns
        };
    }, {
        allEndowments: {
            snap
        },
        teardowns: []
    });
    const teardown = async ()=>{
        await Promise.all(result.teardowns.map((teardownFunction)=>teardownFunction()));
    };
    return {
        endowments: result.allEndowments,
        teardown
    };
}

//# sourceMappingURL=index.js.map