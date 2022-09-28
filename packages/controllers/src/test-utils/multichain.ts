import { getSnapSourceShasum } from '@metamask/snap-utils';
import {
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
  getSnapManifest,
} from '@metamask/snap-utils/test-utils';
import { SnapEndowments } from '..';
import { MultiChainController } from '../multichain';
import {
  getControllerMessenger,
  getSnapController,
  getSnapControllerMessenger,
  getSnapControllerOptions,
  getSnapControllerWithEES,
  getSnapControllerWithEESOptions,
} from './controller';

export const getMultiChainControllerMessenger = (
  messenger: ReturnType<
    typeof getControllerMessenger
  > = getControllerMessenger(),
) => {
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

export const getMultiChainController = () => {
  const rootMessenger = getControllerMessenger();
  const snapControllerMessenger = getSnapControllerMessenger(rootMessenger);
  const snapController = getSnapController(
    getSnapControllerOptions({ messenger: snapControllerMessenger }),
  );
  const multiChainControllerMessenger =
    getMultiChainControllerMessenger(rootMessenger);
  const multiChainController = new MultiChainController({
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

export const getMultiChainControllerWithEES = () => {
  const rootMessenger = getControllerMessenger();
  const snapControllerOptions = getSnapControllerWithEESOptions({
    rootMessenger,
  });
  const [snapController, executionService] = getSnapControllerWithEES(
    snapControllerOptions,
  );
  const multiChainControllerMessenger =
    getMultiChainControllerMessenger(rootMessenger);
  const multiChainController = new MultiChainController({
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

export const MOCK_EIP155_NAMESPACE = {
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

export const MOCK_BIP122_NAMESPACE = {
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

export const MOCK_NAMESPACES = {
  eip155: MOCK_EIP155_NAMESPACE,
  bip122: MOCK_BIP122_NAMESPACE,
};

export const MOCK_EIP155_NAMESPACE_REQUEST = {
  ...MOCK_EIP155_NAMESPACE,
  chains: ['eip155:1'],
};

export const MOCK_BIP122_NAMESPACE_REQUEST = {
  ...MOCK_BIP122_NAMESPACE,
  chains: [
    'bip122:000000000019d6689c085ae165831e93',
    'bip122:000000000933ea01ad0ee984209779ba',
  ],
};

export const MOCK_NAMESPACES_REQUEST = {
  eip155: MOCK_EIP155_NAMESPACE_REQUEST,
  bip122: MOCK_BIP122_NAMESPACE_REQUEST,
};

export const MOCK_CONNECT_ARGUMENTS = {
  requiredNamespaces: MOCK_NAMESPACES_REQUEST,
};

export const MOCK_KEYRING_BUNDLE = `
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

export const MOCK_KEYRING_SNAP = {
  origin: MOCK_ORIGIN,
  id: MOCK_SNAP_ID,
  sourceCode: MOCK_KEYRING_BUNDLE,
  manifest: getSnapManifest({
    shasum: getSnapSourceShasum(MOCK_KEYRING_BUNDLE),
    initialPermissions: {
      [SnapEndowments.Keyring]: {
        namespaces: MOCK_NAMESPACES,
      },
    },
  }),
};

export const MOCK_KEYRING_PERMISSION = {
  caveats: [{ type: 'snapKeyring', value: { namespaces: MOCK_NAMESPACES } }],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_ORIGIN,
  parentCapability: SnapEndowments.Keyring,
};
