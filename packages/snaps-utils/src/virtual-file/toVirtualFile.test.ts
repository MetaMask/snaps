import { vol } from 'memfs';

import { readVirtualFile, writeVirtualFile } from './toVirtualFile';
import { VirtualFile } from './VirtualFile';

const CONTENTS_UTF8 = 'foo\nbar';

jest.mock('fs');

describe('toVirtualFile', () => {
  beforeEach(() => {
    vol.reset();
    /* eslint-disable @typescript-eslint/naming-convention */
    vol.fromJSON({
      '/foo/utf-8.txt': CONTENTS_UTF8,
    });
    /* eslint-enable @typescript-eslint/naming-convention */
  });

  describe('readVirtualFile', () => {
    it('reads file', async () => {
      const file = await readVirtualFile('/foo/utf-8.txt');
      expect(file).toBeInstanceOf(VirtualFile);
      expect(typeof file.value).not.toBe('string');
      expect(file.toString()).toBe(CONTENTS_UTF8);
    });

    it('decodes file', async () => {
      const file = await readVirtualFile('/foo/utf-8.txt', 'utf8');
      expect(file).toBeInstanceOf(VirtualFile);
      expect(typeof file.value).toBe('string');
      expect(file.value).toBe(CONTENTS_UTF8);
    });
  });

  describe('writeVirtualFile', () => {
    it('writes files', async () => {
      const PATH = '/foo/out.txt';
      await writeVirtualFile(
        new VirtualFile({ value: CONTENTS_UTF8, path: PATH }),
      );

      expect(vol.toJSON(PATH)).toStrictEqual(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        { [PATH]: CONTENTS_UTF8 },
      );
    });
  });
});
