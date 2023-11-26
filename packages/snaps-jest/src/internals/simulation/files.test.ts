import { VirtualFile } from '@metamask/snaps-utils';
import { stringToBytes } from '@metamask/utils';

import { getSnapFile } from './files';

describe('getSnapFile', () => {
  it('returns the file', () => {
    const files = [
      new VirtualFile({
        path: 'foo',
        value: stringToBytes('bar'),
      }),
    ];

    expect(getSnapFile(files, 'foo')).toBe('YmFy');
  });

  it('returns null if the file is not found', () => {
    const files = [
      new VirtualFile({
        path: 'foo',
        value: stringToBytes('bar'),
      }),
    ];

    expect(getSnapFile(files, 'bar')).toBeNull();
  });
});
