import { SnapCaveatType } from './caveats';

describe('Caveat utilities', () => {
  it('exports expected caveats', () => {
    expect(SnapCaveatType.PermittedDerivationPaths).toBe(
      'permittedDerivationPaths',
    );

    expect(SnapCaveatType.PermittedCoinTypes).toBe('permittedCoinTypes');

    expect(SnapCaveatType.SnapKeyring).toBe('snapKeyring');

    expect(SnapCaveatType.SnapCronjob).toBe('snapCronjob');
  });
});
