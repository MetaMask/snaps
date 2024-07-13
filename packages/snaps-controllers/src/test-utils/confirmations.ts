export const TRANSACTION_META_MOCK = {
  origin: 'http://metamask.io',
  chainId: '0x1' as const,
  id: '1',
  status: 'unapproved' as const,
  time: 123456789,
  txParams: {
    from: '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520',
    to: '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520',
    value: '0x42',
  },
};

export const PERSONAL_SIGNATURE_MOCK = {
  id: '1',
  msgParams: {
    data: '0x4578616d706c652060706572736f6e616c5f7369676e60206d657373616765',
    from: '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520',
    origin: 'https://metamask.github.io',
    signatureMethod: 'personal_sign',
  },
  status: 'unapproved',
  time: 1720523942525,
  type: 'personal_sign',
} as any;

export const TYPED_SIGNATURE_MOCK = {
  id: '1',
  msgParams: {
    data: `{"domain":{"chainId":"1","name":"Ether Mail","verifyingContract":"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC","version":"1"},"message":{"contents":"Hello, Bob!","from":{"name":"Cow","wallets":["0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826","0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF"]},"to":[{"name":"Bob","wallets":["0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB","0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57","0xB0B0b0b0b0b0B000000000000000000000000000"]}],"attachment":"0x"},"primaryType":"Mail","types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Group":[{"name":"name","type":"string"},{"name":"members","type":"Person[]"}],"Mail":[{"name":"from","type":"Person"},{"name":"to","type":"Person[]"},{"name":"contents","type":"string"},{"name":"attachment","type":"bytes"}],"Person":[{"name":"name","type":"string"},{"name":"wallets","type":"address[]"}]}}`,
    from: '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520',
    origin: 'https://metamask.github.io',
    signatureMethod: 'eth_signTypedData_v4',
    version: 'V4',
  },
  status: 'unapproved',
  time: 1720523942525,
  type: 'eth_signTypedData',
} as any;
