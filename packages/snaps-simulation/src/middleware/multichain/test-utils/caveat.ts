export const MOCK_CAVEAT = {
  type: 'authorizedScopes',
  value: {
    requiredScopes: {},
    optionalScopes: {
      'eip155:1': {
        methods: ['personal_sign', 'eth_signTypedData_v4'],
        notifications: [],
        accounts: ['eip155:1:0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf'],
      },
      'eip155:11155111': {
        methods: ['personal_sign', 'eth_signTypedData_v4'],
        notifications: [],
        accounts: [
          'eip155:11155111:0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
        ],
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
        methods: ['signMessage', 'getGenesisHash'],
        notifications: [],
        accounts: [],
      },
    },
    sessionProperties: {},
    isMultichainOrigin: true,
  },
};
