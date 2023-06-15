import { getSnapFiles, getSnapManifest } from './test-utils';
import { NpmSnapFileNames } from './types';
import { validateFetchedSnap } from './validation';

describe('validateFetchedSnap', () => {
  it('asserts the snap manifest is valid', () => {
    const manifest = getSnapManifest({ version: 'foo' });
    const files = getSnapFiles({ manifest });
    expect(() => validateFetchedSnap(files)).toThrow(
      `"${NpmSnapFileNames.Manifest}" is invalid`,
    );
  });

  it('asserts the snap checksum is valid', () => {
    const manifest = getSnapManifest();
    const files = getSnapFiles({
      manifest,
      sourceCode: 'foo',
      updateChecksum: false,
    });
    expect(() => validateFetchedSnap(files)).toThrow(
      'Invalid Snap manifest: manifest shasum does not match computed shasum.',
    );
  });

  it('asserts the snap icon is valid', () => {
    const files = getSnapFiles({ svgIcon: 'foo' });
    expect(() => validateFetchedSnap(files)).toThrow(
      'Snap icon must be a valid SVG',
    );
  });
});
