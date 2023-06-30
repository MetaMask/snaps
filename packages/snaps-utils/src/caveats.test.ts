import { SnapCaveatType } from './caveats';

describe('Caveat utilities', () => {
  it('exports expected caveats', () => {
    expect(SnapCaveatType.PermittedDerivationPaths).toBe(
      'permittedDerivationPaths',
    );

    expect(SnapCaveatType.PermittedCoinTypes).toBe('permittedCoinTypes');

    expect(SnapCaveatType.SnapCronjob).toBe('snapCronjob');
  });
});
