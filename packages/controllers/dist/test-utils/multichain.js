"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_KEYRING_PERMISSION = exports.PERSISTED_MOCK_KEYRING_SNAP = exports.MOCK_KEYRING_BUNDLE = exports.MOCK_CONNECT_ARGUMENTS = exports.MOCK_NAMESPACES_REQUEST = exports.MOCK_BIP122_NAMESPACE_REQUEST = exports.MOCK_EIP155_NAMESPACE_REQUEST = exports.MOCK_NAMESPACES = exports.MOCK_BIP122_NAMESPACE = exports.MOCK_EIP155_NAMESPACE = exports.getMultiChainControllerWithEES = exports.getMultiChainController = exports.getMultiChainControllerMessenger = void 0;
const snap_utils_1 = require("@metamask/snap-utils");
const test_utils_1 = require("@metamask/snap-utils/test-utils");
const __1 = require("..");
const multichain_1 = require("../multichain");
const controller_1 = require("./controller");
const getMultiChainControllerMessenger = (messenger = (0, controller_1.getControllerMessenger)()) => {
    return messenger.getRestricted({
        name: 'MultiChainController',
        allowedActions: [
            'PermissionController:getPermissions',
            'PermissionController:hasPermission',
            'PermissionController:grantPermissions',
            'ApprovalController:addRequest',
            'SnapController:getAll',
            'SnapController:handleRequest',
            'SnapController:incrementActiveReferences',
            'SnapController:decrementActiveReferences',
        ],
    });
};
exports.getMultiChainControllerMessenger = getMultiChainControllerMessenger;
const getMultiChainController = () => {
    const rootMessenger = (0, controller_1.getControllerMessenger)();
    const snapControllerMessenger = (0, controller_1.getSnapControllerMessenger)(rootMessenger);
    const snapController = (0, controller_1.getSnapController)((0, controller_1.getSnapControllerOptions)({ messenger: snapControllerMessenger }));
    const multiChainControllerMessenger = (0, exports.getMultiChainControllerMessenger)(rootMessenger);
    const multiChainController = new multichain_1.MultiChainController({
        messenger: multiChainControllerMessenger,
        notify: jest.fn(),
    });
    return {
        rootMessenger,
        multiChainControllerMessenger,
        multiChainController,
        snapController,
        snapControllerMessenger,
    };
};
exports.getMultiChainController = getMultiChainController;
const getMultiChainControllerWithEES = (options = {
    snapControllerOptions: (0, controller_1.getSnapControllerWithEESOptions)(),
}) => {
    const { snapControllerOptions } = options;
    const { rootMessenger } = snapControllerOptions;
    const [snapController, executionService] = (0, controller_1.getSnapControllerWithEES)(snapControllerOptions);
    const multiChainControllerMessenger = (0, exports.getMultiChainControllerMessenger)(rootMessenger);
    const multiChainController = new multichain_1.MultiChainController({
        messenger: multiChainControllerMessenger,
        notify: jest.fn(),
    });
    return {
        rootMessenger,
        multiChainControllerMessenger,
        multiChainController,
        snapController,
        snapControllerMessenger: snapControllerOptions.messenger,
        executionService,
    };
};
exports.getMultiChainControllerWithEES = getMultiChainControllerWithEES;
exports.MOCK_EIP155_NAMESPACE = {
    methods: [
        'eth_signTransaction',
        'eth_accounts',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
    ],
    events: ['accountsChanged'],
    chains: [
        {
            id: 'eip155:1',
            name: 'Ethereum (Mainnet)',
        },
    ],
};
exports.MOCK_BIP122_NAMESPACE = {
    methods: ['signPBST', 'getExtendedPublicKey'],
    chains: [
        {
            id: 'bip122:000000000019d6689c085ae165831e93',
            name: 'Bitcoin (Mainnet)',
        },
        {
            id: 'bip122:000000000933ea01ad0ee984209779ba',
            name: 'Bitcoin (Testnet)',
        },
    ],
};
exports.MOCK_NAMESPACES = {
    eip155: exports.MOCK_EIP155_NAMESPACE,
    bip122: exports.MOCK_BIP122_NAMESPACE,
};
exports.MOCK_EIP155_NAMESPACE_REQUEST = Object.assign(Object.assign({}, exports.MOCK_EIP155_NAMESPACE), { chains: ['eip155:1'] });
exports.MOCK_BIP122_NAMESPACE_REQUEST = Object.assign(Object.assign({}, exports.MOCK_BIP122_NAMESPACE), { chains: [
        'bip122:000000000019d6689c085ae165831e93',
        'bip122:000000000933ea01ad0ee984209779ba',
    ] });
exports.MOCK_NAMESPACES_REQUEST = {
    eip155: exports.MOCK_EIP155_NAMESPACE_REQUEST,
    bip122: exports.MOCK_BIP122_NAMESPACE_REQUEST,
};
exports.MOCK_CONNECT_ARGUMENTS = {
    requiredNamespaces: exports.MOCK_NAMESPACES_REQUEST,
};
exports.MOCK_KEYRING_BUNDLE = `
class Keyring {
  async getAccounts() {
    return ['eip155:1:foo'];
  }
  async handleRequest({request}) {
    switch(request.method){
      case 'eth_accounts':
        return this.getAccounts();
    }
  }
}
module.exports.keyring = new Keyring();`;
exports.PERSISTED_MOCK_KEYRING_SNAP = (0, test_utils_1.getPersistedSnapObject)({
    id: test_utils_1.MOCK_SNAP_ID,
    sourceCode: exports.MOCK_KEYRING_BUNDLE,
    manifest: (0, test_utils_1.getSnapManifest)({
        shasum: (0, snap_utils_1.getSnapSourceShasum)(exports.MOCK_KEYRING_BUNDLE),
        initialPermissions: {
            [__1.SnapEndowments.Keyring]: {
                namespaces: exports.MOCK_NAMESPACES,
            },
        },
    }),
});
exports.MOCK_KEYRING_PERMISSION = {
    caveats: [{ type: 'snapKeyring', value: { namespaces: exports.MOCK_NAMESPACES } }],
    date: 1664187844588,
    id: 'izn0WGUO8cvq_jqvLQuQP',
    invoker: test_utils_1.MOCK_ORIGIN,
    parentCapability: __1.SnapEndowments.Keyring,
};
//# sourceMappingURL=multichain.js.map