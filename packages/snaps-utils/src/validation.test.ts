import {
  getMockSnapFiles,
  getMockSnapFilesWithUpdatedChecksum,
  getSnapManifest,
} from './test-utils';
import { NpmSnapFileNames } from './types';
import { validateFetchedSnap } from './validation';

describe('validateFetchedSnap', () => {
  it('asserts the snap manifest is valid', async () => {
    const manifest = getSnapManifest({ version: 'foo' });
    const files = await getMockSnapFilesWithUpdatedChecksum({ manifest });

    await expect(validateFetchedSnap(files)).rejects.toThrow(
      `"${NpmSnapFileNames.Manifest}" is invalid`,
    );
  });

  it('asserts the snap checksum is valid', async () => {
    const manifest = getSnapManifest();
    const files = getMockSnapFiles({
      manifest,
      sourceCode: 'foo',
    });

    await expect(validateFetchedSnap(files)).rejects.toThrow(
      'Invalid Snap manifest: manifest shasum does not match computed shasum.',
    );
  });

  it('asserts the snap icon is valid', async () => {
    const files = await getMockSnapFilesWithUpdatedChecksum({ svgIcon: 'foo' });
    await expect(validateFetchedSnap(files)).rejects.toThrow(
      'Snap icon must be a valid SVG',
    );
  });

  it('asserts the localization files are valid', async () => {
    const manifest = getSnapManifest({
      proposedName: '{{ proposedName }}',
    });

    const files = await getMockSnapFilesWithUpdatedChecksum({
      manifest,
      localizationFiles: [{ locale: 'en', messages: {} }],
    });

    await expect(validateFetchedSnap(files)).rejects.toThrow(
      'Failed to localize Snap manifest: Failed to translate "{{ proposedName }}": No translation found for "proposedName" in "en" file.',
    );
  });
});
