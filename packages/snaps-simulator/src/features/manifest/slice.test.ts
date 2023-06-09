import {
  INITIAL_MANIFEST_STATE,
  manifest as reducer,
  ManifestStatus,
  setResults,
  setValid,
} from './slice';

describe('manifest slice', () => {
  describe('setValid', () => {
    it('sets the status of the manifest', () => {
      const result = reducer(
        INITIAL_MANIFEST_STATE,
        setValid(ManifestStatus.Valid),
      );

      expect(result.valid).toStrictEqual(ManifestStatus.Valid);
    });
  });

  describe('setResults', () => {
    it('sets the validation results', () => {
      const result = reducer(
        INITIAL_MANIFEST_STATE,
        setResults([
          {
            name: 'foo',
            manifestName: 'bar',
            isValid: true,
          },
        ]),
      );

      expect(result.results).toStrictEqual([
        {
          name: 'foo',
          manifestName: 'bar',
          isValid: true,
        },
      ]);
    });
  });
});
