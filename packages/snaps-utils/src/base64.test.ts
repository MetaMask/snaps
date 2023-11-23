import { stringToBytes } from '@metamask/utils';

import { asyncDecode, asyncEncode } from './base64';
import { VirtualFile } from './virtual-file';

describe('asyncEncode', () => {
  it('encodes vfile to base64', async () => {
    const vfile = new VirtualFile(
      stringToBytes(JSON.stringify({ foo: 'bar' })),
    );
    expect(await asyncEncode(vfile)).toBe('eyJmb28iOiJiYXIifQ==');
  });
});

describe('asyncDecode', () => {
  it('decodes base64 string to bytes', async () => {
    expect(await asyncDecode('eyJmb28iOiJiYXIifQ==')).toStrictEqual(
      stringToBytes(JSON.stringify({ foo: 'bar' })),
    );
  });
});
