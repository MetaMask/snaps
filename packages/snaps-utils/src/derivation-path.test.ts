import {
  getSlip44ProtocolName,
  getSnapDerivationPathName,
} from './derivation-paths';

describe('getSnapDerivationPathName', () => {
  it('returns a name from the hardcoded list', () => {
    expect(getSnapDerivationPathName(['m', `44'`, `784'`], 'ed25519')).toBe(
      'Sui',
    );
  });

  it("returns a name from the hardcoded list starting with `1852'`, `1815'`", () => {
    expect(
      getSnapDerivationPathName(['m', `1852'`, `1815'`], 'ed25519Bip32'),
    ).toBe('Cardano');
  });

  it('returns a name from the SLIP44 list where applicable', () => {
    expect(
      getSnapDerivationPathName(['m', `44'`, `60'`, `0'`], 'secp256k1'),
    ).toBe('Ethereum');
  });

  it('returns null if we fail to use SLIP44', () => {
    expect(
      getSnapDerivationPathName(['m', `44'`, `999999999'`, `0'`], 'secp256k1'),
    ).toBeNull();
  });

  it('returns null if no name found', () => {
    expect(
      getSnapDerivationPathName(['m', `44'`, `60'`, `0'`], 'ed25519'),
    ).toBeNull();
  });
});

describe('getSlip44ProtocolName', () => {
  it('returns "Test Networks" for coinType 1', () => {
    expect(getSlip44ProtocolName(1)).toBe('Test Networks');
  });

  it('returns a value from the SLIP44 list', () => {
    expect(getSlip44ProtocolName(60)).toBe('Ethereum');
  });

  it('returns null for values not in the list', () => {
    expect(getSlip44ProtocolName(999999999)).toBeNull();
  });
});
