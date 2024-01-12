import { VirtualFile } from '@metamask/snaps-utils';
import { stringToBytes } from '@metamask/utils';

import { getSnapFile } from './files';

describe('getSnapFile', () => {
  it('returns the file', async () => {
    const files = [
      new VirtualFile({
        path: 'foo',
        value: stringToBytes('bar'),
      }),
    ];

    expect(await getSnapFile(files, 'foo')).toBe('YmFy');
  });

  it('returns null if the file is not found', async () => {
    const files = [
      new VirtualFile({
        path: 'foo',
        value: stringToBytes('bar'),
      }),
    ];

    expect(await getSnapFile(files, 'bar')).toBeNull();
  });
});
