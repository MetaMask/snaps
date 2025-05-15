import { SNAP_EXPORT_NAMES, SNAP_EXPORTS } from './exports';

describe('SNAP_EXPORTS', () => {
  describe('validator', () => {
    it.each(Object.values(SNAP_EXPORTS))(
      'validates that the snap export is a function',
      ({ validator }) => {
        expect(validator(() => undefined)).toBe(true);
        expect(validator('')).toBe(false);
      },
    );
  });
});

describe('SNAP_EXPORT_NAMES', () => {
  it('is an array of all handler types', () => {
    expect(SNAP_EXPORT_NAMES).toStrictEqual([
      'onRpcRequest',
      'onSignature',
      'onTransaction',
      'onCronjob',
      'onInstall',
      'onUpdate',
      'onNameLookup',
      'onKeyringRequest',
      'onHomePage',
      'onSettingsPage',
      'onUserInput',
      'onAssetsLookup',
      'onAssetsConversion',
      'onAssetHistoricalPrice',
      'onProtocolRequest',
      'onClientRequest',
    ]);
  });
});
