import { vol } from 'memfs';

import {
  readVFile,
  readVFileSync,
  writeVFile,
  writeVFileSync,
} from './to-vfile';
import { VFile } from './vfile';

const CONTENTS_UTF8 = 'foo\nbar';

jest.mock('fs');
jest.mock('fs/promises');

describe('to-vfile', () => {
  beforeEach(() => {
    vol.reset();
    /* eslint-disable @typescript-eslint/naming-convention */
    vol.fromJSON({
      '/foo/utf-8.txt': CONTENTS_UTF8,
    });
    /* eslint-enable @typescript-eslint/naming-convention */
  });

  describe.each([readVFile, readVFileSync])('readVFile', (testedFn) => {
    it('reads file', async () => {
      const file = await testedFn('/foo/utf-8.txt');
      expect(file).toBeInstanceOf(VFile);
      expect(typeof file.value).not.toBe('string');
      expect(file.toString()).toBe(CONTENTS_UTF8);
    });

    it('decodes file', async () => {
      const file = await testedFn('/foo/utf-8.txt', 'utf8');
      expect(file).toBeInstanceOf(VFile);
      expect(typeof file.value).toBe('string');
      expect(file.value).toBe(CONTENTS_UTF8);
    });
  });

  describe.each([writeVFile, writeVFileSync])('writeVFile', (testedFn) => {
    it('writes files', async () => {
      const PATH = '/foo/out.txt';
      await testedFn(new VFile({ value: CONTENTS_UTF8, path: PATH }));

      expect(vol.toJSON(PATH)).toStrictEqual(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        { [PATH]: CONTENTS_UTF8 },
      );
    });
  });
});
